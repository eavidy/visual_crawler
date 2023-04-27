import { lazyComponent } from "@/components/layz-component";
import type { RouteObject } from "react-router-dom";

const router: RouteObject = {
    path: "admin",
    lazy: () => lazyComponent(import("./menu/admin")),

    children: [
        {
            path: "crawler",
            handle: {
                name: "采集器管理",
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
            handle: {
                name: "任务管理",
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
            handle: {
                name: "用户管理",
            },
            children: [
                {
                    path: "user",
                    lazy: () => lazyComponent(import("./auth/pages/user")),
                },
                {
                    path: "permission",
                    lazy: () => lazyComponent(import("./auth/pages/auth")),
                },
            ],
        },
    ],
};
export default router;
