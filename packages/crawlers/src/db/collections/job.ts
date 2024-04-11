import { JobCrawlerData, SiteTag } from "common/model";
import { checkType, ExceptType, typeChecker, TypeCheckOptions } from "evlib";
import { ObjectId, WithId } from "mongodb";
import { FieldCheckError } from "../classes/errors.js";
import { jobsCollection } from "../db.js";

const { optional } = typeChecker;

export class JobsData {
  async removeDuplication(jobs: JobCrawlerData[], siteTag: SiteTag) {
    let isRepeatPms: Promise<boolean>[] = [];
    for (const job of jobs) {
      isRepeatPms.push(
        jobsCollection
          .find({ companyId: job.companyId, jobId: job.jobId, siteTag: siteTag })
          .project({ _id: 0, companyId: 1, jobId: 1 })
          .toArray()
          .then((val) => !!val.length)
      );
    }
    let repeated: JobCrawlerData[] = [];
    let insertable: JobCrawlerData[] = [];
    let results = await Promise.all(isRepeatPms);
    for (let i = 0; i < results.length; i++) {
      let job = jobs[i];
      if (results[i]) repeated.push(job);
      else insertable.push(job);
    }
    return { repeated, insertable };
  }
  async removeJobIdDup(jobs: JobCrawlerData[], siteTag: SiteTag) {
    let idMap = getIdMap(jobs, siteTag);
    let repeated: JobCrawlerData[] = [];
    {
      let oldJobs = await jobsCollection
        .aggregate<WithId<Pick<JobCrawlerData, "jobId" | "siteTag">>>()
        .match({
          siteTag,
          jobId: { $in: Object.keys(idMap) },
        })
        .project({ jobId: 1, _id: 0 })
        .toArray();

      for (const old of oldJobs) {
        let val = idMap[old.jobId];
        if (val) repeated.push(val);
        delete idMap[old.jobId];
      }
    }
    let insertable = Object.values(idMap);
    return { repeated, insertable };
  }
  async appendJobs(jobs: JobCrawlerData[], siteTag: SiteTag, insertCheckedItem = true) {
    let newJobs: JobCrawlerData[] = [];
    let checkFail: { item: JobCrawlerData; err: any }[] = [];
    {
      if (insertCheckedItem) {
        for (const item of jobs) {
          let err = checkType(item, jobChecker, CheckTypeOption).error;
          if (err) checkFail.push({ err, item });
          else newJobs.push(item);
        }
      } else {
        let testRes = checkType(jobs, typeChecker.arrayType(jobChecker), CheckTypeOption).error;
        if (testRes) throw new FieldCheckError(testRes);
      }
    }
    const { insertable, repeated } = await this.removeDuplication(newJobs, siteTag);
    // const { insertable, repeated } = await this.removeJobIdDup(newJobs, siteTag);

    if (insertable.length) await jobsCollection.insertMany(insertable);

    return {
      inserted: insertable,
      uninserted: repeated.length ? repeated : null,
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
const jobChecker: ExceptType = {
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
    education: optional(typeChecker.numberRange(0, 7)),
    cityId: optional.number,
    /** 职位标签 */
    tag: typeChecker.arrayType("string"),
    name: "string",

    compIndustry: optional.string,
    compScale: optional.number,
  },
  siteTag: "number",
};
const CheckTypeOption: TypeCheckOptions = {
  checkAll: true,
  policy: "delete",
};
