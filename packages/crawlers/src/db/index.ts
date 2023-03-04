import { MongoClient } from "mongodb";
import { DB_URI } from "../config/dbconfig";
import { TaskQueueData } from "./collections/task_queue";
import { CompanyData } from "./collections/company";
import { JobsData } from "./collections/job";

export const dbClient = new MongoClient(DB_URI);
export const taskQueueData = new TaskQueueData(dbClient.db().collection("task_queue"));

export type { TaskQueueData, CompanyData, JobsData };
