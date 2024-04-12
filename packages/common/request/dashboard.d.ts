import { Education } from "../model";
import { WorkExp } from "./enum";

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
    items: (GroupItem & {
      cityId: number;
      cityName: string;
    })[];
  }
  interface AnalysisByJob {
    /** 选择范围的排行榜 (职位排行)*/
    items: (GroupItem & { jobName: string })[];
  }
  type JobBillboard = GroupData<{ jobName: string }>;
  interface AnalysisByEducation {
    items: (GroupItem & { education: string })[];
  }
  interface AnalysisByWorkExp {
    items: (GroupItem & { workExp: string })[];
  }
  interface AnalysisByTime {
    items: (GroupItem & { _id: number })[];
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
