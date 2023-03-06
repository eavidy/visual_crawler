import { it, expect, beforeEach } from "vitest";
import { LiePinJobList, paseJob } from "./job_list";
import { JobCrawlerData, CompanyCrawlerData, SiteTag, Education } from "api/model/index";

const data = {
    job: {
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
    },
    comp: {
        compName: "云账户（天津）共享经济信息咨询有限公司",
        compStage: "B轮",
        compLogo: "5df731b5276e4871f42905bf01u.png",
        compScale: "500-999人",
        compId: 10098303,
        compIndustry: "计算机软件",
        link: "https://www.liepin.com/company/10098303/",
    },
};
let jobList = new LiePinJobList({} as any, "");
beforeEach(() => {
    jobList.errors.length = 0;
});
it("解析猎聘职位数据", function () {
    let res = paseJob(data.job, SiteTag.liepin, { companyId: "esd" });
    expect(jobList.errors).toMatchObject([]);
    expect(res.data).toMatchObject({
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
it("解析猎聘公司数据", function () {
    let res = jobList.paseCompany(data.comp);
    expect(jobList.errors).toMatchObject([]);
    expect(res).toMatchObject({
        companyData: {
            industry: "计算机软件",
            name: "云账户（天津）共享经济信息咨询有限公司",
            scale: 750,
            welfareLabel: [],
        },
        companyId: "10098303",
        exist: true,
        siteTag: SiteTag.liepin,
    } as CompanyCrawlerData);
});
