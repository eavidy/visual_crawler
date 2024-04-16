import { createHashRouter } from "react-router-dom";
import adminRouter from "./pages/admin/admin.router.tsx";
import { lazyComponent } from "./components/layz-component.tsx";
import App from "./app.tsx";
const router = createHashRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        path: "",
        lazy: () => lazyComponent(import("./pages/dashboard/index.tsx")),
      },
      {
        path: "login",
        lazy: () => lazyComponent(import("./pages/login/index.tsx")),
      },
      adminRouter,
    ],
  },
]);

export default router;
