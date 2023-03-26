import { useRequest } from "ahooks";
import React from "react";
import { dashboardService } from "../services/dashboard.service";
import { Top20Billboard } from "./billboard";

export function Right() {
    const { data: globalBillboard, loading: globalBillboardLoading } = useRequest(dashboardService.getGlobalBillboard);

    return (
        <div
            style={{
                width: "300px",
                overflowY: "auto",
            }}
        >
            <Top20Billboard
                data={globalBillboard?.allCityBillboard as any}
                dimensions={["cityName", "avgSalary", "jobCount"]}
                legendNameMap={{ avgSalary: "平均薪资", jobCount: "职位需求" }}
                title="城市排行TOP20"
                loading={globalBillboardLoading}
            />
            <Top20Billboard
                data={globalBillboard?.allJobBillboard as any}
                dimensions={["jobName", "avgSalary", "jobCount"]}
                legendNameMap={{ avgSalary: "平均薪资", jobCount: "职位需求" }}
                title="职位排行TOP20"
                loading={globalBillboardLoading}
            />
        </div>
    );
}
