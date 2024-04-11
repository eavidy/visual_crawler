import { Injectable } from "@nestjs/common";
import { jobsCollection } from "./db.js";

@Injectable()
export class JobSearchDbService {
    constructor() {}
    async searchJobName(name: string, limit: number): Promise<string[]> {
        let list = await jobsCollection
            .find({ "jobData.name": new RegExp(name, "i") })
            .project<{ name: string }>({ _id: 0, name: "$jobData.name" })
            .limit(limit)
            .toArray();
        let nameList: string[] = [];
        for (const item of list) {
            nameList.push(item.name);
        }
        return nameList;
    }
}
