import { errorLogCollection } from "../db.js";

export class ErrorLogData {
  constructor() {}
  async appendLogs(logs: Record<string | number, any>[]) {
    return errorLogCollection.insertMany(logs);
  }
  async appendLog(log: Record<string | number, any>) {
    return errorLogCollection.insertOne(log);
  }
}
