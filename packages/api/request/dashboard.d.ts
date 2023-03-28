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

export interface GroupItem {
    avgSalary: number;
    jobCount: number;
}
export interface GroupData<T extends Object = {}> {
    avgSalary: (GroupItem & T)[];
    jobCount: (GroupItem & T)[];
}

export namespace ApiRes {
    interface AnalysisByCity {
        items: CityAnItem[];
    }
    interface AnalysisByJob {
        /** 选择范围的排行榜 (职位排行)*/
        items: JobAnItem[];
    }
    type JobBillboard = GroupData<{ jobName: string }>;
    type AnalysisByEducation = { items: (GroupItem & { education: string })[] };
    type AnalysisByWorkExp = { items: (GroupItem & { workExp: string })[] };
    type AnalysisByTime = { items: (GroupItem & { _id: number })[] };
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
