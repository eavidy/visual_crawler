import { createRoot } from "react-dom/client";
import router from "./router";

const root = document.createElement("div");
root.style.width = "100%";
root.style.height = "100%";
document.body.appendChild(root);
createRoot(root).render(router);
