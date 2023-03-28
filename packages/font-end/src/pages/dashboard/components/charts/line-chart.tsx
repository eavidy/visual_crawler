import { Card } from "@/components/card";
import { Echarts } from "@/components/echarts";
import { EChartsOption } from "echarts";
import React, { CSSProperties, useMemo } from "react";

export function LineChart(props: {
    data?: Record<string, any>[];
    style?: CSSProperties;
    loading?: boolean;
    dimensions: string[];
    nameMap?: Record<string, string>;
    title: string;
}) {
    const { data, dimensions, nameMap = {}, title } = props;
    const option = useMemo(() => {
        if (!data) return;
        const option: EChartsOption = {
            title: {
                left: "center",
                text: title,
            },
            tooltip: {
                trigger: "axis",
            },
            xAxis: {
                type: "category",
            },
            yAxis: { type: "value" },

            grid: {
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true,
            },

            dataset: {
                dimensions,
                source: data,
            },
            series: {
                type: "line",
                label: { show: true, position: "top" },
            },
        };
        return option;
    }, [data, dimensions]);
    return (
        <Card style={props.style}>
            <Echarts option={option} style={{ height: "100%" }} state={{ loading: props.loading }} />
        </Card>
    );
}
