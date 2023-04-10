import { EventEmitter } from "node:events";
import { CrawlerLiepin } from "../crawl/crawler/crawler_liepin";
import { CrawlerDevice } from "../crawl/classes/browser";
import { args } from "../classes/parse_args";
import { TaskQueue } from "../crawl/classes/task_queue";
import { SiteTag, TaskType } from "common/model";

/**
 * @event initDevice //初始化浏览器
 * @event createCrawler {id:number, config}
 * @event removeCrawler {id:number}
 *
 * @event startWork [undefined, id:number]
 * @event stopWork [{abort:boolean}, id:number]
 * @event resetCount [undefined, id:number]  //重置计数
 *
 * @event excTask [task:any, id:number]
 * @event breakTask [undefined,id:number]
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
            await this.closeDevice();
        });
        process.on("message", ({ type, data, id }: { type: string; data: any; id?: number }) => {
            this.emit(type, data, id);
        });
        this.on("initDevice", () => this.initDevice());

        this.on("createCrawler", ({ id, config }) => this.createCrawler(id, config));
        this.on("removeCrawler", ({ id }) => this.removeCrawler(id));

        this.on("excTask", (task, id) => this.excTask(id, task));
        this.on("breakTask", (_, id) => this.taskBreak(id));
        this.on("resetCount", (_, id) => this.resetCount(id));

        this.on("startWork", (_, id) => this.startWork(id));
        this.on("stopWork", ({ abort }, id) => this.stopWork(id, abort));

        this.on("getMemory", () => {
            AppCenter.sendParent("memory", process.memoryUsage());
        });
    }

    device?: CrawlerDevice;

    async initDevice() {
        this.closeDevice();
        const headless = !args["nh"] ?? true;
        const browserPath = typeof args["browser"] === "string" ? args["browser"] : undefined;
        this.device = await CrawlerDevice.create({ headless, executablePath: browserPath });
        AppCenter.sendParent("initDevice", undefined);
    }
    private async closeDevice() {
        let device = this.device;
        if (!device) return;
        this.device = undefined;
        for (const [id] of this.crawlers) {
            this.removeCrawler(id);
        }
        await device?.close();
    }
    private crawlers = new Map<number, { crawler: CrawlerLiepin; abc?: AbortController; working: boolean }>();
    createCrawler(id: number, config: { taskType?: TaskType }) {
        if (!this.device) throw new Error("创建Crawler前必须初始化浏览器");

        let taskQueue = new TaskQueue(SiteTag.liepin, config.taskType, 1);
        let crawler = new CrawlerLiepin(this.device, taskQueue);
        this.crawlers.set(id, { crawler, working: false });
        crawler.on("scheduleUpdate", function (this: CrawlerLiepin) {
            AppCenter.sendParent("scheduleUpdate", { total: this.totalSchedule, current: this.currentSchedule }, id);
        });
        crawler.on("taskFinished", (taskResult) => {
            AppCenter.sendParent("taskFinished", taskResult, id);
        });
        crawler.on("workFinished", (taskResult) => {
            AppCenter.sendParent("workFinished", taskResult, id);
        });
        crawler.on("jobTaskRest", (skipList: number[]) => {
            AppCenter.sendParent("jobTaskRest", skipList, id);
        });
        crawler.on("reportAuth", () => {
            AppCenter.sendParent("reportAuth", undefined, id);
        });
        crawler.on("statisticsUpdate", function (this: CrawlerLiepin) {
            AppCenter.sendParent("statisticsUpdate", this.statistics, id);
        });
        AppCenter.sendParent("createCrawler", { id });
    }
    removeCrawler(id: number) {
        let crawler = this.taskBreak(id);
        if (!crawler) return false;

        AppCenter.sendParent("removeCrawler", { id });
        return this.crawlers.delete(id);
    }
    async startWork(id: number) {
        let crawler = this.crawlers.get(id)?.crawler;
        AppCenter.sendParent("startWork");
        return crawler?.startWork();
    }
    async stopWork(id: number, abort?: boolean) {
        let crawler = this.crawlers.get(id)?.crawler;
        crawler?.stopWork(abort);
    }
    async excTask(id: number, task: any) {
        let crawlerInfo = this.crawlers.get(id);
        if (!crawlerInfo || crawlerInfo.abc) return;
        crawlerInfo.abc = new AbortController();
        try {
            await crawlerInfo.crawler.executeTask(task, crawlerInfo.abc.signal);
        } catch (error) {
            AppCenter.sendParent("error", error);
        }
        crawlerInfo.abc = undefined;
    }

    taskBreak(id: number) {
        let { crawler, abc } = this.crawlers.get(id) ?? {};
        abc?.abort();
        return crawler;
    }
    resetCount(id: number) {
        let { crawler, abc } = this.crawlers.get(id) ?? {};
        crawler?.resetCount();
    }
}

new AppCenter();
AppCenter.sendParent("init");
AppCenter.sendParent("memory", process.memoryUsage());
