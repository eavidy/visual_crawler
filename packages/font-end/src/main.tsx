import React from "react";
import { createRoot } from "react-dom/client";
import router from "./router";
import "@/styles/global_style";
import { RouterProvider } from "react-router-dom";

const appElement = document.createElement("div");
appElement.style.width = "100vw";
appElement.style.height = "100vh";
document.body.appendChild(appElement);
createRoot(appElement).render(<RouterProvider router={router} />);

if (import.meta.env.DEV) {
    //屏蔽自定义元素警告
    const rawError = console.error;
    console.error = function error() {
        let msg = arguments[0];
        if (typeof msg === "string" && msg.startsWith("Warning: The tag <%s> is unrecognized in this browser")) return;
        rawError.apply(console, arguments as any);
    };
}
