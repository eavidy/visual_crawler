import { BrowserContext, Response } from "playwright";
import { CompanyCrawlerData, JobCrawlerData, JobFilterOption } from "api/model";
import { cities } from "common/constants/cities";
import { SiteTag } from "api/model";
import { PageCrawl, DataParser as DataParser } from "../index";
import { paseJob, RawCompData, RawJobData } from "./classes/common_parser";
import { PageNumControllable } from "./classes/page_controller";
import { waitTime } from "common/async/time";
import { FilterIteratorFx, ACTION_TIMEOUT } from "../../classes/crawl_action";
import { removeUndefined } from "common/calculate/object";

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
    async open(options?: JobFilterOption, timeout = 20 * 1000) {
        let paramsStr = "?";
        if (options?.city) {
            let city = cities.find((c) => c._id === options.city);
            if (city) paramsStr += "city=" + city.liepinCode + "&dq=" + city.liepinCode;
        }
        let page = await super.newPage();
        const urlChecker = /apic.liepin.com\/api\/com.liepin.searchfront4c.pc-search-job$/;
        page.on("response", (res) => {
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
        const url = this.origin + "/zhaopin/" + paramsStr;
        await page.goto(url, { timeout });

        let stopCheckAuth = setInterval(async () => {
            if (await pageCtrl.isAuth()) {
                this.emit("auth");
            }
        });
        page.on("close", function () {
            clearInterval(stopCheckAuth);
        });

        let pageCtrl = new JobPageController(page);
        await page.locator(".filter-options-container").focus({ timeout: 30000 });
        return pageCtrl;
    }
    async loadFin() {}
    private async onResponse(res: Response) {
        let data: ResData[] | undefined = (await res.json().catch(() => {}))?.data?.data?.jobCardList;
        if (typeof data !== "object") {
            this.reportError({ msg: "解析json错误" });
            return;
        }
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
        return removeUndefined({
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
}

class JobPageController extends PageNumControllable {
    // async setEmitTime(cityId: string) {}
    // async setIndustry(cityId: string) {}

    //7
    async *salary(skipCount = 0) {
        let list = await this.getBasicFilters("薪资").locator(".options-item").all();
        for (let i = skipCount; i < list.length; i++) {
            let item = list[i];
            try {
                await item.click({ timeout: ACTION_TIMEOUT });
                yield true;
            } catch (error) {
                yield false;
            }
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
            try {
                await item.click({ timeout: ACTION_TIMEOUT });
                yield true;
            } catch (error) {
                yield false;
            }
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
                await waitTime(200);
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
        list = [
            "1-49人",
            "50-99人",
            "100-499人",
            "500-999人",
            "1000-2000人",
            "2000-5000人",
            "5000-10000人",
            "10000人以上",
        ]
    ) {
        let loc = await this.getOtherFilters().nth(3);
        for (let i = skipCount; i < list.length; i++) {
            let str = list[i];
            try {
                await loc.click({ timeout: ACTION_TIMEOUT });
                await waitTime(200);
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
                await waitTime(200);
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

let params: {
    city: string;
    dq: string; //具体地区
    pubTime: string; //发布时间
    key: string;
    suggestTag: string;
    workYearCode: string; //工作经验
    industry: string; //行业
    salary: string; //新增

    compScale: string; //公司规模
    compKind: string; //企业性质
    compStage: string; //融资阶段
    eduLevel: string; //学历
    compTag: string;

    otherCity: string;
    sfrom: string;
    ckId: string;
    scene: string;
    skId: string;
    fkId: string;
    suggestId: string;
};
