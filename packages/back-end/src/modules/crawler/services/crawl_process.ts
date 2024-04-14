import { ChildProcess, fork } from "node:child_process";
import { EventEmitter } from "node:events";
import type { CreateCrawlProcessOptions } from "common/request/crawler/crawl_process.js";
import type {
  CreateCrawlerOptions,
  CrawlerInfo,
} from "common/request/crawler/crawler.js";
import { CrawlerProcessStatus, CrawlerStatus } from "common/request/enum.js";
import type {
  CrawlerPriorityCompanyTask,
  CrawlerPriorityJobFilterTask,
} from "common/model/index.js";
type TaskInfo = CrawlerPriorityCompanyTask | CrawlerPriorityJobFilterTask;
/**
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

  private onCrawlNew = () => {
    for (const [id, crawler] of this.crawlers) {
      if (crawler.status === CrawlerStatus.stopped && crawler.config.isAuto) {
        this.startWork(id);
      }
    }
  };
  private internalId?: NodeJS.Timeout;
  async start(
    args: string[] = [],
    nodeArgs: string[] = []
  ): Promise<void | never> {
    if (this.process) throw new Error("进程不能重复启动");
    this.internalId = setInterval(this.onCrawlNew, 3 * 86400 * 1000);
    let execArgv = [...nodeArgs];
    if (this.info.memoryLimit) {
      // execArgv.push("--max-old-space-size");
      // execArgv.push(this.info.memoryLimit.toString());
    }
    const pc = fork(this.appPath, args, {
      cwd: process.cwd(),
      execArgv,
    });
    this.process = pc;
    pc.on("error", (e) => {
      let errors = this.info.errors;
      if (errors.length > 10) errors.pop();
      errors.unshift({ time: new Date(), error: e });
    });
    pc.on("exit", () => {
      this.#status = CrawlerProcessStatus.stop;
      if (this.internalId) clearInterval(this.internalId);
      this.process = undefined;
      this.emit("exit");
    });
    pc.on("message", ({ data, type, id }: CrawlProcessMessage) => {
      if (id !== undefined) {
        let crawler = this.crawlers.get(id);
        crawler?.emit(type, data);
      } else {
        switch (type) {
          case "init":
            this.#status = CrawlerProcessStatus.running;
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
      for (const [id, crawler] of this.crawlers) {
        crawler.close();
      }
      this.process.kill();
      this.#status = CrawlerProcessStatus.stopping;
    }
  }
  #status = CrawlerProcessStatus.stop;
  get status() {
    return this.#status;
  }

  private crawlers = new Map<number, CrawlerHandle>();
  private nextCrawlerId = 1;
  createCrawler(config: CreateCrawlerOptions) {
    let id = this.nextCrawlerId++;
    let name = config.name ?? id.toString();
    const crawler = new CrawlProcess.CrawlerHandle(id, { ...config, name });
    this.crawlers.set(id, crawler);
  }

  async removeCrawler(id: number) {
    const crawler = this.getCrawler(id);
    if (crawler.status === CrawlerStatus.stopped) {
      this.crawlers.delete(id);
      return;
    }
    this.stopWork(id, true);
    crawler.on("stopWork", () => {
      this.crawlers.delete(id);
    });
  }
  private getCrawler(id: number): CrawlerHandle | never {
    const crawler = this.crawlers.get(id);
    if (!crawler) throw new Error("不存在的id");
    return crawler;
  }
  getAllCrawlerInfo() {
    let list: CrawlerInfo[] = [];
    for (const [id, c] of this.crawlers) {
      list.push({
        config: c.config,
        errors: c.errors,
        id,
        reportAuth: c.reportAuth,
        schedule: c.schedule,
        status: c.status,
        currentTask: c.currentTask,
        startWorkDate: c.startWorkDate,
        statistics: c.statistics,
      });
    }
    return list;
  }

  updateCrawlerConfig(
    crawlerId: number,
    config: Pick<CreateCrawlerOptions, "name" | "taskCountLimit">
  ) {
    let crawler = this.getCrawler(crawlerId);
    Object.assign(crawler.config, config);
  }
  startWork(crawlerId: number): Promise<void | never> {
    if (this.#status !== CrawlerProcessStatus.running)
      throw new Error("进程的当前状态无法启动 Crawler");
    const crawler = this.getCrawler(crawlerId);
    if (crawler.status !== CrawlerStatus.stopped)
      throw new Error("当前状态无法启动");
    crawler.status = CrawlerStatus.starting;
    return this.sendMsg("startWork", crawler.config, crawlerId);
  }
  stopWork(crawlerId: number, abort?: boolean) {
    const crawler = this.getCrawler(crawlerId);
    if (crawler.status !== CrawlerStatus.working)
      throw new Error("当前状态无法终止 Crawler");
    crawler.status = CrawlerStatus.stopping;
    return this.sendMsg("stopWork", { abort }, crawlerId);
  }

  private sendMsg(type: string, data?: any, id?: number) {
    return processSend(this.process!, { type, data, id });
  }
  /**
   * @event scheduleUpdate [data,id]
   * @event statisticsUpdate [data,id]
   *
   * @event taskFinished [data,id]
   * @event workFinished [undefined,id]
   *
   * @event jobTaskRest [data,id]
   * @event reportAuth [undefined,id]
   * @event startWork [undefined,id]
   */
  private static CrawlerHandle = class CrawlerHandle extends EventEmitter {
    constructor(readonly id: number, readonly config: CreateCrawlerOptions) {
      super();
      this.initEvent();
    }
    errors: string[] = [];
    schedule = { total: 0, current: 0 };
    statistics: any = {};
    reportAuth = false;
    currentTask?: TaskInfo;
    startWorkDate?: Date;
    private initEvent() {
      this.on("scheduleUpdate", (data) => (this.schedule = data));
      this.on("statisticsUpdate", (data) => (this.statistics = data));
      this.on("error", (data) => {
        if (this.errors.length > 20) this.errors.pop();
        this.errors.push(data.toString());
      });

      this.on("reportAuth", () => (this.reportAuth = true));
      this.on("startWork", () => {
        this.status = CrawlerStatus.working;
        this.startWorkDate = new Date();
      });
      this.on("stopWork", this.close);
      this.on("taskExc", (task) => (this.currentTask = task));
      // this.on("workFinished", () => (this.status = CrawlerStatus.starting));
      // this.on("taskFinished", (taskResult) => {});
      // this.on("jobTaskRest", (skipList) => {});
    }
    close = () => {
      this.status = CrawlerStatus.stopped;
      this.currentTask = undefined;
      this.startWorkDate = undefined;
    };
    status = CrawlerStatus.stopped;
  };
}
export type CrawlerHandle = InstanceType<
  (typeof CrawlProcess)["CrawlerHandle"]
>;

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
