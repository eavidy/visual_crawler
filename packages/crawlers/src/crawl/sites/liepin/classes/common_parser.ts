import { JobCrawlerData, SiteTag } from "common/model";
import { removeUndefined } from "@asnc/tslib/lib/object";
import { DataParser } from "../../common";

export function paseJob(
    job: RawJobData,
    siteTag: SiteTag,
    company: { companyId?: string; industry?: string; scale?: number }
): { data: JobCrawlerData; errors: any[] } {
    const errors: any[] = [];
    let salary = DataParser.paseSalary(job.salary);
    if (salary === undefined) {
        errors.push({ msg: "薪资解析失败", str: job.salary });
    }
    let cityId: number | undefined;

    {
        let cityStr = job.dq;
        const cityName = cityStr.match(/^[^-]+/)?.[0];
        cityId = cityName ? DataParser.cityNameToId(cityName) : DataParser.matchCityToId(cityStr);
        if (cityId === undefined) errors.push({ msg: "解析城市id失败", str: cityStr });
    }
    let data = {
        jobData: {
            cityId,
            name: DataParser.paseJobName(job.title),
            tag: job.labels,
            education: DataParser.matchEducation(job.requireEduLevel),
            workExperience: DataParser.paseExp(job.requireWorkYears),
            ...(salary ? salary : { salaryMonth: 12 }),

            compIndustry: company.industry,
            compScale: company.scale,
        },
        companyId: company.companyId ?? "unknown",
        jobId: job.jobId,
        siteTag,
    };
    removeUndefined(data);
    return {
        data,
        errors,
    };
}

export type RawJobData = any;
export type RawCompData = any;
