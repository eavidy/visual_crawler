import {
  SiteTag,
  Education,
  CompanyScale,
  TaskType,
  TaskState,
} from "./index.js";

export type CrawlerTaskAppend = Omit<CrawlerPriorityTask, "status">;

export interface CrawlerPriorityTask {
  /** 任务类型 */
  type: TaskType;
  siteTag: SiteTag;
  status: TaskState;
  result?: any;
  /** 优先级, 越小越优先 */
  priority?: number;
  /** 过期时间 */
  expirationTime?: Date;
  taskInfo?: any;
}
export interface CrawlerPriorityJobFilterTask extends CrawlerPriorityTask {
  type: TaskType.jobFilter;
  taskInfo: {
    fixedFilter?: JobFilterOption;
    skipList?: number[];
  };
}
export interface CrawlerPriorityCompanyTask extends CrawlerPriorityTask {
  type: TaskType.company;
  taskInfo: string;
}
export interface JobFilterOption {
  city?: number;
  emitTime?: number;
  exp?: number;
  salary?: number;
  eduction?: Education;
  companyScale?: CompanyScale;
}
