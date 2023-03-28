import { MongoClient } from "mongodb";
import { DB_URI } from "../config/dbconfig";
import { TaskQueueData, UnexecutedCrawlerTask, UnexecutedTask } from "./collections/task_queue";
import { CompanyData } from "./collections/company";
import { JobsData } from "./collections/job";
import { CitiesData } from "./collections/cities";
import { ErrorLogData } from "./collections/error_log";

export const dbClient = new MongoClient(DB_URI);
export const taskQueueData = new TaskQueueData(dbClient.db(), dbClient.db().collection("task_queue"));
export const companyData = new CompanyData(dbClient.db().collection("companies"));
export const jobsData = new JobsData(dbClient.db().collection("jobs"));
export const citiesData = new CitiesData(dbClient.db().collection("cities"));
export const errorLogData = new ErrorLogData(dbClient.db().collection("error_log"));

export type { TaskQueueData, CompanyData, JobsData, ErrorLogData, UnexecutedCrawlerTask, UnexecutedTask };
