import { TaskQueueData, UnexecutedCrawlerTask, UnexecutedTask } from "./collections/task_queue";
import { CompanyData } from "./collections/company";
import { JobsData } from "./collections/job";
import { ErrorLogData } from "./collections/error_log";

export const taskQueueData = new TaskQueueData();
export const companyData = new CompanyData();
export const jobsData = new JobsData();
export const errorLogData = new ErrorLogData();

export type { TaskQueueData, CompanyData, JobsData, ErrorLogData, UnexecutedCrawlerTask, UnexecutedTask };
