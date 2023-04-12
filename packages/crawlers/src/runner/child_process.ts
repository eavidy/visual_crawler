import { EventEmitter } from "node:events";
import { CrawlerLiepin } from "../crawl/crawler/crawler_liepin";
import { CrawlerDevice } from "../crawl/classes/browser";
import { args } from "../classes/parse_args";
import { TaskQueue } from "../crawl/classes/task_queue";
import { SiteTag, TaskType } from "common/model";
import type { CreateCrawlerOptions } from "common/request/crawler/crawler";
import { dbClient } from "../db/db";

/**
 * @event initDevice //初始化浏览器
 *
 * @event startWork [config, id:number]
 * @event stopWork [{abort:boolean}, id:number]
 * @event resetCount [undefined, id:number]  //重置计数
 *
 * @event getMemory
 *
 */
class AppCenter extends EventEmitter {
    static sendParent(type: string, data?: any, id?: number) {
        if (!process.send) return;
        return new Promise<void>(function (resolve, reject) {
            process.send!({ type, data, id }, undefined, undefined, function (error) {
                if (error) reject(error);
                else resolve();
            });
        });
    }
    constructor() {
        super();
        this.initEvent();
    }
    private initEvent() {
        process.on("exit", async (p) => {
            await dbClient.close();
        });
        process.on("message", ({ type, data, id }: { type: string; data: any; id?: number }) => {
            this.emit(type, data, id);
        });
        this.on("initDevice", () => this.getDevice());

        // this.on("excTask", (task, id) => this.excTask(id, task));
        // this.on("breakTask", (_, id) => this.taskBreak(id));
        this.on("resetCount", (_, id) => this.resetCount(id));

        this.on("startWork", (config, id) => this.startWork(id, config));
        this.on("stopWork", ({ abort }, id) => this.stopWork(id, abort));

        this.on("getMemory", () => {
            AppCenter.sendParent("memory", process.memoryUsage());
        });
    }

    private device?: CrawlerDevice | Promise<CrawlerDevice>;
    private async getDevice() {
        if (this.device) this.device;
        const headless = !args["nh"] ?? true;
        const browserPath = typeof args["browser"] === "string" ? args["browser"] : undefined;
        let pms = CrawlerDevice.create({ headless, executablePath: browserPath });
        this.device = pms;
        const device = await pms;
        this.device = device;
        return device;
    }
    async closeDevice() {
        let device = this.device instanceof Promise ? await this.device : this.device;
        if (!device) return;
        this.device = undefined;
        for (const [id, crawler] of this.crawlers) {
            if (crawler.working) crawler.stopWork(true);
        }
        await device.close();
    }
    private crawlers = new Map<number, CrawlerLiepin>();
    private async createCrawler(id: number, config: CreateCrawlerOptions) {
        const device = await this.getDevice();
        const { taskCountLimit } = config;

        let taskQueue = new TaskQueue(SiteTag.liepin, config.taskType, 1);
        let crawler = new CrawlerLiepin(device, taskQueue);

        this.crawlers.set(id, crawler);
        crawler.on("scheduleUpdate", function (this: CrawlerLiepin) {
            AppCenter.sendParent("scheduleUpdate", { total: this.totalSchedule, current: this.currentSchedule }, id);
        });
        crawler.on("taskExc", function (this: CrawlerLiepin, task) {
            AppCenter.sendParent("taskExc", task, id);
        });
        crawler.on("taskFinished", function (this: CrawlerLiepin, taskResult) {
            AppCenter.sendParent("taskFinished", taskResult, id);
            if (taskCountLimit) {
                let statistics = this.statistics;
                if (statistics.taskCompleted + statistics.taskFailed >= taskCountLimit) {
                    this.stopWork(true);
                }
            }
        });
        // crawler.on("workFinished", (taskResult) => {
        //     AppCenter.sendParent("workFinished", taskResult, id);
        // });

        crawler.on("jobTaskRest", (skipList: number[]) => {
            AppCenter.sendParent("jobTaskRest", skipList, id);
        });
        crawler.on("reportAuth", function (this: CrawlerLiepin) {
            AppCenter.sendParent("reportAuth", undefined, id);
            this.stopWork(true);
        });
        crawler.on("statisticsUpdate", function (this: CrawlerLiepin) {
            AppCenter.sendParent("statisticsUpdate", this.statistics, id);
        });
        return crawler;
    }
    async startWork(id: number, config: CreateCrawlerOptions) {
        const crawler = await this.createCrawler(id, config);
        AppCenter.sendParent("startWork", undefined, id);
        await crawler.startWork();
        this.crawlers.delete(id);
        crawler.clearMemory();
        if (!this.crawlers.size) this.closeDevice();
        AppCenter.sendParent("stopWork", undefined, id);
    }
    async stopWork(id: number, abort?: boolean) {
        let crawler = this.crawlers.get(id);
        if (crawler) crawler.stopWork(abort);
    }

    resetCount(id: number) {
        let crawler = this.crawlers.get(id);
        crawler?.resetCount();
    }
}

export const appCenter = new AppCenter();
AppCenter.sendParent("init");
AppCenter.sendParent("memory", process.memoryUsage());
