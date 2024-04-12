import {
  Crawler,
  UnexecutedCompanyTask,
  UnexecutedJobTask,
} from "./crawler.js";
import { UnexecutedCrawlerTask } from "../../db/index.js";
import {
  LiePinCompanyDetail,
  LiePinJobList,
  PageNumControllable,
} from "../sites/liepin/index.js";
import { radomWaitTime } from "../classes/time.js";
import { SiteTag, TaskType } from "common/model/index.js";
import { DeepAssignFilter } from "../classes/crawl_action.js";
import { TaskQueue } from "../classes/task_queue.js";
import { afterTime, withPromise, WithPromise, promiseHandle } from "evlib";
import { CrawlerDevice } from "../classes/browser.js";

/**
 * @event data
 * @event jobTaskRest
 */
export class CrawlerLiepin extends Crawler {
  siteTag = SiteTag.liepin;
  readonly origin = "https://www.liepin.com";
  constructor(
    readonly browser: CrawlerDevice,
    taskQueue: TaskQueue,
  ) {
    super(taskQueue);
  }
  private async crateLiepinCompanyDetail() {
    let context = await this.browser.newContext();
    let liepin = new LiePinCompanyDetail(context, this.origin);
    liepin.on("data", this.onData);
    liepin.on("error", this.onError);
    liepin.on("auth", this.reportAuth.bind(this));
    return liepin;
  }
  private async createLiepinPageList() {
    let liepJobList = new LiePinJobList(
      await this.browser.newContext(),
      this.origin,
    );
    liepJobList.on("data", this.onData);
    liepJobList.on("error", this.onError);
    liepJobList.on("auth", this.reportAuth.bind(this));
    return liepJobList;
  }
  private onData = ({
    jobList,
    compList,
  }: {
    jobList: any[];
    compList?: any[];
  }) => {
    if (compList?.length) this.saveCompanies(compList);
    if (jobList?.length) this.saveJobs(jobList);
    this.ctHandle?.resolve(jobList.length);
    this.ctHandle = undefined;
    this.emit("data");
  };
  private onError = (err: any) => {
    this.reportError("页面控制器触发异常", err);
  };

  #excreting = false;
  get getExcreting() {
    return this.#excreting;
  }
  async executeTask(
    task: UnexecutedCrawlerTask,
    signal?: AbortSignal,
  ): Promise<{ pass: boolean; result?: any }> {
    if (this.#excreting) throw new Error("执行任务中不能继续执行");
    this.#excreting = true;
    let res: any;
    if (task.type === TaskType.company)
      res = await this.excCompanyTask(task as UnexecutedCompanyTask, signal);
    else if (task.type === TaskType.jobFilter)
      res = await this.excJobTask(task as UnexecutedJobTask, signal);
    else res = { pass: false };
    this.#excreting = false;
    return res;
  }
  private ctHandle?: Promise<number | void> & {
    resolve(arg: number | void): void;
    reject(): void;
  };
  randomTime(): Promise<number> {
    this.ctHandle = timeoutPromise(30 * 1000, true);
    return Promise.all([this.ctHandle, radomWaitTime(2 * 1000, 4 * 1000)]).then(
      ([count]) => count ?? 0,
    );
  }
  private companyTaskCount = 0;
  private liepinCompanyDetail?: LiePinCompanyDetail;
  async excCompanyTask(
    task: UnexecutedCompanyTask,
    signal?: AbortSignal,
  ): Promise<{ pass: boolean; result: any }> {
    let companyTask;
    if (this.liepinCompanyDetail) {
      companyTask = this.liepinCompanyDetail;
      if (this.companyTaskCount > 200) {
        this.companyTaskCount = 0;
        await companyTask.closeBrowserContext();
        companyTask = await this.crateLiepinCompanyDetail();
        this.liepinCompanyDetail = companyTask;
      }
    } else {
      companyTask = await this.crateLiepinCompanyDetail();
      this.liepinCompanyDetail = companyTask;
    }
    let ctrl;
    try {
      ctrl = await companyTask.open({ companyId: task.taskInfo });
    } catch (error) {
      return { pass: false, result: "页面打开失败" };
    }
    let totalJob = await ctrl.getTotalJob();
    let result;
    if (totalJob) {
      let totalPage = Math.ceil(totalJob / 30);
      this.companyTaskCount += totalPage;
      this.resetSchedule(totalPage);

      let errors: any[] = [];
      let { crawlCount, pageNum } = await this.traversePageNum(
        ctrl,
        errors,
        signal,
        task,
      );

      if (errors.length)
        this.reportError("公司页面翻页出错", { child: errors, task });
      result = {
        pass: crawlCount / totalJob > 0.75,
        result: { total: totalJob, crawlCount },
      };
    } else result = { pass: true, result: { total: 0, crawlCount: 0 } };
    await ctrl.close();
    return result;
  }
  async excJobTask(
    task: UnexecutedJobTask,
    signal?: AbortSignal,
  ): Promise<{ pass: boolean; result: any }> {
    let jobTask: JobTask;
    let skipList: number[] | undefined = task.taskInfo.skipList;
    do {
      let liepJobList = await this.createLiepinPageList();
      let randomTime = this.randomTime();
      let pageCtrl;
      try {
        pageCtrl = await liepJobList.open(task.taskInfo.fixedFilter);
      } catch (error) {
        await liepJobList.closeBrowserContext();
        return { pass: true, result: "页面打开失败" };
      }
      jobTask = new JobTask(pageCtrl, this, task, skipList, signal);
      this.resetSchedule(jobTask.deepFilter.total * 9);
      try {
        await randomTime; //等待响应
      } catch (error) {
        await liepJobList.closeBrowserContext();
        break;
      }
      await jobTask.goToLimit(100);

      skipList = jobTask.deepFilter.assignRes.map((val) => (val ? val - 1 : 0));
      await this.updateTaskInfo(task, { ...task.taskInfo, skipList });
      this.emit("jobTaskRest", skipList);
      jobTask.destroy();
      await liepJobList.closeBrowserContext();
    } while (!jobTask.isFinished && !jobTask.breakSignal);
    return jobTask.excResult();
  }

  //翻页
  async traversePageNum(
    pageCtrl: PageNumControllable,
    errors: any[],
    signal?: AbortSignal,
    task?: UnexecutedCrawlerTask,
  ) {
    let breakSignal = false;
    let abortActon = () => (breakSignal = true);
    signal?.addEventListener("abort", abortActon);

    let crawlCount = 0;
    let pageNum = 0;
    for await (const res of pageCtrl.pageNumIterator(errors)) {
      if (res && (await pageCtrl.isAuth())) {
        //todo: 处理认证
        break;
      }
      this.currentSchedule++;
      pageNum++;

      if (breakSignal) break;
      if (res) {
        crawlCount += await this.randomTime().catch(() => {
          this.reportError("等待响应超时", task);
          return 0;
        });
      }
      if (breakSignal) break;
    }
    signal?.removeEventListener("abort", abortActon);

    return { crawlCount, pageNum };
  }
  clearMemory() {
    if (this.liepinCompanyDetail) {
      this.liepinCompanyDetail.closeBrowserContext();
      this.liepinCompanyDetail = undefined;
    }
  }
}

type PageCtrl = Awaited<ReturnType<LiePinJobList["open"]>>;

class JobTask {
  filterGeneratorErrors: number[][] = [];
  traversePageNumErrors: any[] = [];
  breakSignal = false;

  private readonly filterGenerator;
  readonly deepFilter: DeepAssignFilter;

  constructor(
    private readonly pageCtrl: PageCtrl,
    private readonly crawler: CrawlerLiepin,
    private readonly task: UnexecutedJobTask,
    skipList?: number[],
    private readonly signal?: AbortSignal,
  ) {
    signal?.addEventListener("abort", this.onAbort);
    this.deepFilter = pageCtrl.createDeepAssignFilter();
    this.filterGenerator = this.deepFilter.assign(skipList);
  }
  private onAbort = () => (this.breakSignal = true);

  get isFinished() {
    return this.#fin;
  }
  destroy() {
    this.signal?.removeEventListener("abort", this.onAbort);
  }
  #fin = false;
  private fin() {
    this.#fin = true;
    this.destroy();
  }

  count = 0;
  private async nextFilter(skipDeep: boolean): Promise<void | {
    value: boolean;
    isLast: boolean;
  }> {
    let { done, value } = await this.filterGenerator.next(skipDeep);
    this.count++;
    if (done || this.breakSignal) return this.fin();

    while (!value) {
      this.filterGeneratorErrors.push(this.deepFilter.assignRes);
      let res = await this.filterGenerator.next();
      value = res.value;
      done = res.done;
      if (done) return this.fin();
    }
    return value as {
      value: boolean;
      isLast: boolean;
    };
  }

  async goToFirstLast() {
    let ctrl = this.pageCtrl;
    do {
      let isFullList = await ctrl.isFullList();
      if (!isFullList) return this.isFinished;
      let res = await this.nextFilter(!isFullList);
      if (res === undefined) return true;
      if (res.isLast) return this.isFinished;
      if (this.breakSignal) return true;
      await afterTime(2000);
    } while (true);
  }
  async goToLimit(limitCount: number) {
    const pageCtrl = this.pageCtrl;
    let isFullList = true;
    do {
      if (this.breakSignal) break;
      let randomTime = this.crawler.randomTime();

      let res = await this.nextFilter(!isFullList);
      if (res && (await pageCtrl.isAuth())) {
        //todo:处理验证
      }
      await randomTime.catch(() =>
        this.crawler.reportError("等待响应超时", {
          task: this.task,
          index: this.deepFilter.assignRes,
        }),
      );
      isFullList = await pageCtrl.isFullList();

      let isLast = res?.isLast || !isFullList;
      if (res === undefined || (isLast && this.count > limitCount)) break; //结束
      let newSchedule = this.deepFilter.getCurrent() * 9;
      if (newSchedule > this.crawler.currentSchedule)
        this.crawler.currentSchedule = newSchedule;
      if (this.breakSignal) break;

      if (res?.isLast && isFullList) {
        const { pageNum } = await this.crawler.traversePageNum(
          pageCtrl,
          this.traversePageNumErrors,
          this.signal,
          this.task,
        );
        this.count += pageNum;
      }
    } while (true);

    await pageCtrl.close();
  }

  /** 计算任务结果 */
  excResult() {
    let deepFilter = this.deepFilter;
    return {
      pass:
        this.#fin ||
        (!this.breakSignal &&
          deepFilter.assignRes[0] / deepFilter.index[0] > 0.6),
      result: { index: deepFilter.index, result: deepFilter.assignRes },
    };
  }
  getCurrentScheduleIndex() {
    return [...this.deepFilter.assignRes];
  }
}

function timeoutPromise<T>(
  time: number,
  isReject = false,
): Promise<T> & { resolve(data: T | void): void; reject(): void } {
  const { promise, reject, resolve } = withPromise<void>();
  const id = setTimeout(isReject ? reject : resolve, time);
  //@ts-ignore
  promise.resolve = () => {
    clearTimeout(id);
    return resolve();
  };
  //@ts-ignore
  promise.reject = () => {
    clearTimeout(id);
    return reject(undefined);
  };
  //@ts-ignore
  return promise;
}
