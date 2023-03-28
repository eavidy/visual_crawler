import { LiePinJobList, PageController } from "./job_list";
import { CrawlerDevice } from "../../classes/browser";
import { TimeoutPromise } from "@asnc/tslib/lib/async";
import { listIterator } from "../../classes/crawl_action";
async function test() {
    const bsCt = await CrawlerDevice.newContext();
    const pageCrawl = new LiePinJobList(bsCt, "https://www.liepin.com");
    pageCrawl.on("data", async (data: any) => {
        console.log("职位:" + data.jobList.length + " 公司:" + data.compList.length);
    });
    pageCrawl.on("errData", (comps: any[]) => {
        console.error(comps);
    });
    let ctrl = await pageCrawl.open(undefined, 0);
    return ctrl;
}

async function grefilter(ctrl: PageController) {
    for await (const res of listIterator(ctrl.iterationSequence)) {
        console.log(res);
        await new TimeoutPromise(2000);
    }
}

async function start() {
    const ctrl = await test();
    await grefilter(ctrl);
    await CrawlerDevice.close();
}
start();
