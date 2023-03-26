import { Education } from "../model";
import { WorkExp } from "./enum";

interface BasicData {
    avgSalary: number;
    jobCount: number;
}

export interface CityAnItem extends BasicData {
    cityId: number;
    cityName: string;
}

export interface JobAnItem extends BasicData {
    jobName: string;
}
export interface YearAnItem extends BasicData {
    year: number;
}

export interface CityBillboard {
    jobCount: CityAnItem[];
    avgSalary: CityAnItem[];
    companyCount?: CityAnItem[];
}
export interface JobBillboardData {
    avgSalary: JobAnItem[];
    jobCount: JobAnItem[];
}
export namespace ApiRes {
    interface AnalysisByCity {
        data: CityAnItem[];
    }
    interface AnalysisByJob {
        /** 选择范围的排行榜 (职位排行)*/
        data: JobAnItem[];
    }
    interface GlobalBillboard {
        /** 近三年所有城市排行榜 (城市排行)*/
        allCityBillboard: CityBillboard;
        /** 近三年所有职位排行榜 (职位排行)*/
        allJobBillboard: JobBillboardData;
    }
}

export namespace ApiReq {
    interface MatchFilter {
        cityId?: number | number[];
        jobName?: string;
        jobType?: string;
        companyIndustry?: string;
        education?: Education;
        workExp?: WorkExp;
        startTime?: number;
        endTime?: number;
    }
}
