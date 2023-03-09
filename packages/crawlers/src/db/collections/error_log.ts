import { Collection } from "mongodb";

export class ErrorLogData {
    constructor(private readonly collection: Collection) {}
    async appendLogs(logs: Record<string | number, any>[]) {
        return this.collection.insertMany(logs);
    }
    async appendLog(log: Record<string | number, any>) {
        return this.collection.insertOne(log);
    }
}
