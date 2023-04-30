import { Card } from "@/components/card";
import { Echarts } from "@/components/echarts";
import { Empty } from "antd";
import { EChartsOption } from "echarts";
import React, { CSSProperties, useEffect, useMemo, useRef } from "react";

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
        if (!data?.length)
            return {
                title: {
                    left: "center",
                    text: title,
                },
            };
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
    const ref = useRef<echarts.ECharts>();
    const isEmpty = !data?.length;
    useEffect(() => {
        ref.current?.resize();
    }, [isEmpty]);

    return (
        <Card style={props.style}>
            <Echarts
                ref={ref}
                option={option}
                noMerged
                style={{ height: isEmpty ? 100 : "100%" }}
                state={{ loading: props.loading }}
            />
            {isEmpty && <Empty />}
        </Card>
    );
}
