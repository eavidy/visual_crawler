import { CrawlerLiepin } from "./crawler_liepin";
import { createContext, closeBrowser } from "../classes/browser";
import { SiteTag, TaskType } from "api/model";
import { ObjectId } from "mongodb";
import { dbClient } from "../../db";
import { TaskQueue } from "../classes/task_queue";

function report(...str: string[]) {
    const stdout = process.stdout;
    function clear() {
        stdout.cursorTo(0, 0), stdout.clearScreenDown();
    }
    clear();
    stdout.write(str.join("\n"));
}

async function start() {
    let taskQueue = new TaskQueue(SiteTag.liepin, 1);
    let crawler = new CrawlerLiepin(await createContext(), taskQueue);
    crawler.on("taskFinished", function () {});
    crawler.on("scheduleUpdate", function (this: CrawlerLiepin) {
        let statistics = this.statistics;
        let total = {
            jobTotal: statistics.jobRepeated + statistics.newJob,
            companyTotal: statistics.companyRepeated + statistics.newCompany,
            taskTotal: statistics.taskCompleted + statistics.taskFailed,
        };
        let yy = [
            "统计: " + JSON.stringify(statistics, null, 2) + "\n",
            "总数: " + JSON.stringify(total, null, 2) + "\n",
            "职位重复率:" + Math.round((statistics.jobRepeated / total.jobTotal) * 100) + "%",
            "公司重复率:" + Math.round((statistics.companyRepeated / total.companyTotal) * 100) + "%",
            "任务失败率:" + (total.taskTotal ? Math.round((statistics.taskFailed / total.taskTotal) * 100) : 0) + "%\n",
            "任务进度: " + this.currentSchedule + "/" + this.totalSchedule + "\n",
        ];
        report(...yy);
    });

    crawler.on("reportAuth", function () {});

    await excWork(crawler);
    // await excJobTask(crawler);
    // await excCompanyTask(crawler);

    await closeBrowser();
    await dbClient.close();
    console.log("done");
}
async function excWork(crawler: CrawlerLiepin) {
    return crawler.startWork().then((status) => {
        console.log("done:" + status);
    });
}
async function excJobTask(crawler: CrawlerLiepin) {
    await crawler.executeTask({
        type: TaskType.jobFilter,
        siteTag: SiteTag.liepin,
        taskInfo: { fixedFilter: { city: 101020100 } },
        _id: new ObjectId("dddddddddddd"),
    });
}
async function excCompanyTask(crawler: CrawlerLiepin) {
    await crawler.executeTask({
        type: TaskType.company,
        siteTag: SiteTag.liepin,
        taskInfo: "5964833",
        _id: new ObjectId("dddddddddddd"),
    });
}
start();
