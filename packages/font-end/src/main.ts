import { createRoot } from "react-dom/client";
import router from "./router";
import "./styles/global_style";

const root = document.createElement("div");
root.style.width = "100%";
root.style.height = "100%";
document.body.appendChild(root);
createRoot(root).render(router);

if (import.meta.env.DEV) {
    const rawError = console.error;
    console.error = function error() {
        let msg = arguments[0];
        if (typeof msg === "string" && msg.startsWith("Warning: The tag <%s> is unrecognized in this browser")) return;
        rawError.apply(console, arguments as any);
    };
}
