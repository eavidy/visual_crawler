import { MongoClient } from "mongodb";
import { DB_URI } from "../config/dbconfig";
import { TaskQueueData } from "./collections/task_queue";
import { CompanyData, CompanyCrawlerDataAppend } from "./collections/company";
import { JobsData } from "./collections/job";
import { CitiesData } from "./collections/cities";

export const dbClient = new MongoClient(DB_URI);
export const taskQueueData = new TaskQueueData(dbClient.db(), dbClient.db().collection("task_queue"));
export const companyData = new CompanyData(dbClient.db().collection("companies"));
export const jobsData = new JobsData(dbClient.db().collection("jobs"));
export const citiesData = new CitiesData(dbClient.db().collection("cities"));

export type { TaskQueueData, CompanyData, JobsData, CompanyCrawlerDataAppend };
