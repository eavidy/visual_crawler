import { useRequest } from "ahooks";
import React, { useMemo, useState } from "react";
import { DatePicker, Input, Select, Form, Image, Button, Dropdown } from "antd";
import type { Dayjs } from "dayjs";
import { $http } from "@/http";
import { ApiReq } from "common/request/dashboard";
import { WorkExp } from "common/request/enum";
import { Body } from "./components/dash-left";
import { Education } from "common/model/index.js";
import LogoIcon from "@/components/img/logo";
import { Link } from "react-router-dom";

document.body.style.overflowY = "hidden";

export default function () {
    const [filterOption, setFilterOption] = useState<ApiReq.MatchFilter>({});
    return (
        <flex
            style={{
                width: "100%",
                height: "100%",
                flexDirection: "column",
                overflow: "hidden",
                background: "#F5F5F5",
                minWidth: "1200px",
            }}
        >
            <Header onAnalysis={(values) => setFilterOption(values)} />
            <Body filterOptions={filterOption} />
        </flex>
    );
}

function Header(props: { onAnalysis: (value: ApiReq.MatchFilter) => void }) {
    const { onAnalysis: onChange } = props;
    const [analyzable, setAnalyzable] = useState(false);
    const { data, loading } = useRequest(async function () {
        const { data } = await $http.get<{ value: string; label: string }[]>("api/dashboard/dq_options");
        return data;
    });
    const [searchName, setSearchName] = useState("");
    const { data: JobNameList } = useRequest(
        async function () {
            if (searchName.length === 0) return [];
            const {
                data: { items },
            } = await $http.get<{ items: string[] }>("api/job/search_job_name", { params: { name: searchName } });
            return items.map((str, i) => ({ label: str, key: i }));
        },
        {
            refreshDeps: [searchName],
            debounceWait: 500,
        }
    );
    const [form] = Form.useForm<Omit<ApiReq.MatchFilter, "startTime" | "endTime"> & { timeRange?: number }>();
    const workExpOption = useMemo(() => {
        return getNumEnumEntires(WorkExp).map(([label, value]) => ({
            label,
            value,
        }));
    }, []);
    const eduOption = useMemo(() => {
        return getNumEnumEntires(Education).map(([label, value]) => ({
            label,
            value,
        }));
    }, []);
    function onAnalysis() {
        setAnalyzable(false);
        const values = form.getFieldsValue();
        const timeRange = values.timeRange;
        Reflect.deleteProperty(values, "timeRange");
        let onChangeVal: ApiReq.MatchFilter = timeRange ? Object.assign(values, timeRange) : values;
        onChange(onChangeVal);
    }
    function formatTimeRange(e?: Dayjs[]) {
        if (!e) return;
        let startTime = e[0] ? new Date(e[0].get("year"), 0, 1, 0, 0, 0, 0).getTime() : undefined;
        let endTime = e[1] ? new Date(e[1].get("year"), 11, 31, 23, 59, 59, 999).getTime() : undefined;

        return {
            endTime,
            startTime,
        };
    }

    return (
        <div style={{ flexBasis: "60px", width: "100%", padding: "8px", backgroundColor: "#54a47f" }}>
            <Form
                layout="inline"
                form={form}
                style={{ alignItems: "center", justifyContent: "space-between" }}
                onValuesChange={() => setAnalyzable(true)}
            >
                <div style={{ padding: 8, display: "flex", alignItems: "center", gap: "12px" }}>
                    <Link to="/login" title="后台管理">
                        <LogoIcon size={50} />
                    </Link>
                    <b style={{ fontSize: "32px", color: "#FFF" }}>Visualized Analysis</b>
                </div>
                <div style={{ display: "flex", gap: "8px", paddingRight: 20 }}>
                    <Form.Item name="cityId">
                        <Select
                            options={data}
                            loading={loading}
                            placeholder="选择城市"
                            filterOption={(input, option) => !!option?.label.includes(input)}
                            showSearch
                            style={{ width: "100px" }}
                            allowClear
                        />
                    </Form.Item>
                    <Form.Item name="workExp">
                        <Select placeholder="工作经验" style={{ width: 100 }} options={workExpOption} allowClear />
                    </Form.Item>
                    <Form.Item name="education">
                        <Select placeholder="学历" style={{ width: 100 }} options={eduOption} allowClear />
                    </Form.Item>
                    <Form.Item name="timeRange" getValueProps={(e) => ({})} getValueFromEvent={formatTimeRange}>
                        <DatePicker.RangePicker
                            picker="year"
                            allowEmpty={[true, true]}
                            disabledDate={(e) => {
                                let y = e.get("year");
                                return y < 2023 || y > new Date().getFullYear();
                            }}
                        />
                    </Form.Item>
                    <div style={{ justifySelf: "center", display: "flex", gap: "24px", justifyContent: "right" }}>
                        <Dropdown
                            menu={{
                                items: JobNameList,
                                onClick: (e) => {
                                    let text = JobNameList![parseInt(e.key)].label;
                                    console.log(text);
                                    form.setFieldValue("jobName", text);
                                    setSearchName(text);
                                },
                            }}
                            trigger={["click"]}
                        >
                            <Form.Item name="jobName" style={{ margin: 0 }}>
                                <Input
                                    placeholder="请输入职位名称"
                                    allowClear
                                    onChange={(val) => setSearchName(val.currentTarget.value)}
                                />
                            </Form.Item>
                        </Dropdown>
                        <Button type="primary" disabled={!analyzable} onClick={onAnalysis}>
                            分析
                        </Button>
                    </div>
                </div>
            </Form>
        </div>
    );
}
function getNumEnumKeys(numEnum: Object) {
    let keys = Object.keys(numEnum);
    let values: string[] = [];
    for (const key of keys) {
        let val = (numEnum as any)[key];
        if (typeof val === "number") values.push(key);
    }
    return values;
}
function getNumEnumEntires(numEnum: Object): [string, number][];
function getNumEnumEntires(numEnum: any) {
    let keys = Object.keys(numEnum);
    let values: [string, number][] = [];
    for (const key of keys) {
        let val = numEnum[key];
        if (typeof val === "number") values.push([key, val]);
    }
    return values;
}
