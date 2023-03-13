import { DataParser, PageCrawl } from "../common";
import { BrowserContext, Page, Response } from "playwright";
import { SiteTag } from "api/model";
import { paseJob } from "./classes/common_parser";
import { JobCrawlerData } from "api/model";
import { PageNumControllable } from "./classes/page_controller";
import { ACTION_TIMEOUT } from "../../../crawl/classes/crawl_action";

/**
 * @event request url:string
 * @event data data:{jobList:any[]}
 * @event auth    //页面需要验证码
 */
export class LiePinCompanyDetail extends PageCrawl {
    constructor(context: BrowserContext, readonly origin: string) {
        super(context);
    }
    siteTag = SiteTag.liepin;

    async open(companyInfo: CompInfo, timeout = 20 * 1000) {
        let page = await this.newPage();

        let urlChecker = /apic.liepin.com\/api\/com.liepin.searchfront4c.pc-comp-homepage-search-job$/;
        page.on("response", (res) => {
            if (urlChecker.test(res.url())) {
                if (res.ok()) {
                    this.onResponse(res, companyInfo);
                } else {
                    this.reportError({ msg: "响应状态码异常", status: res.status(), statusText: res.statusText() });
                }
            }
        });
        page.on("request", (request) => {
            if (urlChecker.test(request.url())) {
                this.emit("request", request.url());
            }
        });
        const url = `${this.origin}/company-jobs/${companyInfo.companyId}`;
        await page.goto(url, { timeout });
        let pageCtrl = new LiePinCompanyDetail.PageController(page, this, companyInfo);
        let stopCheckAuth = setInterval(async () => {
            if (await pageCtrl.isAuth()) {
                this.emit("auth");
            }
        }, 1000);
        page.on("close", function () {
            clearInterval(stopCheckAuth);
        });
        return pageCtrl;
    }

    private async onResponse(res: Response, compInfo: CompInfo) {
        let dataList: any[] = (await res.json().catch(() => {}))?.data?.data ?? [];
        const jobList: JobCrawlerData[] = [];
        for (const dataItem of dataList) {
            try {
                const { data, errors } = paseJob(dataItem.job, this.siteTag, compInfo);
                jobList.push(data);
                errors.forEach((err) => this.reportError(err));
            } catch (error) {
                this.reportError({ msg: "执行解析职位错误", err: (error as Error).toString() });
            }
        }
        this.pageCrawlFin({ jobList });
    }
    private static PageController = class PageController extends PageNumControllable {
        constructor(page: Page, readonly og: LiePinCompanyDetail, private readonly compInfo: CompInfo) {
            super(page);
        }
        async getTotalPage() {
            let text: string;
            try {
                text = await this.page
                    .locator(".company-header-content-tab .active")
                    .innerText({ timeout: ACTION_TIMEOUT });
            } catch (error) {
                return 0;
            }
            let countStr = text.match(/\((\d+)\)/)?.[1];
            if (!countStr) return 0;

            return Math.ceil(parseInt(countStr) / 30);
        }

        async crawlHtml() {
            let compInfo = { ...this.compInfo };
            const handler = this.page.locator(".content-left-section .left-list-box .job-detail-box>a");
            let data = await handler.evaluateAll(function (nodeList) {
                let jobDataList: { city?: string; name: string; salary: string; tagList: string[]; jobId: string }[] =
                    [];
                for (const node of nodeList) {
                    let jobId = node.href.match(/www.liepin.com\/(lpt)?job\/(\d+)/)?.[2];
                    let city: string | undefined = node
                        .querySelector(".job-dq-box>.ellipsis-1")
                        .innerText?.match(/^[^-]+/)?.[0];

                    let name = node.querySelector(".job-title-box>.ellipsis-1").innerText;
                    let salary = node.querySelector(".job-salary").innerText;
                    let tagList: string[] = [];
                    node.querySelectorAll(".job-labels-box>span").forEach((n: any) => tagList.push(n.innerText));
                    jobDataList.push({ city, name, salary, tagList, jobId });
                }
                return jobDataList;
            });
            function paseTag(list: string[], fx: (str: string) => any, notEqual: any) {
                for (let i = 0; i < list.length; i++) {
                    let tag = list[i];
                    let res = fx(tag);
                    if (res !== notEqual) {
                        list.splice(i, 1);
                        return res;
                    }
                }
            }
            return data.map(
                (data): JobCrawlerData => ({
                    jobData: {
                        name: data.name,
                        education: paseTag(data.tagList, DataParser.matchEducation, undefined),
                        workExperience: paseTag(data.tagList, DataParser.paseExp, -1) ?? -1,
                        cityId: data.city ? DataParser.cityNameToId(data.city) : undefined,
                        ...(DataParser.paseSalary(data.salary) ?? { salaryMonth: 12 }),
                        tag: data.tagList,
                        compIndustry: compInfo.industry,
                        compScale: compInfo.scale,
                    },
                    companyId: compInfo.companyId,
                    jobId: data.jobId,
                    siteTag: SiteTag.liepin,
                })
            );
        }
        async *pageNumIterator(errors: any[]): AsyncGenerator<boolean, void, void> {
            function hasNextPageCatch() {
                errors.push({ message: "判断是否有下一个页面时出现异常" });
                return false;
            }
            function gotoPageError() {
                errors.push({ message: "转跳页面失败" });
                return true;
            }
            function crawlHtml() {
                errors.push({ message: "crawlHtml失败" });
                return false;
            }
            if (!(await this.hasNextPage().catch(hasNextPageCatch))) {
                this.crawlHtml().then((res) => {
                    this.og.pageCrawlFin({ jobList: res });
                }, crawlHtml);
                yield true;
                return;
            }
            yield this.nextPage().then(
                () => true,
                () => false
            );

            let has3 = await this.hasNextPage().catch(hasNextPageCatch);
            yield this.gotoPage(1).then(() => true, gotoPageError);
            if (has3)
                yield this.gotoPage(3).then(
                    () => true,
                    () => false
                );

            while (await this.hasNextPage().catch(hasNextPageCatch)) {
                yield await this.nextPage().then(() => true, gotoPageError);
            }
        }
    };
}
type CompInfo = { companyId: string; industry?: string; scale?: number };
