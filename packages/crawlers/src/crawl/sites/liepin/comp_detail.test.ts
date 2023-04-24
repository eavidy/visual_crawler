import { it, expect, describe, afterAll } from "vitest";
import { LiePinCompanyDetail } from "./comp_detail";
import { CrawlerDevice } from "../../classes/browser";
import { TimeoutPromise } from "@asnc/tslib/async";

const browser = await CrawlerDevice.create({ headless: true, channel: undefined });
afterAll(async function (e) {
    return browser.close();
});
it.concurrent(
    "猎聘-获取公司页面",
    async function () {
        const bsCt = await browser.newContext();
        const pageCrawl = new LiePinCompanyDetail(bsCt, "https://www.liepin.com");
        const jobList: any[] = [],
            errList: any[] = [];
        pageCrawl.on("data", (data: any) => jobList.push(data));
        pageCrawl.on("errData", (err: any[]) => errList.push(err));
        let ctrl = await pageCrawl.open({ companyId: "8846916" });
        await new TimeoutPromise(2000);

        const pageCount = await ctrl.getTotalJob();
        expect(pageCount, "页面数量大于0").greaterThan(0);
    },
    10 * 1000
);
