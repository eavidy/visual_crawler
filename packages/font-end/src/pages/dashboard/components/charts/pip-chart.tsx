import { Card } from "@/components/card";
import { Echarts } from "@/components/echarts";
import { EChartsOption } from "echarts";
import React, { CSSProperties } from "react";
import { useMemo } from "react";

export function PipChart(props: {
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
                text: title,
                left: "center",
            },
            tooltip: {
                trigger: "item",
                formatter: "{b} ({d}%)",
            },
            legend: {
                orient: "vertical",
                right: 0,
                top: "center",
            },
            dataset: {
                source: data,
                dimensions,
            },
            series: [
                {
                    type: "pie",
                    radius: "65%",
                    center: ["40%", "60%"],
                    selectedMode: "single",
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: "rgba(0, 0, 0, 0.5)",
                        },
                    },
                },
            ],
        };
        return option;
    }, [data, dimensions, nameMap, title]);

    return (
        <Card style={props.style}>
            <Echarts style={{ height: "100%" }} option={option} state={{ loading: props.loading }} />
        </Card>
    );
}
