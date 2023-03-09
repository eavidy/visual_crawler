import { LiePinCompanyDetail } from "./comp_detail";
import { createContext } from "../../classes/browser";
import { waitTime } from "common/async/time";
async function test() {
    const bsCt = await createContext();
    const pageCrawl = new LiePinCompanyDetail(bsCt, "https://www.liepin.com");
    pageCrawl.on("data", (data: any) => {
        console.log("职位:" + data.jobList.length);
    });
    pageCrawl.on("errData", (comps: any[]) => {
        console.error(comps);
    });
    let ctrl = await pageCrawl.open({ companyId: "4817469" });
    await waitTime(2000);
    let data = await ctrl.crawlHtml();
    console.log(data);
}
test();
