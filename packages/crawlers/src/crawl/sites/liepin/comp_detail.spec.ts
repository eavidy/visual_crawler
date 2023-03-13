import { LiePinCompanyDetail } from "./comp_detail";
import { createContext } from "../../classes/browser";
import { TimeoutPromise } from "@asnc/tslib/lib/async";
async function test() {
    const bsCt = await createContext();
    const pageCrawl = new LiePinCompanyDetail(bsCt, "https://www.liepin.com");
    pageCrawl.on("data", (data: any) => {
        console.log("职位:" + data.jobList.length);
    });
    pageCrawl.on("errData", (comps: any[]) => {
        console.error(comps);
    });
    let ctrl = await pageCrawl.open({ companyId: "8846916" });
    await new TimeoutPromise(2000);
    console.log("总页数:" + (await ctrl.getTotalPage()));
    for await (const iterator of ctrl.pageNumIterator([])) {
        console.log(iterator);
    }
}
test();
