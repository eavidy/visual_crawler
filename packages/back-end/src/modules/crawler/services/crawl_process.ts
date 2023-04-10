import { ChildProcess, fork } from "node:child_process";
import { EventEmitter } from "node:events";
import type { CreateCrawlProcessOptions, CreateCrawlerOptions } from "common/request/crawler/crawl_process";
import { CrawlerProcessStatus } from "common/request/enum";
/**
 * @event createCrawler {id}
 * @event removeCrawler {id}
 * @event initDevice void
 * @event memory
 * @event error error
 */
export class CrawlProcess extends EventEmitter {
    private process?: ChildProcess;
    get pid() {
        return this.process?.pid;
    }
    processId = 0;
    readonly info: Required<CreateCrawlProcessOptions> & {
        startRunTime?: number;
        errors: { time: Date; error: Error }[];
    };
    constructor(private appPath: string, info: CreateCrawlProcessOptions) {
        super();
        const { memoryLimit = 200, name = "" } = info;
        this.info = { memoryLimit, name, errors: [] };
    }
    async start(args: string[] = []): Promise<void | never> {
        if (this.process) throw new Error("进程不能重复启动");
        const pc = fork(this.appPath, ["--max-old-space-size", this.info.memoryLimit.toString(), ...args], {
            cwd: process.cwd(),
        });
        this.process = pc;
        pc.on("error", (e) => {
            let errors = this.info.errors;
            if (errors.length > 10) errors.pop();
            errors.unshift({ time: new Date(), error: e });
        });
        pc.on("exit", () => {
            this.#status = CrawlerProcessStatus.stop;
            this.process = undefined;
            this.emit("exit");
        });
        pc.on("message", ({ data, type, id }: CrawlProcessMessage) => {
            if (id !== undefined) {
                let crawler = this.crawlers.get(id);
                crawler?.emit(type, data);
            } else {
                switch (type) {
                    case "createCrawler":
                        this.onCreateCrawlerFin(data);
                        break;
                    case "removeCrawler":
                        this.onRemoveCrawlerFin(data);
                        break;
                    case "init":
                        this.onChildProcessInit();
                        break;
                    case "memory":
                        this.memory = data as NodeJS.MemoryUsage;
                        break;
                    default:
                        this.emit(type, data);
                        break;
                }
            }
        });
        this.#status = CrawlerProcessStatus.starting;
        this.info.startRunTime = Date.now();
    }
    memory?: NodeJS.MemoryUsage;
    getMemoryUsage() {
        return this.sendMsg("getMemory");
    }
    kill() {
        if (this.process) {
            this.process.kill();
            this.#status = CrawlerProcessStatus.stopping;
        }
    }
    #status = CrawlerProcessStatus.stop;
    get status() {
        return this.#status;
    }
    private onChildProcessInit() {
        this.#status = CrawlerProcessStatus.running;
    }
    private onRemoveCrawlerFin({ id }: { id: number }) {
        this.crawlers.delete(id);
    }
    private onCreateCrawlerFin({ id }: { id: number }) {
        const crawler = this.crawlers.get(id);
        if (crawler) crawler.status = 1;
    }
    private crawlers = new Map<number, CrawlerHandle>();
    private nextCrawlerId = 1;
    async createCrawler(config: CreateCrawlerOptions) {
        let id = this.nextCrawlerId + 1;
        this.nextCrawlerId = id;
        this.crawlers.set(id, new CrawlProcess.CrawlerHandle(id, config));
        if (this.process) await this.sendMsg("createCrawler", { id, config });
    }
    async initDriver() {
        await this.sendMsg("initDevice");
    }
    async removeCrawler(id: number) {
        await this.sendMsg("removeCrawler", { id });
    }

    private sendMsg(type: string, data?: any, id?: number) {
        return processSend(this.process!, { type, data, id });
    }

    startWork(crawlerId: number) {
        this.sendMsg("startWork", undefined, crawlerId);
    }
    stopWork(crawlerId: number, abort?: boolean) {
        this.sendMsg("stopWork", { abort }, crawlerId);
    }
    /**
     * @event scheduleUpdate [data,id]
     * @event statisticsUpdate [data,id]
     * @event taskFinished [data,id]
     * @event jobTaskRest [data,id]
     * @event reportAuth [undefined,id]
     * @event workFinished [undefined,id]
     * @event startWork [undefined,id]
     */
    private static CrawlerHandle = class CrawlerHandle extends EventEmitter {
        constructor(readonly id: number, private config: CreateCrawlerOptions) {
            super();
            this.initEvent();
        }
        schedule: any;
        statistics: any;
        reportAuth = false;
        working = false;
        private initEvent() {
            this.on("initDrive", () => (this.initDrive = true));

            this.on("scheduleUpdate", (data) => (this.schedule = data));
            this.on("statisticsUpdate", (data) => (this.statistics = data));
            this.on("reportAuth", () => (this.reportAuth = true));
            this.on("startWork", () => (this.working = true));
            this.on("workFinished", () => (this.working = false));
            // this.on("taskFinished", (taskResult) => {});
            // this.on("jobTaskRest", (skipList) => {});
        }
        status = 0;
        initDrive = false;
    };
}
export type CrawlerHandle = InstanceType<typeof CrawlProcess["CrawlerHandle"]>;

function processSend(process: ChildProcess, msg: any) {
    return new Promise<void>(function (resolve, reject) {
        process.send(msg, function (e) {
            if (e) reject(e);
            else resolve();
        });
    });
}
interface CrawlProcessMessage {
    type: string;
    data: any;
    id?: number;
}
