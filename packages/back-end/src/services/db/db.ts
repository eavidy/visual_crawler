import { MongoClient } from "mongodb";
import { DB_URI, DB_NAME } from "./dbconfig";

export const dbClient = new MongoClient(DB_URI);

export const db = dbClient.db(DB_NAME);
export const jobsCollection = db.collection("jobs");
export const userCollection = db.collection("users");
export const taskQueueCollection = db.collection("task_queue");
export const companyCollection = db.collection("companies");
export const citiesCollection = db.collection("cities");
