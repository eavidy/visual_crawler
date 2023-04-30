import React, { useMemo } from "react";
import { Outlet } from "react-router-dom";
import { COLOR } from "./styles/colors";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useGlobalNavigate } from "./utils/global-navigate";

export default function App() {
    useGlobalNavigate(); //react-router v6 navigate, 解决axios拦截器外部修改路由的问题

    const theme = useMemo(function () {
        return {
            token: {
                colorPrimary: COLOR.main1,
            },
        };
    }, []);
    return (
        <ConfigProvider locale={zhCN} theme={theme}>
            <Outlet />
        </ConfigProvider>
    );
}
