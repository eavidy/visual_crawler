import { useRequest } from "ahooks";
import { ApiReq } from "common/request/dashboard";
import React, { useEffect } from "react";
import { dashboardService } from "../services/dashboard.service";
import { Top20Billboard } from "./charts/billboard";
import { LineChart } from "./charts/line-chart";
import { PipChart } from "./charts/pip-chart";

export function Body(props: { filterOptions: ApiReq.MatchFilter }) {
    const { filterOptions } = props;

    return (
        <flex
            style={{
                left: 0,
                flex: 1,
                overflowY: "auto",
                flexWrap: "wrap",
                alignItems: "stretch",
            }}
        >
            <div style={{ flex: 5 }}>
                <EducationExpAnalysis filterOptions={filterOptions} />
                <TimeAnalysis filterOptions={filterOptions} />
            </div>
            <flex style={{ flex: 1, flexBasis: "400px", flexDirection: "column" }}>
                <CityBillboard filterOptions={filterOptions} />
                <JobBillboard filterOptions={filterOptions} />
            </flex>
        </flex>
    );
}

function CityBillboard(props: { filterOptions: ApiReq.MatchFilter }) {
    const { data: dataByCity, loading: cityDataLoading } = useRequest(
        () => dashboardService.getAnalysisByCity(props.filterOptions),
        {
            refreshDeps: [props.filterOptions],
        }
    );
    return (
        <Top20Billboard
            data={dataByCity as any}
            dimensions={["cityName", "avgSalary", "jobCount"]}
            legendNameMap={{ avgSalary: "平均薪资", jobCount: "职位需求" }}
            title="城市排行"
            loading={cityDataLoading}
            style={{ minWidth: "400px", flex: 1 }}
        />
    );
}
function JobBillboard(props: { filterOptions: ApiReq.MatchFilter }) {
    const { data: dataByJob, loading: jobDataLoading } = useRequest(
        () => {
            if (props.filterOptions.jobName) return dashboardService.getAnalysisByJob(props.filterOptions);
            else return dashboardService.getJobBillboard(props.filterOptions);
        },
        {
            refreshDeps: [props.filterOptions],
        }
    );

    return (
        <Top20Billboard
            data={dataByJob as any}
            dimensions={["jobName", "avgSalary", "jobCount"]}
            legendNameMap={{ avgSalary: "平均薪资", jobCount: "职位需求" }}
            title="职位排行"
            loading={jobDataLoading}
            style={{ minWidth: "400px", flex: 1 }}
        />
    );
}

function EducationExpAnalysis(props: { filterOptions: ApiReq.MatchFilter }) {
    const { filterOptions } = props;
    const {
        data: eduData,
        loading: eduLoading,
        run: getEdu,
    } = useRequest(dashboardService.getAnalysisByEducation, { manual: true });
    useEffect(() => {
        getEdu(omitField(filterOptions, "education"));
    }, [filterOptions]);

    const {
        data: expData,
        loading: expLoading,
        run: getExp,
    } = useRequest(dashboardService.getAnalysisByWorkExp, { manual: true });
    useEffect(() => {
        getExp(omitField(filterOptions, "workExp"));
    }, [filterOptions]);
    const height = "300px";
    const minWidth = "300px";
    return (
        <div style={{ flex: 1 }}>
            <flex>
                <LineChart
                    style={{ height, minWidth, flex: 3 }}
                    data={eduData}
                    dimensions={["education", "avgSalary"]}
                    title="不同学历的平均薪资"
                    loading={eduLoading}
                />
                <PipChart
                    style={{ height, minWidth, flex: 2 }}
                    data={eduData}
                    dimensions={["education", "jobCount"]}
                    title="不同学历的职位需求占比"
                    loading={eduLoading}
                />
            </flex>
            <flex>
                <LineChart
                    style={{ height, minWidth, flex: 3 }}
                    data={expData}
                    dimensions={["workExp", "avgSalary"]}
                    title="不同工作经验的平均薪资"
                    loading={expLoading}
                />
                <PipChart
                    style={{ height, minWidth, flex: 2 }}
                    data={expData}
                    dimensions={["workExp", "jobCount"]}
                    title="不同工作经验的职位需求占比"
                    loading={expLoading}
                />
            </flex>
        </div>
    );
}

function TimeAnalysis(props: { filterOptions: ApiReq.MatchFilter }) {
    const { filterOptions } = props;
    const { data, loading } = useRequest(
        async () => {
            return dashboardService.getAnalysisByDate(filterOptions);
        },
        {
            refreshDeps: [filterOptions],
        }
    );
    const height = "400px";
    return (
        <>
            <LineChart
                style={{ height, flex: 1 }}
                data={data}
                dimensions={["_id", "avgSalary"]}
                title="平均薪资趋势"
                loading={loading}
            />
            <LineChart
                style={{ height, flex: 1 }}
                data={data}
                dimensions={["_id", "jobCount"]}
                title="职位需求趋势"
                loading={loading}
            />
        </>
    );
}
function omitField<T extends Object>(obj: T, field: keyof T) {
    let newOBj = { ...obj };
    Reflect.deleteProperty(newOBj, field);
    return newOBj;
}
