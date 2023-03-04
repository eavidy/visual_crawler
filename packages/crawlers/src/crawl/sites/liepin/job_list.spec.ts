import { LiePinJobList } from "./job_list";
import { createContext } from "../../crawler/browser";
async function test() {
    const bsCt = await createContext();
    const pageCrawl = new LiePinJobList(bsCt, "https://www.liepin.com");
    pageCrawl.on("data", (data: any) => {
        console.log("职位:" + data.jobList.length + " 公司:" + data.compList.length);
    });
    pageCrawl.on("errData", (comps: any[]) => {
        console.error(comps);
    });
    await pageCrawl.open(undefined, 0);
}
test();
