import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import "antd/dist/reset.css";

const router = createBrowserRouter([
    {
        path: "/",
        Component: React.lazy(() => import("./pages/home")),
        children: [],
    },
    {
        path: "/dashboard",
        Component: React.lazy(() => import("./pages/dashboard")),
    },
]);

function AndTheme(props: React.PropsWithChildren) {
    return (
        <ConfigProvider
            locale={zhCN}
            theme={{
                token: {
                    colorPrimary: "#5470C6",
                },
            }}
        >
            {props.children}
        </ConfigProvider>
    );
}

export default (
    <AndTheme>
        <RouterProvider router={router} />
    </AndTheme>
);
