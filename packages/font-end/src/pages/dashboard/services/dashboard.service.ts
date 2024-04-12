import { $http } from "@/http";
import { Education } from "common/model/index.js";
import { ApiRes, ApiReq } from "common/request/dashboard";
import { WorkExp } from "common/request/enum";

class DashboardResource {
  async getJobBillboard(query: ApiReq.MatchFilter) {
    const { data } = await $http.get<ApiRes.JobBillboard>(
      "api/dashboard/job_billboard",
      { params: query },
    );
    return data;
  }
  async getAnalysisByCity(query: ApiReq.MatchFilter) {
    const {
      data: { items: jobsData },
    } = await $http.get<ApiRes.AnalysisByCity>("api/dashboard/analysis_city", {
      params: query,
    });

    return {
      avgSalary: jobsData.slice(-30),
      jobCount: jobsData
        .slice(0)
        .sort((a, b) => a.jobCount - b.jobCount)
        .slice(-30),
    };
  }
  async getAnalysisByJob(query: ApiReq.MatchFilter) {
    const {
      data: { items: jobsData },
    } = await $http.get<ApiRes.AnalysisByJob>("api/dashboard/analysis_job", {
      params: query,
    });

    return {
      avgSalary: jobsData,
      jobCount: jobsData.slice(0).sort((a, b) => a.jobCount - b.jobCount),
    };
  }
  async getAnalysisByEducation(query: ApiReq.MatchFilter) {
    const {
      data: { items },
    } = await $http.get<ApiRes.AnalysisByEducation>(
      "api/dashboard/data_by_education",
      {
        params: query,
      },
    );

    for (const item of items) {
      item.education = Education[item.education as any];
    }

    return items;
  }
  async getAnalysisByWorkExp(query: ApiReq.MatchFilter) {
    const {
      data: { items },
    } = await $http.get<ApiRes.AnalysisByWorkExp>("api/dashboard/data_by_exp", {
      params: query,
    });
    for (const item of items) {
      item.workExp = WorkExp[item.workExp as any];
    }
    return items;
  }
  async getAnalysisByDate(query: ApiReq.MatchFilter) {
    const {
      data: { items },
    } = await $http.get<ApiRes.AnalysisByWorkExp>(
      "api/dashboard/data_by_time",
      {
        params: query,
      },
    );

    return items;
  }
}
export const dashboardService = new DashboardResource();
