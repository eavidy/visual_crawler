import { lazyComponent } from "@/components/layz-component";
import { BugOutlined, FileOutlined, SafetyCertificateOutlined, UserOutlined } from "@ant-design/icons";
import React from "react";
import type { RouteObject } from "react-router-dom";
export interface RouterMeta {
    name: string;
    icon?: JSX.Element;
}
export type ExtraRouterObject = Pick<RouteObject, "path" | "lazy"> & {
    meta?: RouterMeta;
    children?: ExtraRouterObject[];
};

const router: ExtraRouterObject = {
    path: "admin",
    lazy: () => lazyComponent(import("./menu/admin")),

    children: [
        {
            path: "crawler",
            meta: {
                name: "采集器管理",
                icon: <BugOutlined />,
            },
            children: [
                {
                    path: "",
                    lazy: () => lazyComponent(import("./crawler/pages/process-list")),
                },
                {
                    path: ":processId",
                    lazy: () => lazyComponent(import("./crawler/pages/crawler-list")),
                },
            ],
        },
        {
            path: "task",
            meta: {
                name: "任务管理",
                icon: <FileOutlined />,
            },
            children: [
                {
                    path: "",
                    lazy: () => lazyComponent(import("./crawler/pages/task-queue")),
                },
            ],
        },
        {
            path: "auth",
            meta: {
                // name: "权限管理",
                // icon: <SafetyCertificateOutlined />,
                name: "用户管理",
                icon: <UserOutlined />,
            },
            children: [
                {
                    path: "user",
                    lazy: () => lazyComponent(import("./auth/pages/user")),
                    // meta: {
                    // name: "用户管理",
                    // icon: <UserOutlined />,
                    // },
                },
                {
                    path: "permission",
                    lazy: () => lazyComponent(import("./auth/pages/auth")),
                    // meta: {
                    // name: "权限配置",
                    // },
                },
            ],
        },
    ],
};
export default router;
function toAntdRouter(router: ExtraRouterObject) {
    let obj = { ...router, ...router.meta };
    delete obj.meta;
    if (router.children) {
        let children: typeof obj[] = [];
        for (const subObj of router.children) {
            children.push(toAntdRouter(subObj));
        }
        obj.children = children;
    }
    return obj;
}
export const antdRouter = toAntdRouter(router);
