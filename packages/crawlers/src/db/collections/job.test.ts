import { beforeAll, describe, it, expect, afterAll } from "vitest";
import { jobsData, dbClient } from "../";
import { SiteTag, JobCrawlerData, JobBasicData } from "api/model";
import { ObjectId, WithId } from "mongodb";

describe.skip("手动测试", function () {
    it("单条重复", async function () {
        let res = await jobsData.appendJob({
            companyId: "kk",
            jobId: "sdg0",
            jobData: n,
            siteTag: SiteTag.boss,
        });
        expect(res).toBeFalsy();
    });
    it("单条插入无重复", async function () {
        let res = await jobsData.appendJob({
            companyId: "kk",
            jobId: "sdg3",
            jobData: n,
            siteTag: SiteTag.boss,
        });
        expect(res).toBeTruthy();
    });
    it("单条插入有重复", async function () {
        //重复的job是7个月前插入的数据
        let res = await jobsData.appendJob({
            companyId: "kk",
            jobId: "sdg1",
            jobData: n,
            siteTag: SiteTag.boss,
        });
        expect(res).toBeTruthy();
    });

    it("多条重复", async function () {
        let dataList: JobCrawlerData[] = [
            {
                companyId: "kk",
                jobId: "sdg2",
                jobData: n,
                siteTag: SiteTag.boss,
            },
            {
                companyId: "kk",
                jobId: "sdg3",
                jobData: n,
                siteTag: SiteTag.boss,
            },
            {
                companyId: "kk",
                jobId: "sdg4",
                jobData: n,
                siteTag: SiteTag.boss,
            },
            {
                companyId: "kk",
                jobId: "sdg5",
                jobData: n,
                siteTag: SiteTag.boss,
            },
            {
                companyId: "kk",
                jobId: "sdg6",
                jobData: n,
                siteTag: SiteTag.boss,
            },
        ];
        let { uninserted } = await jobsData.appendJobs(dataList, SiteTag.boss);
        expect(uninserted.map((i) => i.jobId)).toEqual(["sdg2", "sdg3"]);
    });
});
let n: JobBasicData = {
    name: "A",
    salaryMonth: 12,
    tag: [],
    workExperience: -1,
};
beforeAll(async function () {
    let hexT = (Math.floor(new Date().getTime() / 1000) - 7 * 86400).toString(16);
    let hexTime = "0".repeat(8 - hexT.length) + hexT + "0".repeat(16);
    // let hexTime =
    let data: (JobCrawlerData | WithId<JobCrawlerData>)[] = [
        {
            jobId: "sdg0",
            companyId: "yy",
            jobData: n,
            siteTag: SiteTag.boss,
        },
        {
            _id: new ObjectId(hexTime), //模拟超过7个月前插入
            jobId: "sd1",
            companyId: "yy",
            jobData: n,
            siteTag: SiteTag.boss,
        },
        {
            jobId: "sdg2",
            companyId: "yy",
            jobData: n,
            siteTag: SiteTag.boss,
        },
    ];
    await dbClient.db().collection("jobs").insertMany(data);
});
afterAll(async function () {
    await dbClient.db().collection("jobs").deleteMany({});
    await dbClient.close();
});
