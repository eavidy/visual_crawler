import { CrawlerLiepin } from "./crawler_liepin";
import { createContext } from "../classes/browser";
import { SiteTag, TaskType } from "api/model";
import { ObjectId } from "mongodb";

async function start() {
    CrawlerLiepin.cacheSize = 1;
    let crawler = new CrawlerLiepin(await createContext());
    // let res = crawler.startWork().then(() => {
    //     console.log("fin");
    // });
    // setTimeout(function () {
    //     crawler.stopWork();
    // }, 60 * 1000);

    await crawler.executeTask({
        type: TaskType.jobFilter,
        siteTag: SiteTag.liepin,
        taskInfo: { fixedFilter: { city: 101020100 } },
        _id: new ObjectId("dddddddddddd"),
    });
}
start();
