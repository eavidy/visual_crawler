import { lazyComponent } from "@/components/layz-component.tsx";
import { ErrorPage } from "@/components/state/error.tsx";
import { AuthorizationError } from "@/errors/auth.err.ts";
import { $http, $localStore } from "@/http/index.ts";
import { AxiosError } from "axios";
import React from "react";
import type { RouteObject } from "react-router-dom";

const router: RouteObject = {
  path: "admin",
  lazy: () => lazyComponent(import("./menu/admin.tsx")),

  children: [
    {
      path: "crawler",
      handle: {
        name: "采集器管理",
      },
      children: [
        {
          path: "",
          lazy: () => lazyComponent(import("./crawler/pages/process-list.tsx")),
        },
        {
          path: ":processId",
          lazy: () => lazyComponent(import("./crawler/pages/crawler-list.tsx")),
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
          lazy: () => lazyComponent(import("./crawler/pages/task-queue.tsx")),
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
          lazy: () => lazyComponent(import("./auth/pages/user.tsx")),
        },
        {
          path: "permission",
          lazy: () => lazyComponent(import("./auth/pages/auth.tsx")),
        },
      ],
    },
  ],
  /** 页面访问权限检测 */
  async loader({ params, request, context }) {
    if (!$localStore.accessToken)
      throw new AuthorizationError("未授权", "unauthorize");

    try {
      await $http.post("/auth/visit_page");
    } catch (e) {
      if (e instanceof AxiosError) {
        const { response, message } = e;
        if (response)
          throw new AuthorizationError(
            response.data.message,
            response.statusText
          );

        throw new Error("授权检测失败: " + message);
      }

      throw e;
    }
    return null;
  },
  errorElement: <ErrorPage />,
};
export default router;
