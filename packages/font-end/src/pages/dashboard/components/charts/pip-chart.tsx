import { Card } from "@/components/card.tsx";
import { ECharts, EChartsOption } from "echarts-comp";
import { Empty } from "antd";
import React, { CSSProperties, useEffect, useRef } from "react";
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
    if (!data || data.length == 0)
      return {
        title: {
          text: title,
          left: "center",
        },
      };
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
  const isEmpty = !data?.length;
  const ref = useRef<ECharts>(null);
  useEffect(() => ref.current?.resize(), [isEmpty]);

  return (
    <Card style={props.style}>
      <ECharts ref={ref} style={{ height: isEmpty ? 100 : "100%" }} option={option} loading={props.loading} />
      {isEmpty && <Empty />}
    </Card>
  );
}
