import { createHashRouter } from "react-router-dom";
import adminRouter from "./pages/admin/admin.router";
import { lazyComponent } from "./components/layz-component";
import App from "./app";

const router = createHashRouter([
    {
        path: "/",
        Component: App,
        children: [
            {
                path: "",
                lazy: () => lazyComponent(import("./pages/dashboard")),
            },
            {
                path: "login",
                lazy: () => lazyComponent(import("./pages/login")),
            },
            adminRouter,
        ],
    },
]);

export default router;
