import React from "react";
import { Outlet } from "react-router-dom";
import { COLOR } from "./styles/colors";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useGlobalNavigate } from "./utils/global-navigate";

export default function App() {
    useGlobalNavigate(); //react-router v6 navigate, 解决axios拦截器外部修改路由的问题
    console.log("render");

    return (
        <ConfigProvider
            locale={zhCN}
            theme={{
                token: {
                    colorPrimary: COLOR.main1,
                },
            }}
        >
            <Outlet />
        </ConfigProvider>
    );
}
