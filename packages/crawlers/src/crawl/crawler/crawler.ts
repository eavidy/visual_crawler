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
    crawlerStatistics = this.resetCount();

    async saveJobs(jobDates: JobCrawlerData[]) {
        if (jobDates.length === 0) return;
        try {
            let { inserted, uninserted, checkFail } = await jobsData.appendJobs(jobDates, this.siteTag);
            let info = this.crawlerStatistics;
            info.jobRepeatedCount += uninserted?.length ?? 0;
            info.jobTotal += inserted.length;
            if (checkFail) this.reportError("保存职位数据校验出错", checkFail);
        } catch (error) {
            this.reportError("保存职位数据时出现异常", this.errToJson(error));
        }
    }
    async saveCompanies(companies: CompanyCrawlerDataAppend[]) {
        if (companies.length === 0) return;
        try {
            let { inserted, uninserted, checkFail } = await companyData.appendCompanies(companies, this.siteTag);
            let info = this.crawlerStatistics;
            info.companyTotal += inserted.length;
            info.companyRepeatedCount += uninserted?.length ?? 0;
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
        let initData = {
            jobTotal: 0,
            companyTotal: 0,
            jobRepeatedCount: 0,
            companyRepeatedCount: 0,
        };
        return initData;
    }
    async startWork() {
        if (this.working) return;
        this.endureWork = true;
        let abc = new AbortController();
        this.abc = abc;

        while (this.endureWork) {
            let task = await this.takeTask();
            if (!task) break;
            let id = task._id;
            await this.executeTask(task, abc.signal);

            taskQueueData.markTasksSucceed(id);
        }
        this.abc = undefined;
    }
    stopWork(abort = false) {
        this.endureWork = false;
        if (abort) this.abc?.abort();
    }
    get working() {
        return !!this.abc;
    }
    private endureWork = true;
    private abc?: AbortController;
}

export type UnexecutedJobTask = UnexecutedTask<CrawlerPriorityJobFilterTask>;
export type UnexecutedCompanyTask = UnexecutedTask<CrawlerPriorityCompanyTask>;
