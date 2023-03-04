import { LiePinCompanyDetail } from "./comp_detail";
import { createContext } from "../../crawler/browser";
async function test() {
    const bsCt = await createContext();
    const pageCrawl = new LiePinCompanyDetail(bsCt, "https://www.liepin.com");
    pageCrawl.on("data", (data: any) => {
        console.log("职位:" + data.jobList.length);
    });
    pageCrawl.on("errData", (comps: any[]) => {
        console.error(comps);
    });
    await pageCrawl.open();
    await pageCrawl.goto("4817469");
    setTimeout(() => {
        pageCrawl.crawlHtml().then((data) => {
            console.log(data);
        });
    });
}
test();