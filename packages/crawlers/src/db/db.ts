import { MongoClient } from "mongodb";
import { DB_URI, DB_NAME } from "../config/dbconfig.js";

export const dbClient = new MongoClient(DB_URI, {});
export const db = dbClient.db(DB_NAME);

export const taskQueueCollection = db.collection("task_queue");
export const companyCollection = db.collection("companies");
export const jobsCollection = db.collection("jobs");
export const citiesCollection = db.collection("cities");
export const errorLogCollection = db.collection("error_log");
