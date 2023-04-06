import { MongoClient } from "mongodb";
import { DB_URI } from "./dbconfig";

export const dbClient = new MongoClient(DB_URI);

export const db = dbClient.db();
export const jobsCollection = db.collection("jobs");
export const userCollection = db.collection("users");
