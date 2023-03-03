import { BrowserContext, Response } from "playwright";
import { CompanyCrawlerData, JobCrawlerData } from "api/model/index";
import { SiteTag } from "api/model";
import { PageCrawl, DataParser as DataParser } from "../index";
import { JobFilterOption } from "../../types/filter";

/**
 * @event data {jobList:object[], compList:object[]}
 */
export class Job51JobList extends PageCrawl {
    constructor(context: BrowserContext, readonly origin: string) {
        super(context);
    }
    readonly siteTag = SiteTag.job51;
    async open(options?: JobFilterOption, timeout = 0) {
        const page = await super.newPage();
        page.on("response", (res) => {
            if (/apic.liepin.com\/api\/com.liepin.searchfront4c.pc-search-job$/.test(res.url())) {
                if (res.ok()) {
                    this.onResponse(res);
                } else {
                    this.reportError({ msg: "响应状态码异常", status: res.status(), statusText: res.statusText() });
                }
            }
        });
        const url = this.origin + "/zhaopin/";
        await page.goto(url, { timeout });
    }
    async onResponse(res: Response) {
        let data: ResData[] | undefined = (await res.json().catch(() => {}))?.data?.data?.jobCardList;
        if (typeof data !== "object") {
            this.reportError({ msg: "解析json错误" });
            return;
        }
        const resData = this.paseData(data);
        this.pageCrawlFin(resData);
    }
    paseData(data: ResData[]) {
        const jobList: JobCrawlerData[] = [];
        const compList: CompanyCrawlerData[] = [];
        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            let job = item.job;
            let company = item.comp;

            try {
                jobList.push(this.paseJob(job, company.compId.toString()));
            } catch (error) {
                this.reportError({ msg: "执行解析职位错误", err: (error as Error).toString() });
            }
            try {
                compList.push(this.paseCompany(company));
            } catch (error) {
                this.reportError({ msg: "执行解析公司错误", err: (error as Error).toString() });
            }
        }
        return { jobList, compList };
    }
    paseJob(job: typeof vData.job, companyId: string): JobCrawlerData {
        let salary = DataParser.paseSalary(job.salary);
        if (salary === undefined) {
            this.reportError({ msg: "薪资解析失败", str: job.salary });
        }
        let cityId: number | undefined;

        {
            let cityStr = job.dq;
            const cityName = cityStr.match(/^[^-]+/)?.[0];
            cityId = cityName ? DataParser.cityNameToId(cityName) : DataParser.matchCityToId(cityStr);
            if (cityId === undefined) this.reportError({ msg: "解析城市id失败", str: cityStr });
        }
        return {
            jobData: {
                cityId,
                name: job.title,
                tag: job.labels,
                education: DataParser.matchEducation(job.requireEduLevel),
                workExperience: DataParser.paseExp(job.requireWorkYears),
                ...(salary ? salary : { salaryMonth: 12 }),
            },
            companyId: companyId,
            jobId: job.jobId,
            siteTag: SiteTag.job51,
        };
    }
    paseCompany(company: typeof vData.comp): CompanyCrawlerData {
        return {
            companyData: {
                name: company.compName,
                scale: DataParser.paseScale(company.compScale),
                industry: company.compIndustry,
                welfareLabel: [],
            },
            companyId: company.compId.toString(),
            exist: true,
            siteTag: SiteTag.job51,
        };
    }
}

//copy 的响应数据, 用于代码提示
const vData = {
    job: {
        labels: ["制度制定", "岗位配置招聘", "绩效管理", "人力资源经验"],
        advViewFlag: false,
        topJob: false,
        salary: "15-35k·16薪",
        dq: "天津-西青区",
        title: "招聘HR（北京/天津均可）",
        jobKind: "2",
        jobId: "56384201",
        refreshTime: "20230301152917",
        link: "https://www.liepin.com/job/1956384201.shtml",
        requireWorkYears: "经验不限",
        dataPromId:
            "d_sfrom=search_prime&d_ckId=null&d_curPage=1&d_pageSize=40&d_headId=null&d_posi=0&skId=y1kivhce3pccz3zs5vsvzfj1w2g18lz9&fkId=1t9o2us0rwljh7eux01fg0x60ku828ua&ckId=0c4q6ghejy9rcou0kwjad3yr31u23rfa&sfrom=search_job_pc&curPage=1&pageSize=40&index=0",
        requireEduLevel: "统招本科",
    },
    comp: {
        compName: "云账户（天津）共享经济信息咨询有限公司",
        compStage: "B轮",
        compLogo: "5df731b5276e4871f42905bf01u.png",
        compScale: "500-999人",
        compId: 10098303,
        compIndustry: "计算机软件",
        link: "https://www.liepin.com/company/10098303/",
    },
};
type ResData = typeof vData;

const filter = {
    educations: [
        {
            code: "010",
            name: "博士",
        },
        {
            code: "020",
            name: "MBA/EMBA",
        },
        {
            code: "030",
            name: "硕士",
        },
        {
            code: "040",
            name: "本科",
        },
        {
            code: "050",
            name: "大专",
        },
        {
            code: "060",
            name: "中专/中技",
        },
        {
            code: "080",
            name: "高中",
        },
        {
            code: "090",
            name: "初中及以下",
        },
    ],
    financeStages: [
        {
            code: "01",
            name: "天使轮",
        },
        {
            code: "02",
            name: "A轮",
        },
        {
            code: "03",
            name: "B轮",
        },
        {
            code: "04",
            name: "C轮",
        },
        {
            code: "05",
            name: "D轮及以上",
        },
        {
            code: "06",
            name: "已上市",
        },
        {
            code: "07",
            name: "战略融资",
        },
        {
            code: "08",
            name: "融资未公开",
        },
        {
            code: "99",
            name: "其他",
        },
    ],
    compNatures: [
        {
            code: "010",
            name: "外商独资·外企办事处",
        },
        {
            code: "020",
            name: "中外合营(合资·合作)",
        },
        {
            code: "030",
            name: "私营·民营企业",
        },
        {
            code: "040",
            name: "国有企业",
        },
        {
            code: "050",
            name: "国内上市公司",
        },
        {
            code: "060",
            name: "政府机关/非盈利机构",
        },
        {
            code: "070",
            name: "事业单位",
        },
        {
            code: "999",
            name: "其他",
        },
    ],
    famousComps: [
        {
            code: "qua_0004",
            name: "财富中国500强",
        },
        {
            code: "qua_0009",
            name: "创新企业100强",
        },
        {
            code: "qua_0005",
            name: "制造业500强",
        },
        {
            code: "qua_0003",
            name: "专精特新企业",
        },
        {
            code: "qua_0001",
            name: "高新技术企业",
        },
        {
            code: "qua_0008",
            name: "独角兽",
        },
    ],
    dqs: [
        {
            code: "020010080",
            name: "黄浦区",
        },
        {
            code: "020010020",
            name: "徐汇区",
        },
        {
            code: "020010030",
            name: "长宁区",
        },
        {
            code: "020010100",
            name: "静安区",
        },
        {
            code: "020010040",
            name: "普陀区",
        },
        {
            code: "020010060",
            name: "虹口区",
        },
        {
            code: "020010070",
            name: "杨浦区",
        },
        {
            code: "020010120",
            name: "闵行区",
        },
        {
            code: "020010110",
            name: "宝山区",
        },
        {
            code: "020010130",
            name: "嘉定区",
        },
        {
            code: "020010010",
            name: "浦东新区",
        },
        {
            code: "020010140",
            name: "金山区",
        },
        {
            code: "020010150",
            name: "松江区",
        },
        {
            code: "020010160",
            name: "青浦区",
        },
        {
            code: "020010180",
            name: "奉贤区",
        },
        {
            code: "020010190",
            name: "崇明区",
        },
    ],
    salaries: [
        {
            code: "0$3",
            name: "3K以下",
        },
        {
            code: "3$5",
            name: "3K-5k",
        },
        {
            code: "5$10",
            name: "5K-10k",
        },
        {
            code: "10$20",
            name: "10K-20k",
        },
        {
            code: "20$40",
            name: "20K-40k",
        },
        {
            code: "40$60",
            name: "40K-60k",
        },
        {
            code: "60$999",
            name: "60K以上",
        },
    ],
    jobKinds: [
        {
            code: "1",
            name: "猎头职位",
        },
        {
            code: "2",
            name: "企业职位",
        },
    ],
    industries: [
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
    ],
    compScales: [
        {
            code: "010",
            name: "1-49人",
        },
        {
            code: "020",
            name: "50-99人",
        },
        {
            code: "030",
            name: "100-499人",
        },
        {
            code: "040",
            name: "500-999人",
        },
        {
            code: "050",
            name: "1000-2000人",
        },
        {
            code: "060",
            name: "2000-5000人",
        },
        {
            code: "070",
            name: "5000-10000人",
        },
        {
            code: "080",
            name: "10000人以上",
        },
    ],
    hotCities: [
        {
            code: "410",
            name: "全国",
        },
        {
            code: "010",
            name: "北京",
        },
        {
            code: "020",
            name: "上海",
        },
        {
            code: "030",
            name: "天津",
        },
        {
            code: "040",
            name: "重庆",
        },
        {
            code: "050020",
            name: "广州",
        },
        {
            code: "050090",
            name: "深圳",
        },
        {
            code: "060080",
            name: "苏州",
        },
        {
            code: "060020",
            name: "南京",
        },
        {
            code: "070020",
            name: "杭州",
        },
        {
            code: "210040",
            name: "大连",
        },
        {
            code: "280020",
            name: "成都",
        },
        {
            code: "170020",
            name: "武汉",
        },
        {
            code: "270020",
            name: "西安",
        },
    ],
    pubTimes: [
        {
            code: "",
            name: "不限",
        },
        {
            code: "1",
            name: "一天以内",
        },
        {
            code: "3",
            name: "三天以内",
        },
        {
            code: "7",
            name: "一周以内",
        },
        {
            code: "30",
            name: "一个月以内",
        },
    ],
    workExperiences: [
        {
            code: "1",
            name: "应届生",
        },
        {
            code: "2",
            name: "实习生",
        },
        {
            code: "0$1",
            name: "1年以内",
        },
        {
            code: "1$3",
            name: "1-3年",
        },
        {
            code: "3$5",
            name: "3-5年",
        },
        {
            code: "5$10",
            name: "5-10年",
        },
        {
            code: "10$999",
            name: "10年以上",
        },
    ],
};
