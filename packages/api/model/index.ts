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
export interface CompanyBasicData {
    /* 所属行业 */
    industry: string;
    /** 规模 */
    scale: number;
    /* 公司福利标签 */
    welfareLabel: string[];
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

export interface CompanyCrawlerData {
    companyId: string;
    /** 公司是否存在 */
    exist: boolean;
    companyData: CompanyBasicData;
    siteTag: SiteTag;
}

export interface CrawlerPriorityTask {
    /** 任务类型 */
    type: number;
    siteTag: SiteTag;
    url: string;
    /** 数值越小, 优先级越高 */
    priority: number;
}
export enum Education {
    硕士 = 7,
    博士 = 6,
    本科 = 5,
    大专 = 4,
    中专 = 3,
    高中 = 2,
    初中 = 1,
    不限 = 0,
}
export enum SiteTag {
    boss = 1,
    job51 = 2,
    zhilian = 3,
}
