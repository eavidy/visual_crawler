import { $http } from "@/http";
import { ApiRes, ApiReq } from "api/request/dashboard";

class DashboardResource {
    async getGlobalBillboard() {
        const { data } = await $http.get<ApiRes.GlobalBillboard>("api/dashboard/global_billboard");
        return data;
    }
    async getAnalysisByCity(query: ApiReq.MatchFilter) {
        const {
            data: { data: jobsData },
        } = await $http.get<ApiRes.AnalysisByCity>("api/dashboard/analysis_city", { params: query });

        return {
            avgSalary: jobsData,
            jobCount: jobsData.slice(0).sort((a, b) => a.jobCount - b.jobCount),
        };
    }
    async getAnalysisByJob(query: ApiReq.MatchFilter) {
        const {
            data: { data: jobsData },
        } = await $http.get<ApiRes.AnalysisByJob>("api/dashboard/analysis_job", { params: query });

        return {
            avgSalary: jobsData,
            jobCount: jobsData.slice(0).sort((a, b) => a.jobCount - b.jobCount),
        };
    }
}
export const dashboardService = new DashboardResource();
