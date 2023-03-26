import { useRequest } from "ahooks";
import { ApiReq } from "api/request/dashboard";
import React from "react";
import { dashboardService } from "../services/dashboard.service";
import { Top20Billboard } from "./billboard";

export function Left(props: { filterOptions: ApiReq.MatchFilter }) {
    const { filterOptions } = props;
    const { data: dataByCity, loading: cityDataLoading } = useRequest(
        () => dashboardService.getAnalysisByCity(filterOptions),
        {
            refreshDeps: [filterOptions],
        }
    );
    const { data: dataByJob, loading: jobDataLoading } = useRequest(
        () => dashboardService.getAnalysisByJob(filterOptions),
        {
            refreshDeps: [filterOptions],
        }
    );

    return (
        <div style={{ left: 0, flex: 1, overflowY: "auto" }}>
            <Top20Billboard
                data={dataByCity as any}
                dimensions={["cityName", "avgSalary", "jobCount"]}
                legendNameMap={{ avgSalary: "平均薪资", jobCount: "职位需求" }}
                title="城市排行TOP20"
                loading={cityDataLoading}
                style={{ width: "400px", overflow: "hidden" }}
            />
            <Top20Billboard
                data={dataByJob as any}
                dimensions={["jobName", "avgSalary", "jobCount"]}
                legendNameMap={{ avgSalary: "平均薪资", jobCount: "职位需求" }}
                title="职位排行TOP20"
                loading={jobDataLoading}
            />
        </div>
    );
}
