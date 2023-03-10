import { it, expect } from "vitest";
import { JobCrawlerData, SiteTag, Education } from "api/model/index";
import { paseJob } from "./common_parser";

const jobData = {
    labels: ["制度制定", "岗位配置招聘", "绩效管理", "人力资源经验"],
    advViewFlag: false,
    topJob: false,
    salary: "15-35k·16薪",
    dq: "北京-朝阳区",
    title: "招聘HR（北京/天津均可）",
    jobKind: "2",
    jobId: "56384201",
    refreshTime: "20230301152917",
    link: "https://www.liepin.com/job/1956384201.shtml",
    requireWorkYears: "经验不限",
    dataPromId:
        "d_sfrom=search_prime&d_ckId=null&d_curPage=1&d_pageSize=40&d_headId=null&d_posi=0&skId=y1kivhce3pccz3zs5vsvzfj1w2g18lz9&fkId=1t9o2us0rwljh7eux01fg0x60ku828ua&ckId=0c4q6ghejy9rcou0kwjad3yr31u23rfa&sfrom=search_job_pc&curPage=1&pageSize=40&index=0",
    requireEduLevel: "统招本科",
};

it("解析猎聘职位数据", function () {
    let { data, errors } = paseJob(jobData, SiteTag.liepin, { companyId: "esd" });
    expect(errors.length).toEqual(0);
    expect(data).toMatchObject({
        companyId: "esd",
        jobId: "56384201",
        jobData: {
            cityId: 101010100,
            name: "招聘HR（北京/天津均可）",
            education: Education.本科,
            workExperience: -1,
            salaryMonth: 16,
            salaryMax: 35000,
            salaryMin: 15000,
            tag: ["制度制定", "岗位配置招聘", "绩效管理", "人力资源经验"],
        },
        siteTag: SiteTag.liepin,
    } as JobCrawlerData);
});
