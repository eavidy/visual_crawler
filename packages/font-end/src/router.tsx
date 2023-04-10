import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import adminRouter from "./pages/admin/admin.router";
import { lazyComponent } from "./components/layz-component";
import { COLOR } from "./styles/colors";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import "antd/dist/reset.css";

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
                    adminRouter,
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
                    colorPrimary: COLOR.main1,
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
