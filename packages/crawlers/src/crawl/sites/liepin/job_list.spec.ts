import { LiePinJobList, PageController } from "./job_list";
import { createContext, closeBrowser } from "../../classes/browser";
import { waitTime } from "common/async/time";
import { listIterator } from "../../classes/crawl_action";
async function test() {
    const bsCt = await createContext();
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
        await waitTime(2000);
    }
}

async function start() {
    const ctrl = await test();
    await grefilter(ctrl);
    await closeBrowser();
}
start();
