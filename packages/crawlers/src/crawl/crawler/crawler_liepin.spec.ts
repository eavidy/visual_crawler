import { CrawlerLiepin } from "./crawler_liepin";
import { CrawlerDevice } from "../classes/browser";
import { SiteTag, TaskType } from "api/model";
import { ObjectId } from "mongodb";
import { dbClient } from "../../db";
import { TaskQueue } from "../classes/task_queue";
import { parseNodeArgs } from "../classes/parseArgs";

function report(...str: string[]) {
    const stdout = process.stdout;
    function clear() {
        stdout.cursorTo(0, 0);
        stdout.clearScreenDown();
    }
    if (typeof stdout.cursorTo === "function") clear();
    stdout.write(str.join("\n"));
}
const { map } = parseNodeArgs();
const headless = !(map.nh ?? false);
const browserPath = typeof map.browser === "string" ? map.browser : undefined;

async function start(taskQueue: TaskQueue) {
    let device = await CrawlerDevice.create({ headless, executablePath: browserPath });
    let crawler = new CrawlerLiepin(device, taskQueue);
    crawler.on("scheduleUpdate", function (this: CrawlerLiepin) {
        if (process.env.NODE_ENV === "prod") return;
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
    crawler.on("taskFinished", function (this: CrawlerLiepin, taskResult) {
        console.log(this.statistics);
        console.log(taskResult);
    });
    crawler.on("jobTaskRest", function (skipList: number[]) {
        console.log(skipList);
    });
    crawler.on("reportAuth", function () {
        console.log("需要人机验证");
    });
    crawler.on("workBreak", function ({ reason }) {
        console.log(reason);
    });

    await excWork(crawler);
    // await excJobTask(crawler);
    // await excCompanyTask(crawler);

    await device.close();
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
start(new TaskQueue(SiteTag.liepin, undefined, 1));
