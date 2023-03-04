import { SiteTag, Education } from ".";
export enum TaskState {
    unexecuted = 0,
    executing = 1,
    executed = 2,
    failed = 3,
}

export interface CrawlerPriorityTask {
    /** 任务类型 */
    type: string;
    siteTag: SiteTag;
    status: TaskState;
    /** 优先级, 越大越优先 */
    priority?: number;
    /** 过期时间 */
    expirationTime?: Date;
    fixedFilter?: JobFilterOption;
    nonFixedFilter?: JobFilterOption;
}
export interface JobFilterOption {
    city?: number;
    emitTime?: Date;
    exp?: number;
    salary?: number;
    eduction?: Education;
    companyScale?: number;
}
