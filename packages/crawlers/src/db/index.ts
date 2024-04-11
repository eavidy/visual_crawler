import { TaskQueueData, UnexecutedCrawlerTask, UnexecutedTask } from "./collections/task_queue.js";
import { CompanyData } from "./collections/company.js";
import { JobsData } from "./collections/job.js";
import { ErrorLogData } from "./collections/error_log.js";

export const taskQueueData = new TaskQueueData();
export const companyData = new CompanyData();
export const jobsData = new JobsData();
export const errorLogData = new ErrorLogData();

export type { TaskQueueData, CompanyData, JobsData, ErrorLogData, UnexecutedCrawlerTask, UnexecutedTask };
