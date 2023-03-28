import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import "antd/dist/reset.css";

const router = createBrowserRouter([
    {
        path: "/",
        children: [
            {
                path: "",
                Component: React.lazy(() => import("./pages/dashboard")),
            },
            {
                path: "v",
                children: [
                    {
                        path: "login",
                        Component: React.lazy(() => import("./pages/login")),
                    },
                    {
                        path: "admin",
                        Component: React.lazy(() => import("./pages/admin")),
                    },
                ],
            },
        ],
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
