import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import React, { CSSProperties, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useMemoizedFn } from "ahooks";
export const EchartsComp = React.forwardRef(function Echarts(
    props: {
        style?: CSSProperties;
        theme?: string | object;
        initOption?: EChartsInitOpts;
        option?: EChartsOption;
        noMerged?: boolean;
        state?: {
            loading?: boolean;
        };
        /** 固定渲染大小;  默认会自动监听 window resize 事件, 自动调用 Echarts.resize(); 设置为true将不会监听 */
        fixedSize?: boolean;
    },
    ref
) {
    const { initOption, theme, option, noMerged, state = {}, fixedSize } = props;

    let domRef = useRef<HTMLDivElement | null>(null);
    let chartsRef = useRef<echarts.ECharts>();
    useImperativeHandle(ref, () => chartsRef.current, [chartsRef.current]);

    /** 初始化 */
    useEffect(() => {
        chartsRef.current = echarts.init(domRef.current!, theme, initOption);
        return () => chartsRef.current!.dispose();
    }, []);

    useEffect(() => {
        chartsRef.current!.setOption(option ?? {}, noMerged);
    }, [chartsRef.current, option, noMerged]);

    useEffect(() => {
        if (state.loading) chartsRef.current!.showLoading();
        else chartsRef.current!.hideLoading();
    }, [state.loading]);

    const onWindowResize = useMemoizedFn((ev: UIEvent) => chartsRef.current?.resize());

    useEffect(() => {
        if (fixedSize) window.removeEventListener("resize", onWindowResize);
        else window.addEventListener("resize", onWindowResize);

        return () => window.removeEventListener("resize", onWindowResize);
    }, [fixedSize]);
    return <div style={props.style} ref={domRef}></div>;
});

export const Echarts = React.memo(EchartsComp);
export type EChartsInitOpts = NonNullable<Parameters<typeof echarts.init>[2]>;
