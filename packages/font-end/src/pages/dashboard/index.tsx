import { useRequest } from "ahooks";
import React, { useMemo, useState } from "react";
import { DatePicker, Input, Select, Form, Image, Button } from "antd";
import { $http } from "@/http";
import { ApiReq } from "api/request/dashboard";
import { WorkExp } from "api/request/enum";
import { Right } from "./components/dash-right";
import { Left } from "./components/dash-left";
import { Education } from "api/model";

export default function () {
    const [filterOption, setFilterOption] = useState<ApiReq.MatchFilter>({});
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                background: "#F5F5F5",
                minWidth: "1200px",
            }}
        >
            <Header onAnalysis={(values) => setFilterOption(values)} />
            <div style={{ flex: 1, display: "flex" }}>
                <Left filterOptions={filterOption} />
                <Right />
            </div>
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

function Header(props: { onAnalysis: (value: ApiReq.MatchFilter) => void }) {
    const { onAnalysis: onChange } = props;
    const [analyzable, setAnalyzable] = useState(false);
    const { data, loading } = useRequest(async function () {
        const { data } = await $http.get<{ value: string; label: string }[]>("api/dashboard/dq_options");
        return data;
    });
    const [form] = Form.useForm<ApiReq.MatchFilter>();
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
        onChange(values);
    }

    return (
        <div style={{ flexBasis: "60px", width: "100%", padding: "8px", backgroundColor: "#688667" }}>
            <Form
                layout="inline"
                form={form}
                style={{ alignItems: "center", justifyContent: "space-between" }}
                onValuesChange={() => setAnalyzable(true)}
            >
                <div style={{ padding: 8, display: "flex", alignItems: "center", gap: "12px" }}>
                    <Image
                        src="/img/logo.webp"
                        preview={false}
                        style={{ borderRadius: "50%", width: "50px", padding: "5px", backgroundColor: "#fff" }}
                    />
                    <b style={{ fontSize: "32px", color: "#FFF" }}>Visualized Analysis</b>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <Form.Item name="cityId">
                        <Select
                            options={data}
                            loading={loading}
                            placeholder="选择省份"
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
                    <Form.Item
                        name="startTime"
                        getValueProps={(e) => {
                            return {};
                        }}
                        getValueFromEvent={(e) => e?.toDate().getTime()}
                    >
                        <DatePicker picker="year" placeholder="起始年份" style={{ width: 100 }} allowClear />
                    </Form.Item>
                    <Form.Item
                        name="endTime"
                        getValueProps={(e) => {
                            return {};
                        }}
                        getValueFromEvent={(e) => e?.toDate().getTime()}
                    >
                        <DatePicker picker="year" placeholder="结束年份" style={{ width: 100 }} allowClear />
                    </Form.Item>
                    <div style={{ justifySelf: "center", display: "flex", gap: "24px", justifyContent: "right" }}>
                        <Form.Item name="jobName" style={{ margin: 0 }}>
                            <Input placeholder="请输入职位名称" allowClear />
                        </Form.Item>
                        <Button type="primary" disabled={!analyzable} onClick={onAnalysis}>
                            分析
                        </Button>
                    </div>
                </div>
            </Form>
        </div>
    );
}
