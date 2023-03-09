import { SiteTag } from ".";
export interface CompanyBasicData {
    /* 所属行业 */
    industry: string;
    /** 规模 */
    scale: number;
    /* 公司福利标签 */
    welfareLabel: string[];
    name: string;
}
export interface CompanyCrawlerDataAppend {
    companyId: string;
    companyData: CompanyBasicData;
    siteTag: SiteTag;
}
export interface CompanyCrawlerData extends CompanyCrawlerDataAppend {
    /** 公司已不存在 */
    nonexistent?: boolean;
    lastUpdate?: Date;
    lastPushQueueDate?: Date;
}
