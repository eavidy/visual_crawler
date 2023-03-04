import { DataParser, PageCrawl } from "../index";
import { BrowserContext, Response } from "playwright";
import { SiteTag } from "api/model";
import { paseJob } from "./job_list";
import { JobCrawlerData } from "api/model/index";

export class LiePinCompanyDetail extends PageCrawl {
    constructor(context: BrowserContext, readonly origin: string) {
        super(context);
    }
    siteTag = SiteTag.liepin;
    async open() {
        if (this.page) return;
        this.page = await this.newPage();
        this.page.on("response", (res) => {
            if (/apic.liepin.com\/api\/com.liepin.searchfront4c.pc-comp-homepage-search-job$/.test(res.url())) {
                if (res.ok()) {
                    this.onResponse(res);
                } else {
                    this.reportError({ msg: "响应状态码异常", status: res.status(), statusText: res.statusText() });
                }
            }
        });
    }
    private currentId?: string;
    async goto(companyId: string, timeout = 20 * 1000) {
        if (!this.page) throw new Error("没有打开页面");
        const url = `${this.origin}/company-jobs/${companyId}`;
        await this.page.goto(url, { timeout });
        this.currentId = companyId;
    }
    async getCurrentPage() {
        if (!this.page) throw new Error("没有打开页面");
        const handler = this.page.locator(`.list-pagination-box>.ant-pagination-item-active`);
        let pageIndex = await handler.getAttribute("tabindex");
        return pageIndex ? pageIndex + 1 : null;
    }
    async gotoPage(num: number) {
        if (!this.page) throw new Error("没有打开页面");
        const handler = this.page.locator(`.list-pagination-box>.ant-pagination-item[tabindex='${num - 1}']`);
        await handler.click();
    }
    async nextPage() {
        if (!this.page) throw new Error("没有打开页面");
        const handler = this.page.locator(".list-pagination-box>.ant-pagination-next ");
        await handler.click();
    }
    async crawlHtml() {
        const companyId = this.currentId ?? "unknown";
        if (!this.page) throw new Error("没有打开页面");
        const handler = this.page.locator(".content-left-section .left-list-box .job-detail-box>a");
        let data = await handler.evaluateAll(function (nodeList) {
            let jobDataList: { city?: string; name: string; salary: string; tagList: string[]; jobId: string }[] = [];
            for (const node of nodeList) {
                let jobId = node.href.match(/www.liepin.com\/job\/(\d+)\.shtml/)?.[1];
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
        function paseTag(list: string[], fx: (str: string) => any) {
            for (let i = 0; i < list.length; i++) {
                let tag = list[i];
                let res = fx(tag);
                if (res) {
                    list.splice(i, 1);
                    return res;
                }
            }
        }
        return data.map((data) => ({
            jobData: {
                name: data.name,
                education: paseTag(data.tagList, DataParser.matchEducation),
                workExperience: paseTag(data.tagList, DataParser.paseExp),
                cityId: data.city ? DataParser.cityNameToId(data.city) : undefined,
                ...(DataParser.paseSalary(data.salary) ?? { salaryMonth: 12 }),
                tag: data.tagList,
            },
            companyId,
            jobId: data.jobId,
            siteTag: this.siteTag,
        }));
    }
    private async onResponse(res: Response) {
        const companyId = this.currentId;
        let dataList: any[] = (await res.json().catch(() => {}))?.data?.data ?? [];
        const jobList: JobCrawlerData[] = [];
        for (const dataItem of dataList) {
            try {
                const { data, errors } = paseJob(dataItem.job, this.siteTag, companyId);
                jobList.push(data);
                errors.forEach((err) => this.reportError(err));
            } catch (error) {
                this.reportError({ msg: "执行解析职位错误", err: (error as Error).toString() });
            }
        }
        this.pageCrawlFin({ jobList });
    }
}
