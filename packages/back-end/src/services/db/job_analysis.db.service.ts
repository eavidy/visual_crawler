import { Education } from "common/model/index.js";
import { WorkExp } from "common/request/enum.js";
import { Document } from "mongodb";
import { jobsCollection } from "./db.js";
import { Injectable } from "@nestjs/common";
const MIN_AVG_NUMBER_OF_SAMPLES = 100;
class JobMatcher {
  matchOpt: Document = {};
  setOpt: Document = {
    salary: {
      $divide: [{ $add: ["$jobData.salaryMax", "$jobData.salaryMin"] }, 2],
    },
  };
  filterOpt: Document = {};
  get opt(): Document[] {
    let list = [{ $match: this.matchOpt }, { $set: this.setOpt }];
    if (Object.keys(this.filterOpt).length)
      list.push({ $match: this.filterOpt });
    return list;
  }
  setKey(opt: Document, key: string, val: any) {
    opt["jobData." + key] = val;
  }
  constructor(matchFilter: MatchFilter, $match?: Document) {
    const {
      cityId,
      compIndustry,
      jobName,
      startTime,
      endTime,
      jobType,
      education,
      workExp,
    } = matchFilter;
    let baseMatch = this.matchOpt;
    Object.assign(baseMatch, $match);

    let filterOpt = this.filterOpt,
      and: Document = {};
    if (endTime || startTime) {
      this.createInsertDateField();

      if (endTime && startTime) {
        filterOpt = {};
        let $and: Document[] = [filterOpt, and];
        this.filterOpt.$and = $and;
        filterOpt.insertDate = { $gte: startTime };
        and.insertDate = { $lte: endTime };
      } else if (endTime) filterOpt.insertDate = { $lte: endTime };
      else if (startTime) filterOpt.insertDate = { $gte: startTime };
    }

    if (typeof cityId === "number") this.setKey(baseMatch, "cityId", cityId);
    else if (Array.isArray(cityId))
      this.setKey(baseMatch, "cityId", { $in: cityId });
    if (education) this.setKey(baseMatch, "education", education);
    if (workExp) this.setKey(baseMatch, "workExperience", workExp);
    if (compIndustry) this.setKey(baseMatch, "compIndustry", compIndustry);

    if (jobName) this.setKey(baseMatch, "name", new RegExp(jobName, "i"));
  }
  processJobName(opt: Document, jobName: string) {}
  createInsertDateField() {
    //生成插入时间的字段
    this.setOpt.insertDate = {
      $toDate: "$_id",
    };
  }
}
@Injectable()
export class JobAnalysisDbService {
  /** 按职位分组 */
  async avgAndTotalByJob(
    matcher: MatchFilter,
    limit: number = 100,
  ): Promise<[any[], any[]]> {
    let match = new JobMatcher(matcher);

    let baseOpts = [
      ...match.opt,
      {
        $group: {
          _id: "$jobData.name",
          avgSalary: { $avg: "$salary" },
          jobCount: { $sum: 1 },
        },
      },
    ];

    let [a, b] = await Promise.all([
      jobsCollection
        .aggregate([...baseOpts])
        .match({ jobCount: { $gt: MIN_AVG_NUMBER_OF_SAMPLES } })
        .project({ _id: 0, jobName: "$_id", avgSalary: -1, jobCount: -1 })
        .sort({ avgSalary: -1 })
        .limit(limit)
        .toArray(),
      jobsCollection
        .aggregate([...baseOpts])
        .project({ _id: 0, jobName: "$_id", avgSalary: -1, jobCount: -1 })
        .sort({ jobCount: -1 })
        .limit(limit)
        .toArray(),
    ]);
    return [a.reverse(), b.reverse()];
  }
  async avgAndTotalGroupBy<T extends Object>(
    matcher: MatchFilter,
    option: {
      groupBy: string;
      sort: Document;
      limit?: number;
      renameId: string;
      filterGrouped?: Document;
    },
    extFilter?: Document,
  ): Promise<T[]> {
    const { groupBy, limit, sort, renameId, filterGrouped } = option;
    let matchOpt = new JobMatcher(matcher, extFilter).opt;

    let baseOpts = [
      ...matchOpt,
      {
        $group: {
          _id: "$jobData." + groupBy,
          avgSalary: { $avg: "$salary" },
          jobCount: { $sum: 1 },
        },
      },
    ];
    let aggregate = jobsCollection.aggregate([...baseOpts]);
    if (filterGrouped) aggregate = aggregate.match(filterGrouped);

    aggregate = aggregate
      .match({ jobCount: { $gt: MIN_AVG_NUMBER_OF_SAMPLES } })
      .project({ _id: 0, [renameId]: "$_id", avgSalary: 1, jobCount: 1 })
      .sort(sort);
    if (limit) aggregate = aggregate.limit(limit);

    return aggregate.toArray() as any;
  }
  async avgAndTotalGroupByTime(
    matcher: MatchFilter,
    limit?: number,
  ): Promise<{ avgSalary: number; jobCount: number; _id: number }[]> {
    let match = new JobMatcher(matcher);

    Object.assign(match.setOpt, {
      insertYear: { $year: "$_id" },
    });

    let baseOpts = [
      ...match.opt,
      {
        $group: {
          _id: "$insertYear",
          avgSalary: { $avg: "$salary" },
          jobCount: { $sum: 1 },
        },
      },
    ];
    let aggregate = jobsCollection.aggregate([...baseOpts]);
    if (limit) aggregate = aggregate.limit(limit);

    return aggregate.sort({ _id: 1 }).toArray() as any;
  }
}

export interface MatchFilter {
  cityId?: number | number[];
  jobName?: string;
  jobType?: string;
  compIndustry?: string;
  startTime?: Date;
  endTime?: Date;
  education?: Education;
  workExp?: WorkExp;
}
