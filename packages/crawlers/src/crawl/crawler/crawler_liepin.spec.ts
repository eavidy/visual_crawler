import { CrawlerLiepin } from "./crawler_liepin";
import { closeBrowser, getBrowser } from "../classes/browser";
import { SiteTag, TaskType } from "api/model";
import { ObjectId } from "mongodb";
import { dbClient } from "../../db";
import { TaskQueue } from "../classes/task_queue";

function report(...str: string[]) {
    const stdout = process.stdout;
    function clear() {
        stdout.cursorTo(0, 0);
        stdout.clearScreenDown();
    }
    clear();
    // console.log(str.join("\n"))
    stdout.write(str.join("\n"));
}

async function start() {
    let taskQueue = new TaskQueue(SiteTag.liepin, 1);
    let crawler = new CrawlerLiepin(await getBrowser(), taskQueue);
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
            "职位重复率:" + Math.round((total.jobTotal ? statistics.jobRepeated / total.jobTotal : 0) * 100) + "%",
            "公司重复率:" +
                Math.round((total.companyTotal ? statistics.companyRepeated / total.companyTotal : 0) * 100) +
                "%",
            "任务失败率:" + Math.round((total.taskTotal ? statistics.taskFailed / total.taskTotal : 0) * 100) + "%\n",
            `任务进度: ${this.currentSchedule}/${this.totalSchedule} (${
                this.totalSchedule ? Math.round((this.currentSchedule / this.totalSchedule) * 100 * 100) / 100 : 0
            }%)\n`,
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
