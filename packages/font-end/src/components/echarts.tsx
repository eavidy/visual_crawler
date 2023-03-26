import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import React, { useEffect, useImperativeHandle, useMemo, useRef } from "react";

export const EchartsComp = React.forwardRef(function Echarts(
    props: JSX.IntrinsicElements["div"] & {
        theme?: string | object;
        initOption?: EChartsInitOpts;
        option?: EChartsOption;
        state?: {
            loading?: boolean;
        };
    },
    ref
) {
    const { initOption, theme, option, state = {} } = props;

    let domRef = useRef<HTMLDivElement | null>(null);
    let chartsRef = useRef<echarts.ECharts>();
    useImperativeHandle(ref, () => chartsRef.current, [chartsRef.current]);
    useEffect(() => {
        chartsRef.current = echarts.init(domRef.current!, theme, initOption);
        return function () {
            chartsRef.current!.dispose();
        };
    }, []);

    useEffect(() => {
        chartsRef.current!.setOption(option ?? {});
    }, [chartsRef.current, option]);

    useEffect(() => {
        if (state.loading) chartsRef.current!.showLoading();
        else chartsRef.current!.hideLoading();
    }, [state.loading]);
    let divProps = { ...props };
    delete divProps.theme;
    delete divProps.initOption;
    delete divProps.option;
    delete divProps.state;
    return <div {...divProps} ref={domRef}></div>;
});

export const Echarts = React.memo(EchartsComp);
export type EChartsInitOpts = NonNullable<Parameters<typeof echarts.init>[2]>;
