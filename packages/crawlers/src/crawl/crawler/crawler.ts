import { TaskQueue } from "../classes/task_queue";
import { jobsData, companyData, taskQueueData, errorLogData, UnexecutedCrawlerTask, UnexecutedTask } from "../../db";
import {
    CompanyCrawlerDataAppend,
    CrawlerPriorityCompanyTask,
    CrawlerPriorityJobFilterTask,
    JobCrawlerData,
    SiteTag,
    TaskType,
} from "api/model";
import { EventEmitter } from "node:events";

/**
 * @event scheduleUpdate 进度更新
 * @event taskFinished 完成一个任务 taskResult:boolean 任务是否完成, false 为中断
 * @event taskQueueFinished 任务队列清空
 * @event reportError
 * @event reportAuth
 */
export abstract class Crawler extends EventEmitter {
    abstract siteTag: SiteTag;
    constructor(protected taskQueue: TaskQueue) {
        super();
        this.resetCount();
    }

    async reportError(msg: string, cause: any) {
        let info = {
            class: this.constructor.name,
            siteTag: this.siteTag,
            msg,
            cause,
        };
        errorLogData.appendLog(info);
        this.emit("reportError", JSON.stringify(info, null, 2));
    }
    async reportAuth() {
        this.emit("reportAuth");
    }
    #statistics!: CrawlerStatistics;
    get statistics() {
        let res = this.#statistics;
        return { ...res };
    }
    resetCount() {
        this.#statistics = {
            newJob: 0,
            newCompany: 0,
            jobRepeated: 0,
            companyRepeated: 0,

            taskCompleted: 0,
            taskFailed: 0,
        };
    }

    async saveJobs(jobDates: JobCrawlerData[]) {
        if (jobDates.length === 0) return;
        try {
            let { inserted, uninserted, checkFail } = await jobsData.appendJobs(jobDates, this.siteTag);
            let info = this.#statistics;
            info.jobRepeated += uninserted?.length ?? 0;
            info.newJob += inserted.length;
            if (checkFail) this.reportError("保存职位数据校验出错", checkFail);
        } catch (error) {
            this.reportError("保存职位数据时出现异常", this.errToJson(error));
        }
    }
    async saveCompanies(companies: CompanyCrawlerDataAppend[]) {
        if (companies.length === 0) return;
        try {
            let { inserted, uninserted, checkFail } = await companyData.appendCompanies(companies, this.siteTag);
            let info = this.#statistics;
            info.newCompany += inserted.length;
            info.companyRepeated += uninserted?.length ?? 0;
            if (checkFail) this.reportError("保存公司数据校验出错", checkFail);

            //新公司, 加入到爬取任务队列
            if (inserted.length) {
                await taskQueueData
                    .appendTasks(
                        inserted.map((company) => ({
                            siteTag: this.siteTag,
                            type: TaskType.company,
                            taskInfo: company.companyId,
                        }))
                    )
                    .catch((error) => {
                        this.reportError("添加公司任务到队列出错", this.errToJson(error));
                    });
            }
        } catch (error) {
            this.reportError("保存公司数据时出现异常", this.errToJson(error));
        }
    }

    abstract executeTask(task: UnexecutedCrawlerTask, abc?: AbortSignal): Promise<{ pass: boolean; result?: any }>;
    private errToJson(err: any) {
        if (err instanceof Error) {
            return {
                message: err.message,
                stack: err.stack,
                cause: err.cause,
            };
        }
        return err;
    }
    totalSchedule = 0;
    #currentSchedule = 0;
    get currentSchedule() {
        return this.#currentSchedule;
    }
    set currentSchedule(val: number) {
        this.#currentSchedule = val;
        this.emit("scheduleUpdate");
    }
    resetSchedule(total: number, current = 0) {
        this.totalSchedule = total;
        this.#currentSchedule = current;
        this.emit("scheduleUpdate");
    }

    async startWork() {
        if (this.working) return;
        this.endureWork = true;
        let abc = new AbortController();
        this.abc = abc;

        while (this.endureWork) {
            let task = await this.taskQueue.takeTask();
            if (!task) break;
            let id = task._id;
            let { pass, result } = await this.executeTask(task, abc.signal);
            this.resetSchedule(0);
            if (pass) {
                this.#statistics.taskCompleted++;
                await taskQueueData.markTasksSucceed(id, result);
            } else {
                this.#statistics.taskFailed++;
                await taskQueueData.markTasksFailed(id, result);
            }

            this.emit("taskFinished", { pass, result });
        }
        this.abc = undefined;
        this.emit("taskQueueFinished");
    }
    stopWork(abort = false) {
        this.taskQueue.restoreTask(); //保存缓存中未执行的任务
        this.endureWork = false;
        if (abort) this.abc?.abort();
    }
    get working() {
        return !!this.abc;
    }
    private endureWork = true;
    private abc?: AbortController;
}
type CrawlerStatistics = {
    newJob: number;
    newCompany: number;
    jobRepeated: number;
    companyRepeated: number;
    taskCompleted: number;
    taskFailed: number;
};
export type UnexecutedJobTask = UnexecutedTask<CrawlerPriorityJobFilterTask>;
export type UnexecutedCompanyTask = UnexecutedTask<CrawlerPriorityCompanyTask>;
