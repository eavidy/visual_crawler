import { JobCrawlerData, SiteTag } from "common/model";
import { checkType, checkFx, ExceptTypeMap, optional } from "@asnc/tslib/lib/std/type_check";
import { ObjectId, Collection, WithId } from "mongodb";
import { FieldCheckError } from "../classes/errors";
import { jobsCollection } from "../db";
const TIME_INTERVAL = 30 * 6 * 86400;

export class JobsData {
    constructor() {}

    async appendJobs(jobs: JobCrawlerData[], siteTag: SiteTag, insertCheckedItem = true) {
        let newJobs: JobCrawlerData[] = [];
        let checkFail: { item: JobCrawlerData; err: any }[] = [];
        {
            if (insertCheckedItem) {
                for (const item of jobs) {
                    let err = checkType(item, jobChecker, CheckTypeOption);
                    if (err) checkFail.push({ err, item });
                    else newJobs.push(item);
                }
            } else {
                let testRes = checkType(jobs, checkFx.arrayType(jobChecker), CheckTypeOption);
                if (testRes) throw new FieldCheckError(testRes);
            }
        }
        let idMap = getIdMap(newJobs, siteTag);
        let notInsertJobs: JobCrawlerData[] = [];
        {
            let oldJobs = await jobsCollection
                .aggregate<WithId<Pick<JobCrawlerData, "jobId" | "siteTag">>>([
                    { $match: { siteTag, jobId: { $in: Object.keys(idMap) } } },
                ])
                .toArray();

            for (const old of oldJobs) {
                let val = idMap[old.jobId];
                if (val) notInsertJobs.push(val);
                delete idMap[old.jobId];
            }
        }
        let insertable = Object.values(idMap);
        if (insertable.length) await jobsCollection.insertMany(insertable);

        return {
            inserted: insertable,
            uninserted: notInsertJobs.length ? notInsertJobs : null,
            checkFail: checkFail.length ? checkFail : null,
        };
    }
    deleteJob(jobId: string) {
        return jobsCollection.deleteOne({ _id: new ObjectId(jobId) });
    }
    getJob(jobId: string) {
        return jobsCollection.findOne({ _id: new ObjectId(jobId) });
    }
}
function getIdMap(comps: JobCrawlerData[], siteTag: SiteTag) {
    let idMap: Record<string, JobCrawlerData> = {};
    for (const comp of comps) {
        if (siteTag !== comp.siteTag) throw "siteTag不匹配";
        idMap[comp.jobId] = comp;
    }
    return idMap;
}
const jobChecker: ExceptTypeMap = {
    jobId: "string",
    /** 所属公司id */
    companyId: "string",
    jobData: {
        /** 薪资 */
        salaryMin: optional.number,
        salaryMax: optional.number,
        /** 薪资月数 */
        salaryMonth: optional.number,
        /** 工作经验, 单位月 */
        workExperience: "number",
        /** 学历 */
        education: optional(checkFx.numScope(0, 7)),
        cityId: optional.number,
        /** 职位标签 */
        tag: checkFx.arrayType("string"),
        name: "string",

        compIndustry: optional.string,
        compScale: optional.number,
    },
    siteTag: "number",
};
const CheckTypeOption = {
    checkAll: true,
    deleteSurplus: true,
};
