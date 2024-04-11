import { BrowserContext, Response } from "playwright";
import { CompanyCrawlerData, JobCrawlerData, JobFilterOption } from "common/model";
import { cities } from "common/constants/cities.js";
import { SiteTag } from "common/model";
import { PageCrawl, DataParser } from "../common/index.js";
import { paseJob, RawCompData, RawJobData } from "./classes/common_parser.js";
import { PageNumControllable } from "./classes/page_controller.js";
import { afterTime } from "evlib";
import { FilterIteratorFx, ACTION_TIMEOUT, DeepAssignFilter } from "../../classes/crawl_action.js";

import { removeUndefinedKey } from "evlib";
import * as querystring from "node:querystring";

/**
 * @event data {jobList:object[], compList:object[]}
 * @event request url:string
 * @event auth    //页面需要验证码
 */
export class LiePinJobList extends PageCrawl {
  constructor(context: BrowserContext, readonly origin: string) {
    super(context);
  }
  readonly siteTag = SiteTag.liepin;

  async open(options?: JobFilterOption, timeout?: number) {
    let paramsStr = "?";
    if (options) {
      if (options.city) {
        let city = cities.find((c) => c._id === options.city);
        if (!city) throw new Error("不存在该城市");
        paramsStr += "city=" + city.liepinCode + "&dq=" + city.liepinCode;
      }
      if (options.emitTime) {
        paramsStr += "&pubTime=" + options.emitTime;
      }
    }
    return this.openUseParams(paramsStr, timeout);
  }
  async openUseLine(cityId?: number) {
    let city = cityId ? cities.find((c) => c._id === cityId)?.liepinCode : undefined;
    return this.openUseParams({
      salary: filter.salary[0].code,
      workYearCode: filter.workYearCode[0].code,
      eduLevel: filter.eduLevel[0].code,
      compScale: filter.compScale[0].code,
      compStage: filter.compStage[0].code,
      ...(city ? { city, dq: city } : null),
    });
  }
  async openUseParams(params: string | LiePinFilterOption, timeout = 20 * 1000) {
    let paramsStr = typeof params === "string" ? params : querystring.stringify(params);
    let page = await super.newPage();
    const urlChecker = /liepin.com\/api\/com.liepin.searchfront4c.pc-search-job$/;
    page.on("response", (res) => {
      if (/safe\.liepin\.com\/page\/liepin\/captchaPage_ip_PC/.test(res.url())) {
        this.emit("auth");
        return;
      }
      if (urlChecker.test(res.url())) {
        if (res.ok()) {
          this.onResponse(res);
        } else {
          this.reportError({ msg: "响应状态码异常", status: res.status(), statusText: res.statusText() });
        }
      }
    });
    page.on("request", (req) => {
      if (urlChecker.test(req.url())) {
        this.emit("request", req.url());
      }
    });
    const url = this.origin + "/zhaopin/?" + paramsStr;
    await page.goto(url, { timeout });

    let pageCtrl = new JobPageController(page);
    await page.locator(".filter-options-container").focus({ timeout: 30000 });
    return pageCtrl;
  }
  async loadFin() {}
  private async onResponse(res: Response) {
    let data: ResData[] = (await res.json().catch(() => {}))?.data?.data?.jobCardList ?? [];

    const resData = this.paseData(data);
    this.pageCrawlFin(resData);
  }

  private paseData(data: ResData[]) {
    const jobList: JobCrawlerData[] = [];
    const compList: CompanyCrawlerData[] = [];
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      let job = item.job;
      let company = item.comp;
      let compData;
      if (company.compId) {
        try {
          compData = this.paseCompany(company);
          compList.push(compData);
        } catch (error) {
          this.reportError({ msg: "执行解析公司错误", err: (error as Error).stack });
        }
      }
      try {
        const { data, errors } = paseJob(job, this.siteTag, {
          companyId: compData?.companyId,
          industry: compData?.companyData.industry,
          scale: compData?.companyData.scale,
        });
        jobList.push(data);
        errors.forEach((err) => this.reportError(err));
      } catch (error) {
        this.reportError({ msg: "执行解析职位错误", err: (error as Error).toString() });
      }
    }
    return { jobList, compList };
  }
  paseCompany(company: RawCompData): CompanyCrawlerData {
    return removeUndefinedKey({
      companyData: {
        name: company.compName,
        scale: DataParser.paseScale(company.compScale),
        industry: company.compIndustry,
        welfareLabel: [],
      },
      companyId: company.compId?.toString(),
      siteTag: SiteTag.liepin,
    });
  }

  skipListToFilterCodeMap(skinList: number[]) {
    let filterList = Object.entries(filter);
    let map: Record<string, string> = {};
    for (const skinCount of skinList) {
      let item = filterList[skinCount];
      let key = item[0];
      let val = item[1][skinCount];
      map[key] = val.code;
    }
    return map;
  }
}

function unfoldTime() {
  return afterTime(300);
}

class JobPageController extends PageNumControllable {
  // async setEmitTime(cityId: string) {}
  // async setIndustry(cityId: string) {}

  //7
  async *salary(skipCount = 0) {
    let list = await this.getBasicFilters("薪资").locator(".options-item").all();
    for (let i = skipCount; i < list.length; i++) {
      let item = list[i];
      yield await item.click({ timeout: ACTION_TIMEOUT }).then(
        () => true,
        () => false
      );
    }
    return await this.getFilterClearIcon("salary")
      .click({ timeout: ACTION_TIMEOUT })
      .then(
        () => true,
        () => false
      );
  }
  //7
  async *experience(skipCount = 0) {
    let list = await this.getBasicFilters("经验").locator(".options-item").all();
    for (let i = skipCount; i < list.length; i++) {
      let item = list[i];
      yield await item.click({ timeout: ACTION_TIMEOUT }).then(
        () => true,
        () => false
      );
    }
    return await this.getFilterClearIcon("workYearCode")
      .click({ timeout: ACTION_TIMEOUT })
      .then(
        () => true,
        () => false
      );
  }
  //7
  async *education(skipCount = 0, list = ["初中及以下", "高中", "中专/中技", "大专", "本科", "硕士", "博士"]) {
    // let lastStr = "学历";
    let loc = await this.getOtherFilters().nth(0);
    for (let i = skipCount; i < list.length; i++) {
      let str = list[i];
      try {
        await loc.click({ timeout: ACTION_TIMEOUT });
        await unfoldTime();
        await this.clickSelector(str);
        // lastStr = str;
        yield true;
      } catch (error) {
        yield false;
      }
    }
    return await this.getFilterClearIcon("eduLevel")
      .click({ timeout: ACTION_TIMEOUT })
      .then(
        () => true,
        () => false
      );
  }

  //8
  async *compScale(
    skipCount = 0,
    list = ["1-49人", "50-99人", "100-499人", "500-999人", "1000-2000人", "2000-5000人", "5000-10000人", "10000人以上"]
  ) {
    let loc = await this.getOtherFilters().nth(3);
    for (let i = skipCount; i < list.length; i++) {
      let str = list[i];
      try {
        await loc.click({ timeout: ACTION_TIMEOUT });
        await unfoldTime();
        await this.clickSelector(str);
        yield true;
      } catch (error) {
        yield false;
      }
    }
    return this.getFilterClearIcon("compScale")
      .click({ timeout: ACTION_TIMEOUT })
      .then(
        () => true,
        () => false
      );
  }
  //6
  async *financingStage(
    skinList = 0,
    list = ["天使轮", "A轮", "B轮", "C轮", "D轮及以上", "已上市", "战略融资", "融资未公开", "其他"]
  ) {
    //融资阶段
    let loc = await this.getOtherFilters().nth(4);
    for (let i = skinList; i < list.length; i++) {
      let str = list[i];
      try {
        await loc.click({ timeout: ACTION_TIMEOUT });
        await unfoldTime();
        await this.clickSelector(str);
        yield true;
      } catch (error) {
        yield false;
      }
    }
    return this.getFilterClearIcon("compStage")
      .click({ timeout: ACTION_TIMEOUT })
      .then(
        () => true,
        () => false
      );
  }
  get iterationSequence(): FilterIteratorFx[] {
    return [this.salary, this.experience, this.education, this.compScale, this.financingStage].map((fx) =>
      fx.bind(this)
    );
  }
  createDeepAssignFilter() {
    let list = this.iterationSequence;
    return new DeepAssignFilter(list, [7, 7, 7, 8, 8]);
  }
  private getFilterClearIcon(key: string) {
    return this.page.locator(
      `.selected-options-box .selected-options-list-box .selected-item[data-key='${key}'] .anticon-close`
    );
  }
  private getBasicFilters(title?: string) {
    let loc = this.page.locator(".filter-options-container .filter-options-row-section >.options-row");
    return title ? loc.filter({ hasText: title }) : loc;
  }
  private getOtherFilters() {
    return this.page.locator(
      ".filter-options-container .filter-options-selector-section .row-options-detail-box .select-box"
    );
  }
  private async clickSelector(text: string) {
    let loc = this.page.locator(".ant-select-dropdown .rc-virtual-list-holder .ant-select-item");
    return loc.getByText(text).click({ timeout: ACTION_TIMEOUT });
  }

  async isEmpty() {
    let res = await this.page
      .locator(".content-left-section .ant-empty")
      .filter({ hasText: "暂时没有合适的职位" })
      .count();
    return !!res;
  }
  async isFullList() {
    let count = await this.page.locator(".content-left-section .job-list-box>div").count();
    return count === 40;
  }
  async *pageNumIterator(errors: any[]): AsyncGenerator<boolean, void, void> {
    while (
      await this.hasNextPage().catch(() => {
        errors.push({ message: "判断是否有下一页时出现异常" });
      })
    ) {
      yield this.nextPage().then(
        () => true,
        () => {
          errors.push({ message: "转跳下一页时出现异常" });
          return false;
        }
      );
    }
  }
}

export type { JobPageController as PageController };

type ResData = { job: RawJobData; comp: RawCompData };

type LiePinFilter = {
  city: string;
  dq: string; //具体地区
  pubTime: string; //发布时间
  // key: string;
  // suggestTag: string;
  workYearCode: string; //工作经验
  industry: string; //行业
  salary: string; //新增

  compScale: string; //公司规模
  compKind: string; //企业性质
  compStage: string; //融资阶段
  eduLevel: string; //学历
  // compTag: string;

  // otherCity: string;
  // sfrom: string;
  // ckId: string;
  // scene: string;
  // skId: string;
  // fkId: string;
  // suggestId: string;
};
export type LiePinFilterOption = Partial<LiePinFilter>;

let filter = {
  salary: [
    { code: "0$3", name: "3K以下" },
    { code: "3$5", name: "3K-5k" },
    { code: "5$10", name: "5K-10k" },
    { code: "10$20", name: "10K-20k" },
    { code: "20$40", name: "20K-40k" },
    { code: "40$60", name: "40K-60k" },
    { code: "60$999", name: "60K以上" },
  ],
  workYearCode: [
    { code: "1", name: "应届生" },
    { code: "2", name: "实习生" },
    { code: "0$1", name: "1年以内" },
    { code: "1$3", name: "1-3年" },
    { code: "3$5", name: "3-5年" },
    { code: "5$10", name: "5-10年" },
    { code: "10$999", name: "10年以上" },
  ],
  eduLevel: [
    { code: "010", name: "博士" },
    { code: "030", name: "硕士" },
    { code: "040", name: "本科" },
    { code: "050", name: "大专" },
    { code: "060", name: "中专/中技" },
    { code: "080", name: "高中" },
    { code: "090", name: "初中及以下" },
  ],
  compScale: [
    { code: "010", name: "1-49人" },
    { code: "020", name: "50-99人" },
    { code: "030", name: "100-499人" },
    { code: "040", name: "500-999人" },
    { code: "050", name: "1000-2000人" },
    { code: "060", name: "2000-5000人" },
    { code: "070", name: "5000-10000人" },
    { code: "080", name: "10000人以上" },
  ],
  compStage: [
    { code: "01", name: "天使轮" },
    { code: "02", name: "A轮" },
    { code: "03", name: "B轮" },
    { code: "04", name: "C轮" },
    { code: "05", name: "D轮及以上" },
    { code: "06", name: "已上市" },
    { code: "07", name: "战略融资" },
    { code: "08", name: "融资未公开" },
    { code: "99", name: "其他" },
  ],
  pubTime: [
    { code: "", name: "不限" },
    { code: "1", name: "一天以内" },
    { code: "3", name: "三天以内" },
    { code: "7", name: "一周以内" },
    { code: "30", name: "一个月以内" },
  ],
};

let industryFilter = [
  {
    children: [
      {
        code: "H01",
        name: "不限",
      },
      {
        code: "H0001",
        name: "游戏",
      },
      {
        code: "H0002",
        name: "电子商务",
      },
      {
        code: "H0003",
        name: "新零售",
      },
      {
        code: "H0004",
        name: "在线社交/媒体",
      },
      {
        code: "H0005",
        name: "生活服务O2O",
      },
      {
        code: "H0006",
        name: "在线教育",
      },
      {
        code: "H0007",
        name: "互联网医疗",
      },
      {
        code: "H0008",
        name: "云计算/大数据",
      },
      {
        code: "H0009",
        name: "人工智能",
      },
      {
        code: "H0010",
        name: "物联网",
      },
      {
        code: "H0011",
        name: "区块链",
      },
      {
        code: "H0012",
        name: "网络/信息安全",
      },
      {
        code: "H0013",
        name: "计算机软件",
      },
      {
        code: "H0014",
        name: "计算机硬件",
      },
      {
        code: "H0015",
        name: "智能硬件",
      },
      {
        code: "H0016",
        name: "IT服务",
      },
      {
        code: "H0017",
        name: "互联网",
      },
    ],
    code: "H01",
    name: "IT/互联网/游戏",
  },
  {
    children: [
      {
        code: "H02",
        name: "不限",
      },
      {
        code: "H0018",
        name: "电子/半导体/集成电路",
      },
      {
        code: "H0019",
        name: "智能硬件",
      },
      {
        code: "H0020",
        name: "运营商/增值服务",
      },
      {
        code: "H0021",
        name: "通信设备",
      },
    ],
    code: "H02",
    name: "电子/通信/半导体",
  },
  {
    children: [
      {
        code: "H03",
        name: "不限",
      },
      {
        code: "H0022",
        name: "房地产开发经营",
      },
      {
        code: "H0023",
        name: "房地产租赁/中介",
      },
      {
        code: "H0024",
        name: "物业/商业管理",
      },
      {
        code: "H0025",
        name: "建材",
      },
      {
        code: "H0026",
        name: "工程管理/勘察/监理",
      },
      {
        code: "H0027",
        name: "建筑/工程设计",
      },
      {
        code: "H0028",
        name: "工程施工",
      },
      {
        code: "H0029",
        name: "装饰装修",
      },
    ],
    code: "H03",
    name: "房地产/建筑",
  },
  {
    children: [
      {
        code: "H04",
        name: "不限",
      },
      {
        code: "H0030",
        name: "银行",
      },
      {
        code: "H0031",
        name: "保险",
      },
      {
        code: "H0032",
        name: "基金/证券/期货",
      },
      {
        code: "H0033",
        name: "资产管理",
      },
      {
        code: "H0034",
        name: "担保/拍卖/典当",
      },
      {
        code: "H0035",
        name: "信托",
      },
      {
        code: "H0036",
        name: "科技金融",
      },
      {
        code: "H0037",
        name: "融资租赁/保理",
      },
      {
        code: "H0038",
        name: "其他金融",
      },
    ],
    code: "H04",
    name: "金融",
  },
  {
    children: [
      {
        code: "H05",
        name: "不限",
      },
      {
        code: "H0039",
        name: "食品/饮料/酒水",
      },
      {
        code: "H0040",
        name: "日化",
      },
      {
        code: "H0041",
        name: "烟草",
      },
      {
        code: "H0042",
        name: "服装/纺织/皮革",
      },
      {
        code: "H0043",
        name: "家具/家居",
      },
      {
        code: "H0044",
        name: "家电",
      },
      {
        code: "H0045",
        name: "办公用品/设备",
      },
      {
        code: "H0046",
        name: "工艺品",
      },
      {
        code: "H0047",
        name: "珠宝/首饰",
      },
      {
        code: "H0048",
        name: "文娱用品/器材",
      },
      {
        code: "H0049",
        name: "日用杂品",
      },
    ],
    code: "H05",
    name: "消费品",
  },
  {
    children: [
      {
        code: "H06",
        name: "不限",
      },
      {
        code: "H0050",
        name: "制药",
      },
      {
        code: "H0051",
        name: "生物技术",
      },
      {
        code: "H0052",
        name: "医疗器械",
      },
      {
        code: "H0053",
        name: "医疗机构",
      },
      {
        code: "H0054",
        name: "医药流通",
      },
      {
        code: "H0055",
        name: "医药外包",
      },
    ],
    code: "H06",
    name: "医疗健康",
  },
  {
    children: [
      {
        code: "H07",
        name: "不限",
      },
      {
        code: "H0056",
        name: "汽车零部件及配件",
      },
      {
        code: "H0057",
        name: "整车制造",
      },
      {
        code: "H0058",
        name: "新能源汽车",
      },
      {
        code: "H0059",
        name: "汽车交易/后市场",
      },
    ],
    code: "H07",
    name: "汽车",
  },
  {
    children: [
      {
        code: "H08",
        name: "不限",
      },
      {
        code: "H0060",
        name: "机械/设备",
      },
      {
        code: "H0061",
        name: "电气机械/器材",
      },
      {
        code: "H0062",
        name: "仪器仪表",
      },
      {
        code: "H0063",
        name: "轨道交通/船舶设备",
      },
      {
        code: "H0064",
        name: "航空/航天设备",
      },
      {
        code: "H0065",
        name: "新材料",
      },
      {
        code: "H0066",
        name: "金属制品",
      },
      {
        code: "H0067",
        name: "非金属矿物制品",
      },
      {
        code: "H0068",
        name: "橡胶/塑料制品",
      },
      {
        code: "H0069",
        name: "印刷/包装/造纸",
      },
      {
        code: "H0070",
        name: "工业自动化",
      },
      {
        code: "H0071",
        name: "家电",
      },
      {
        code: "H0072",
        name: "家具/家居",
      },
      {
        code: "H0073",
        name: "其他制造业",
      },
    ],
    code: "H08",
    name: "机械/制造",
  },
  {
    children: [
      {
        code: "H09",
        name: "不限",
      },
      {
        code: "H0074",
        name: "学前教育",
      },
      {
        code: "H0075",
        name: "学校教育",
      },
      {
        code: "H0076",
        name: "培训服务",
      },
      {
        code: "H0077",
        name: "其他教育培训",
      },
    ],
    code: "H09",
    name: "教育培训",
  },
  {
    children: [
      {
        code: "H10",
        name: "不限",
      },
      {
        code: "H0078",
        name: "法律服务",
      },
      {
        code: "H0079",
        name: "人力资源服务",
      },
      {
        code: "H0080",
        name: "财务/审计/税务",
      },
      {
        code: "H0081",
        name: "知识产权服务",
      },
      {
        code: "H0082",
        name: "翻译服务",
      },
      {
        code: "H0083",
        name: "咨询服务",
      },
      {
        code: "H0084",
        name: "租赁业",
      },
      {
        code: "H0085",
        name: "检测/认证",
      },
      {
        code: "H0086",
        name: "学术/科研",
      },
      {
        code: "H0087",
        name: "专业技术服务",
      },
      {
        code: "H0088",
        name: "科技推广服务",
      },
      {
        code: "H0089",
        name: "其他商务服务业",
      },
    ],
    code: "H10",
    name: "科研技术/商务服务",
  },
  {
    children: [
      {
        code: "H11",
        name: "不限",
      },
      {
        code: "H0090",
        name: "广告/公关/会展",
      },
      {
        code: "H0091",
        name: "广播/影视/录音",
      },
      {
        code: "H0092",
        name: "新闻和出版业",
      },
      {
        code: "H0093",
        name: "文化艺术业",
      },
      {
        code: "H0094",
        name: "体育",
      },
    ],
    code: "H11",
    name: "广告/传媒/文化/体育",
  },
  {
    children: [
      {
        code: "H12",
        name: "不限",
      },
      {
        code: "H0095",
        name: "餐饮业",
      },
      {
        code: "H0096",
        name: "酒店/民宿",
      },
      {
        code: "H0097",
        name: "旅游",
      },
      {
        code: "H0098",
        name: "室内娱乐",
      },
      {
        code: "H0099",
        name: "家政服务",
      },
      {
        code: "H0100",
        name: "养老服务",
      },
      {
        code: "H0101",
        name: "美容/美发/保健",
      },
      {
        code: "H0102",
        name: "婚嫁/摄影",
      },
      {
        code: "H0103",
        name: "宠物服务",
      },
      {
        code: "H0104",
        name: "其他生活服务",
      },
    ],
    code: "H12",
    name: "生活服务",
  },
  {
    children: [
      {
        code: "H13",
        name: "不限",
      },
      {
        code: "H0105",
        name: "民航/铁路/公路/水路客运",
      },
      {
        code: "H0106",
        name: "货运/物流/仓储",
      },
      {
        code: "H0107",
        name: "邮政/快递",
      },
      {
        code: "H0108",
        name: "贸易/进出口",
      },
      {
        code: "H0109",
        name: "批发/零售",
      },
    ],
    code: "H13",
    name: "交通/物流/贸易/零售",
  },
  {
    children: [
      {
        code: "H14",
        name: "不限",
      },
      {
        code: "H0110",
        name: "矿产开采",
      },
      {
        code: "H0111",
        name: "金属冶炼",
      },
      {
        code: "H0112",
        name: "煤炭/燃料加工",
      },
      {
        code: "H0113",
        name: "电力/热力/燃气/水务",
      },
      {
        code: "H0114",
        name: "新能源",
      },
      {
        code: "H0115",
        name: "石化",
      },
      {
        code: "H0116",
        name: "化工",
      },
      {
        code: "H0117",
        name: "环保",
      },
    ],
    code: "H14",
    name: "能源/化工/环保",
  },
  {
    children: [
      {
        code: "H15",
        name: "不限",
      },
      {
        code: "H0118",
        name: "政府/公共事业",
      },
      {
        code: "H0119",
        name: "非营利组织",
      },
      {
        code: "H0120",
        name: "农/林/牧/渔",
      },
      {
        code: "H0121",
        name: "其他行业",
      },
    ],
    code: "H15",
    name: "政府/非营利组织/其他",
  },
];
