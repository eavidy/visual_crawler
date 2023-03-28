import { it, expect, beforeEach } from "vitest";
import { LiePinJobList } from "./job_list";
import { CompanyCrawlerData, SiteTag } from "common/model";

const compData = {
    compName: "云账户（天津）共享经济信息咨询有限公司",
    compStage: "B轮",
    compLogo: "5df731b5276e4871f42905bf01u.png",
    compScale: "500-999人",
    compId: 10098303,
    compIndustry: "计算机软件",
    link: "https://www.liepin.com/company/10098303/",
};
let jobList = new LiePinJobList({} as any, "");
beforeEach(() => {
    jobList.errors.length = 0;
});

it("解析猎聘公司数据", function () {
    let res = jobList.paseCompany(compData);
    expect(jobList.errors).toMatchObject([]);
    expect(res).toMatchObject({
        companyData: {
            industry: "计算机软件",
            name: "云账户（天津）共享经济信息咨询有限公司",
            scale: 750,
            welfareLabel: [],
        },
        companyId: "10098303",
        siteTag: SiteTag.liepin,
    } as CompanyCrawlerData);
});
