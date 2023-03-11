import { Crawler, UnexecutedCompanyTask, UnexecutedJobTask } from "./crawler";
import { BrowserContext } from "playwright";
import { UnexecutedCrawlerTask } from "../../db";
import { LiePinCompanyDetail, LiePinJobList, PageNumControllable } from "../sites/liepin";
import { radomWaitTime } from "common/async/time";
import { SiteTag, TaskType } from "api/model";
import { DeepAssignFilter } from "../classes/crawl_action";
import { TaskQueue } from "../classes/task_queue";

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
        this.emit("data");
    };
    private onError = (err: any) => {
        this.reportError("页面控制器触发异常", err);
    };

    private companyTask: LiePinCompanyDetail;
    private jobTask: LiePinJobList;
    async executeTask(task: UnexecutedCrawlerTask, signal?: AbortSignal) {
        if (task.type === TaskType.company)
            return this.excCompanyTask(task as UnexecutedCompanyTask, signal).catch((e) => false);
        else if (task.type === TaskType.jobFilter)
            return this.excJobTask(task as UnexecutedJobTask, signal).catch((e) => false);
        return false;
    }
    randomTime() {
        return radomWaitTime(2 * 1000, 6 * 1000);
    }
    async excCompanyTask(task: UnexecutedCompanyTask, signal?: AbortSignal) {
        let ctrl = await this.companyTask.open({ companyId: task.taskInfo });

        let breakSignal = false;
        let abortActon = () => (breakSignal = true);
        signal?.addEventListener("abort", abortActon);

        let errors: any[] = [];

        await this.traversePageNum(ctrl, signal);

        signal?.removeEventListener("abort", abortActon);
        if (errors.length) this.reportError("公司页面翻页出错", errors);
        await ctrl.close();
        return !breakSignal;
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

            await randomTime;
            if (jobTask.count % 8 === 0) await ctrl.refresh();
            if (firstLast) {
                let errors = await this.traversePageNum(ctrl, signal);
                if (errors) traversePageNumErrors.push(errors);
            }
        } while (true);
        if (filterGeneratorErrors.length) this.reportError("迭代过滤选项失败", filterGeneratorErrors);
        if (traversePageNumErrors.length) this.reportError("职位翻页出错", traversePageNumErrors);
        await ctrl.close();
        return !jobTask.breakSignal;
    }

    //翻页
    async traversePageNum(pageCtrl: PageNumControllable, signal?: AbortSignal) {
        let breakSignal = false;
        let abortActon = () => (breakSignal = true);
        signal?.addEventListener("abort", abortActon);

        let errors: any[] = [];
        let count = 0;
        for await (const res of pageCtrl.pageNumIterator(errors)) {
            count++;
            this.currentSchedule += count;

            if (breakSignal) break;
            await this.randomTime();
            if (breakSignal) break;
        }
        signal?.removeEventListener("abort", abortActon);
        if (errors) return errors;
    }
}

class JobTask {
    filterGeneratorErrors: number[][] = [];
    traversePageNumErrors: any[][] = [];
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
