import { LiePinJobList } from "./job_list";
import { createContext } from "../../crawler/browser";
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
    await pageCrawl.open(undefined, 0);
    return pageCrawl;
}

async function grefilter(pageCrawl: LiePinJobList) {
    const filters = pageCrawl.pageFilter!;

    for await (const res of listIterator(filters.iterationSequence)) {
        console.log(res);
        await waitTime(2000);
    }
}

async function start() {
    const pageCrawl = await test();
    await grefilter(pageCrawl);
}
// start();
