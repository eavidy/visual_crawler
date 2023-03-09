import { TaskQueue } from "../classes/task_queue";
import { jobsData, companyData, taskQueueData, errorLogData, UnexecutedCrawlerTask, UnexecutedTask } from "../../db";
import {
    CompanyCrawlerDataAppend,
    CrawlerPriorityCompanyTask,
    CrawlerPriorityJobFilterTask,
    JobCrawlerData,
    TaskType,
} from "api/model";

export abstract class Crawler extends TaskQueue {
    abstract siteName: string;
    jobTotal = 0;
    companyTotal = 0;
    jobRepeatedCount = 0;
    companyRepeatedCount = 0;
    async reportError(msg: string, cause: any) {
        let info = {
            class: this.constructor.name,
            siteName: this.siteName,
            msg,
            cause,
        };
        errorLogData.appendLog(info);
        console.log("异常日志:" + JSON.stringify(info, null, 2));
    }
    async reportAuth() {
        console.log("验证");
    }
    get crawlerStatistics() {
        return {
            jobTotal: this.jobTotal,
            companyTotal: this.companyTotal,
            jobRepeatedCount: this.jobRepeatedCount,
            companyRepeatedCount: this.companyRepeatedCount,
        };
    }

    async saveJobs(jobDates: JobCrawlerData[]) {
        if (jobDates.length === 0) return;
        try {
            let { inserted, uninserted, checkFail } = await jobsData.appendJobs(jobDates, this.siteTag);
            this.jobRepeatedCount += uninserted?.length ?? 0;
            this.jobTotal += inserted.length;
            if (checkFail) this.reportError("保存职位数据校验出错", checkFail);
        } catch (error) {
            this.reportError("保存职位数据时出现异常", this.errToJson(error));
        }
    }
    async saveCompanies(companies: CompanyCrawlerDataAppend[]) {
        if (companies.length === 0) return;
        try {
            let { inserted, uninserted, checkFail } = await companyData.appendCompanies(companies, this.siteTag);
            this.companyTotal += inserted.length;
            this.companyRepeatedCount += uninserted?.length ?? 0;
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
    abstract executeTask(task: UnexecutedCrawlerTask, abc?: AbortSignal): Promise<boolean>;
    errToJson(err: any) {
        if (err instanceof Error) {
            return {
                message: err.message,
                stack: err.stack,
                cause: err.cause,
            };
        }
        return err;
    }
    resetCount() {
        this.jobTotal = 0;
        this.companyTotal = 0;
        this.jobRepeatedCount = 0;
        this.companyRepeatedCount = 0;
    }
    get working() {
        return this.#working === 1;
    }
    #working = 0;
    #go = true;
    #taskBreak?: AbortController;
    async startWork() {
        if (this.working) return;
        this.#working = 1;

        let abc = new AbortController();
        this.#taskBreak = abc;

        while (this.#go) {
            let task = await this.takeTask();
            if (!task) break;
            let id = task._id;
            await this.executeTask(task, abc.signal);
            taskQueueData.markTasksSucceed(id);
        }
        this.#working = 0;
        this.#go = true;
    }
    stopWork(taskBreak = false) {
        if (this.working) {
            this.#working = -1; //停止中
            this.#go = false;
            if (taskBreak) {
                this.#taskBreak?.abort();
                this.#taskBreak = undefined;
            }
            this.restoreTask();
        }
    }
}

export type UnexecutedJobTask = UnexecutedTask<CrawlerPriorityJobFilterTask>;
export type UnexecutedCompanyTask = UnexecutedTask<CrawlerPriorityCompanyTask>;
