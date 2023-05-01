import { CrawlerProcessStatus, CrawlerStatus } from "../enum";
import { CrawlerPriorityCompanyTask, CrawlerPriorityJobFilterTask, TaskType } from "../../model";
type TaskInfo = CrawlerPriorityCompanyTask | CrawlerPriorityJobFilterTask;
export namespace ApiReq {
    type CreateCrawler = CreateCrawlerOptions;
    interface UpdateCrawler extends CrawlerMeta {
        data: {
            name?: string;
            start?: boolean;
        };
    }
}

export interface CreateCrawlerOptions {
    taskType?: TaskType | "new";
    taskCountLimit?: number;
    name?: string;
    /** 仅在taskType=="new时有效" */
    isAuto?: boolean;
}

export interface CrawlerMeta {
    processId: number;
    crawlerId: number;
}

interface CrawlerInfo {
    id: number;
    errors: string[];
    schedule: { current: number; total: number };
    config: CreateCrawlerOptions;
    statistics: {
        newJob: number;
        newCompany: number;
        jobRepeated: number;
        companyRepeated: number;
        taskCompleted: number;
        taskFailed: number;
    };
    reportAuth: boolean;
    status: CrawlerStatus;
    currentTask?: TaskInfo;
    startWorkDate?: Date;
}

export namespace ApiRes {
    interface GetCrawlerInfo {
        processName: string;
        processStatus: CrawlerProcessStatus;
        crawlerList: CrawlerInfo[];
    }
}
