import { Card } from "@/components/card";
import { Echarts } from "@/components/echarts";
import { Empty } from "antd";
import type { EChartsOption, SeriesOption } from "echarts";
import React, { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

export function Top20Billboard(props: {
    data?: Record<string, any[]>;
    title?: string;
    legendNameMap: Record<string, string>;
    dimensions: string[];
    loading?: boolean;
    style?: CSSProperties;
}) {
    const { data = {}, title, loading, dimensions, legendNameMap } = props;
    const keyList = useMemo(() => Object.keys(data), [data]);
    let [showBoard, setShowBoard] = useState<string | undefined>();
    if (!showBoard) showBoard = keyList[0];
    const currentBoard = data[showBoard];

    const echartsRef = useRef<echarts.ECharts>();

    let height = 19 * (currentBoard?.length ?? 0) + 80;
    const cityBoardOption = useMemo(() => {
        if (!currentBoard || currentBoard.length === 0) {
            return {
                title: { text: title },
            };
        }
        let series: SeriesOption = { type: "bar", label: { show: true, position: "insideLeft" } };
        let option: EChartsOption = {
            title: {
                text: title,
            },

            legend: {
                selectedMode: "single",
                formatter(name) {
                    return legendNameMap[name];
                },
                top: 20,
                right: 10,
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true,
            },
            dataset: {
                dimensions,
                source: currentBoard,
            },
            xAxis: {
                type: "value",
            },
            yAxis: {
                type: "category",
            },
            series: [series, series],
        };
        echartsRef.current?.resize({ height });
        return option;
    }, [currentBoard]);

    useEffect(() => {
        const charts = echartsRef.current;
        charts?.on("legendselectchanged", (e: any) => setShowBoard(e.name));
    }, [echartsRef.current]);
    return (
        <Card style={props.style}>
            <Echarts ref={echartsRef} style={{ height }} option={cityBoardOption} noMerged state={{ loading }} />
            {!currentBoard?.length ? <Empty /> : undefined}
        </Card>
    );
}
