import { Crawler, UnexecutedCompanyTask, UnexecutedJobTask } from "./crawler";
import { BrowserContext } from "playwright";
import { UnexecutedCrawlerTask } from "../../db";
import { LiePinCompanyDetail, LiePinJobList, PageNumControllable } from "../sites/liepin";
import { radomWaitTime } from "../classes/time";
import { SiteTag, TaskType } from "api/model";
import { DeepAssignFilter } from "../classes/crawl_action";
import { TaskQueue } from "../classes/task_queue";
import { TimeoutPromise, PromiseHandle } from "@asnc/tslib/lib/async";

/**
 * @event data
 */
export class CrawlerLiepin extends Crawler {
    siteTag = SiteTag.liepin;
    constructor(browserContext: BrowserContext, taskQueue: TaskQueue) {
        super(taskQueue);
        const origin = "https://www.liepin.com";
        this.companyTask = new LiePinCompanyDetail(browserContext, origin);
        this.jobTask = new LiePinJobList(browserContext, origin);

        this.companyTask.on("data", this.onData);
        this.companyTask.on("error", this.onError);
        this.companyTask.on("auth", this.reportAuth.bind(this));
        this.jobTask.on("data", this.onData);
        this.jobTask.on("error", this.onError);
        this.jobTask.on("auth", this.reportAuth.bind(this));
    }
    private onData = ({ jobList, compList }: { jobList: any[]; compList?: any[] }) => {
        if (compList) this.saveCompanies(compList);
        if (jobList) this.saveJobs(jobList);
        this.ctHandle?.resolve(jobList.length);
        this.ctHandle = undefined;
        this.emit("data");
    };
    private onError = (err: any) => {
        this.reportError("页面控制器触发异常", err);
    };

    private companyTask: LiePinCompanyDetail;
    private jobTask: LiePinJobList;
    private excreting = false;
    async executeTask(task: UnexecutedCrawlerTask, signal?: AbortSignal): Promise<{ pass: boolean; result?: any }> {
        if (this.excreting) throw new Error("执行任务中不能继续执行");
        this.excreting = true;
        let res: any;
        if (task.type === TaskType.company) res = await this.excCompanyTask(task as UnexecutedCompanyTask, signal);
        else if (task.type === TaskType.jobFilter) res = await this.excJobTask(task as UnexecutedJobTask, signal);
        else res = { pass: false };
        this.excreting = false;
        return res;
    }
    private ctHandle?: PromiseHandle<number | void>;
    randomTime() {
        this.ctHandle = new TimeoutPromise(30 * 1000, true);
        return Promise.all([this.ctHandle, radomWaitTime(2 * 1000, 6 * 1000)]).then(([count]) => count ?? 0);
    }
    async excCompanyTask(task: UnexecutedCompanyTask, signal?: AbortSignal) {
        let ctrl = await this.companyTask.open({ companyId: task.taskInfo });
        let totalJob = await ctrl.getTotalJob();
        let totalPage = Math.ceil(totalJob / 30);
        this.resetSchedule(totalPage);

        let errors: any[] = [];
        let crawlCount = await this.traversePageNum(ctrl, errors, signal, task);

        if (errors.length) this.reportError("公司页面翻页出错", errors);
        await ctrl.close();
        return { pass: crawlCount / totalJob > 0.75, result: { total: totalJob, crawlCount } };
    }
    async excJobTask(task: UnexecutedJobTask, signal?: AbortSignal) {
        let ctrl = await this.jobTask.open(task.taskInfo.fixedFilter);

        let filterInfo = ctrl.createDeepAssignFilter();
        let filter = filterInfo.object;
        let jobTask = new JobTask(filter, signal);
        this.resetSchedule(filterInfo.total * 10);

        filterInfo.lev.push(9);

        let filterGeneratorErrors = jobTask.filterGeneratorErrors;
        let traversePageNumErrors: any[][] = [];

        let firstLast = false;

        do {
            if (jobTask.breakSignal) break;
            let randomTime = this.randomTime();
            let isFullList = !(await ctrl.isFullList());
            let res = await jobTask.nextFilter(isFullList);
            if (res === undefined) break; //结束
            if (isFullList || (!firstLast && res.isLast)) firstLast = true; //遍完一次到最后一个选项

            this.currentSchedule = ctrl.excCount([...filter.assignRes, 0], filterInfo.lev);

            await randomTime.catch(() => this.reportError("等待响应超时", task));
            if (jobTask.count % 8 === 0) await ctrl.refresh();
            if (firstLast) {
                let errors: any[] = [];
                let crawlCount = await this.traversePageNum(ctrl, errors, signal, task);
                if (errors) traversePageNumErrors.push(errors);
            }
        } while (true);
        if (filterGeneratorErrors.length) this.reportError("迭代过滤选项失败", filterGeneratorErrors);
        if (traversePageNumErrors.length) this.reportError("职位翻页出错", traversePageNumErrors);
        await ctrl.close();

        return {
            pass: !jobTask.breakSignal && filter.assignRes[0] / filterInfo.index[0] > 0.6,
            result: { index: filterInfo.index, result: filter.assignRes },
        };
    }

    //翻页
    async traversePageNum(
        pageCtrl: PageNumControllable,
        errors: any[],
        signal?: AbortSignal,
        task?: UnexecutedCrawlerTask
    ) {
        let breakSignal = false;
        let abortActon = () => (breakSignal = true);
        signal?.addEventListener("abort", abortActon);

        let crawlCount = 0;
        for await (const res of pageCtrl.pageNumIterator(errors)) {
            this.currentSchedule++;

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

        return crawlCount;
    }
}

class JobTask {
    filterGeneratorErrors: number[][] = [];
    breakSignal = false;
    private filterGenerator;

    count = 0;
    constructor(readonly filter: DeepAssignFilter, readonly signal?: AbortSignal) {
        signal?.addEventListener("abort", this.onAbort);
        this.filterGenerator = this.filter.assign();
    }
    private onAbort = () => {
        this.breakSignal = true;
    };
    private fin() {
        this.done = true;
        this.signal?.removeEventListener("abort", this.onAbort);
    }
    done = false;
    async nextFilter(skipDeep: boolean): Promise<void | {
        value: boolean;
        isLast: boolean;
    }> {
        let { done, value } = await this.filterGenerator.next(skipDeep);
        this.count++;
        if (done || this.breakSignal) {
            return this.fin();
        }

        while (!value) {
            this.filterGeneratorErrors.push(this.filter.assignRes);
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
}
