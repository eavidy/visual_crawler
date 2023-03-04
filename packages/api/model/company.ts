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

export interface CompanyCrawlerData {
    companyId: string;
    /** 公司是否存在 */
    exist: boolean;
    companyData: CompanyBasicData;
    siteTag: SiteTag;
    lastUpdate?: Date;
}
