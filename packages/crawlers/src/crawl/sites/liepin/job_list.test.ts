import { it, expect, beforeEach, afterAll } from "vitest";
import { LiePinJobList } from "./job_list";
import { CompanyCrawlerData, SiteTag } from "common/model";
import { CrawlerDevice } from "../../classes/browser";
import { listIterator } from "../../classes/crawl_action";
import { TimeoutPromise } from "@asnc/tslib/async";

const compData = {
    compName: "云账户（天津）共享经济信息咨询有限公司",
    compStage: "B轮",
    compLogo: "5df731b5276e4871f42905bf01u.png",
    compScale: "500-999人",
    compId: 10098303,
    compIndustry: "计算机软件",
    link: "https://www.liepin.com/company/10098303/",
};

it("解析猎聘公司数据", function () {
    let jobList = new LiePinJobList({} as any, "");
    let res = jobList.paseCompany(compData);
    expect(jobList.errors).toMatchObject([]);
    expect(res).toMatchObject({
        companyData: {
            industry: "计算机软件",
            name: "云账户（天津）共享经济信息咨询有限公司",
            scale: 750,
            welfareLabel: [],
        },
        companyId: "10098303",
        siteTag: SiteTag.liepin,
    } as CompanyCrawlerData);
});
const browser = await CrawlerDevice.create({ headless: true, channel: undefined });
afterAll(async function (e) {
    return browser.close();
});

it.concurrent(
    "猎聘-过滤页面",
    async function () {
        const bsCt = await browser.newContext();
        const pageCrawl = new LiePinJobList(bsCt, "https://www.liepin.com");

        const jobList: any[] = [],
            errList: any[] = [];
        pageCrawl.on("data", (data: any) => jobList.push(data));
        pageCrawl.on("errData", (errs: any[]) => errList.push(errs));

        let ctrl = await pageCrawl.open(undefined, 0);

        let pageCtrl = listIterator(ctrl.iterationSequence);
        let count = 3;
        for (let i = 0; i < count; i++) {
            let res = await pageCtrl.next();
            expect(res, "第" + i + "页").toBeTruthy();
            await new TimeoutPromise(2000);
        }
        pageCtrl.return();
        expect(jobList.length, "数据响应次数").toEqual(count + 1);
    },
    12 * 1000
);
