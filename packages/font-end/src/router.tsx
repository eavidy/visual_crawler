import React, { lazy } from "react";
import { createBrowserRouter, LazyRouteFunction, RouterProvider } from "react-router-dom";

import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import "antd/dist/reset.css";

async function lazyComponent(module: Promise<any>) {
    const mod = await module;
    return {
        Component: mod.default as (...args: any) => JSX.Element,
    };
}
const router = createBrowserRouter([
    {
        path: "/",
        children: [
            {
                path: "",
                lazy: () => lazyComponent(import("./pages/dashboard")),
            },
            {
                path: "v",
                children: [
                    {
                        path: "login",
                        lazy: () => lazyComponent(import("./pages/login")),
                    },
                    {
                        path: "admin",
                        lazy: () => lazyComponent(import("./pages/admin")),
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
