import { Education, SiteTag } from ".";
export interface JobBasicData {
    /** 薪资 */
    salaryMin?: number;
    salaryMax?: number;
    /** 薪资月数 */
    salaryMonth: number;
    /** 工作经验, 单位月 */
    workExperience: number;
    /** 学历 */
    education?: Education;
    cityId?: number;
    /** 职位标签 */
    tag: string[];
    name: string;
}
/** jobData使用其他JobData的数据 */
interface JobRefData {
    ref: string;
}

interface JobData {
    jobId: string;
    /** 所属公司id */
    companyId: string;
    jobData: JobBasicData;
    siteTag: SiteTag;
}

export type JobCrawlerData = JobRefData | JobData;
