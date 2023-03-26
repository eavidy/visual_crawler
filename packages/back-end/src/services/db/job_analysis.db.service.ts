import { Education } from "api/model";
import { CityAnItem, JobAnItem } from "api/request/dashboard";
import { WorkExp } from "api/request/enum";
import { Document } from "mongodb";
import { jobsCollection } from "./db";
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
        if (Object.keys(this.filterOpt).length) list.push({ $match: this.filterOpt });
        return list;
    }
    setKey(opt: Document, key: string, val: any) {
        opt["jobData." + key] = val;
    }
    constructor(matchFilter: MatchFilter, $match?: Document) {
        const { cityId, compIndustry, jobName, startTime, endTime, jobType, education, workExp } = matchFilter;
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
        else if (Array.isArray(cityId)) this.setKey(baseMatch, "cityId", { $in: cityId });
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
export class JobAnalysisDbService {
    /** 按城市分组 */
    async avgAndCountByCity(matcher: MatchFilter, limit = 200) {
        let match = new JobMatcher(matcher);

        // 平均工资、职位数量
        let optList = [
            ...match.opt,
            { $group: { _id: "$jobData.cityId", avgSalary: { $avg: "$salary" }, jobCount: { $sum: 1 } } },
            { $project: { cityId: "$_id", _id: 0, avgSalary: 1, jobCount: 1 } },
            { $sort: { avgSalary: 1, jobCount: 1 } },
            { $limit: limit },
        ];
        let waiting = jobsCollection.aggregate<CityAnItem>(optList);
        return waiting.toArray();
    }
    /** 趋势 按时间分组*/
    async avgAndCountByTendency(matcher: MatchFilter, limit = 200) {
        return;
        let match = new JobMatcher(matcher);

        // 平均工资、职位数量
        let groupOpt: Document = { _id: "$jobData.cityId", avgSalary: { $avg: "$salary" }, jobTotal: { $sum: 1 } };
        let sortOpt: Document = { avgSalary: 1, jobTotal: 1 };
        let optList = [
            ...match.opt,
            { $group: groupOpt },
            { $project: { cityId: "$_id", _id: 0 } },
            { $sort: sortOpt },
        ];
        let waiting = jobsCollection.aggregate<{ avgSalary: number; jobTotal: number; cityId: number }>(optList);
        return waiting.toArray();
    }
    async avgAndCountByJob(matcher: MatchFilter, limit = 200) {
        let match = new JobMatcher(matcher);

        let baseOpts = [
            ...match.opt,
            { $group: { _id: "$jobData.name", avgSalary: { $avg: "$salary" }, jobCount: { $sum: 1 } } },
            { $project: { _id: 0, jobName: "$_id", avgSalary: 1, jobCount: 1 } },
            { $match: { jobCount: { $gt: MIN_AVG_NUMBER_OF_SAMPLES } } },
            { $sort: { avgSalary: 1, jobCount: 1 } },
            { $limit: limit },
        ];

        return jobsCollection.aggregate<JobAnItem>(baseOpts).toArray();
    }
    /** 按城市分组 */
    async avgAndTotalByCity_all(matcher: MatchFilter, limit: number = 100): Promise<[CityAnItem[], CityAnItem[]]> {
        let match = new JobMatcher(matcher, { "jobData.cityId": { $ne: null } });

        let base = [
            ...match.opt,
            { $group: { _id: "$jobData.cityId", avgSalary: { $avg: "$salary" }, jobCount: { $sum: 1 } } },
        ];
        // 平均工资、职位数量
        let p1 = jobsCollection
            .aggregate([...base])
            .match({ jobCount: { $gt: MIN_AVG_NUMBER_OF_SAMPLES } })
            .project({ _id: 0, cityId: "$_id", avgSalary: 1, jobCount: 1 })
            .sort({ avgSalary: 1 })
            .limit(limit)
            .toArray();
        let p2 = jobsCollection
            .aggregate([...base])
            .project({ _id: 0, cityId: "$_id", avgSalary: 1, jobCount: 1 })
            .sort({ jobCount: 1 })
            .limit(limit)
            .toArray();
        return Promise.all([p1, p2]) as any;
    }
    /** 按职位分组 */
    async avgAndTotalByJob_all(matcher: MatchFilter, limit: number = 100): Promise<[JobAnItem[], JobAnItem[]]> {
        let match = new JobMatcher(matcher);

        let baseOpts = [
            ...match.opt,
            { $group: { _id: "$jobData.name", avgSalary: { $avg: "$salary" }, jobCount: { $sum: 1 } } },
        ];

        return Promise.all([
            jobsCollection
                .aggregate([...baseOpts])
                .match({ jobCount: { $gt: MIN_AVG_NUMBER_OF_SAMPLES } })
                .project({ _id: 0, jobName: "$_id", avgSalary: 1, jobCount: 1 })
                .sort({ avgSalary: 1 })
                .limit(limit)
                .toArray(),
            jobsCollection
                .aggregate([...baseOpts])
                .project({ _id: 0, jobName: "$_id", avgSalary: 1, jobCount: 1 })
                .sort({ jobCount: 1 })
                .limit(limit)
                .toArray(),
        ]) as any;
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
