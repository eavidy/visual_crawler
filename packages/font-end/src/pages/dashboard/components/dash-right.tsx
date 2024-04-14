import { useRequest } from "ahooks";
import React from "react";
import { dashboardService } from "../services/dashboard.service.ts";
import { Top20Billboard } from "./charts/billboard.ts";

export function Right() {
  const { data: allJobBillboard, loading: allJobBillboardLoading } = useRequest(dashboardService.getAnalysisByJob);
  const { data: allCityBillboard, loading: allCityBillboardLoading } = useRequest(dashboardService.getAnalysisByCity);

  return (
    <div
      style={{
        width: "300px",
        overflowY: "auto",
      }}
    >
      <div>
        <Top20Billboard
          data={allJobBillboard}
          dimensions={["cityName", "avgSalary", "jobCount"]}
          legendNameMap={{ avgSalary: "平均薪资", jobCount: "职位需求" }}
          title="城市排行TOP20"
          loading={allJobBillboardLoading}
        />
        <Top20Billboard
          data={allCityBillboard}
          dimensions={["jobName", "avgSalary", "jobCount"]}
          legendNameMap={{ avgSalary: "平均薪资", jobCount: "职位需求" }}
          title="职位排行TOP20"
          loading={allCityBillboardLoading}
        />
      </div>
    </div>
  );
}
