import type { ProLayoutProps, ProSettings } from "@ant-design/pro-components";
import { ProLayout } from "@ant-design/pro-components";
import { MenuProps } from "antd";
import React from "react";
import Logo from "@/components/img/logo";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { UserAvatar } from "./components/user-avatar";
import { BugOutlined, FileOutlined, UserOutlined } from "@ant-design/icons";

const routerPrefix = "/admin";
export default () => {
    const settings: ProSettings | undefined = {
        title: "Visualized Analysis",
        fixSiderbar: true,
        layout: "mix",
        splitMenus: true,
    };
    const { pathname } = useLocation();
    const navigate = useNavigate();

    function onMenuSelect(item: Parameters<NonNullable<MenuProps["onSelect"]>>[0]) {
        let path = item.key;
        if (path) {
            navigate(routerPrefix + path);
        }
    }
    function onMenuHeaderClick() {}
    return (
        <div
            style={{
                height: "100vh",
                overflowX: "hidden",
            }}
        >
            <ProLayout
                logo={<Logo size={40} onClick={() => navigate("/")} title="首页" />}
                route={menus}
                pageTitleRender={false}
                location={{
                    pathname: pathname.slice(routerPrefix.length),
                }}
                avatarProps={false}
                actionsRender={(props) => [<UserAvatar />]}
                menuFooterRender={(props) => {
                    if (props?.collapsed) return undefined;
                    return (
                        <div
                            style={{
                                textAlign: "center",
                                paddingBlockStart: 12,
                            }}
                        >
                            <div>© 2021 Made with love</div>
                            <div>by Ant Design</div>
                        </div>
                    );
                }}
                onMenuHeaderClick={onMenuHeaderClick}
                menuProps={{
                    onSelect: onMenuSelect,
                }}
                {...settings}
            >
                <Outlet />
            </ProLayout>
        </div>
    );
};
type MenuRoute = NonNullable<ProLayoutProps["route"]>;
const menus: MenuRoute = {
    path: "admin",

    children: [
        {
            path: "crawler",
            name: "采集器管理",
            icon: <BugOutlined />,
            children: [
                {
                    path: "",
                },
                {
                    path: ":processId",
                },
            ],
        },
        {
            path: "task",
            name: "任务管理",
            icon: <FileOutlined />,
        },
        {
            path: "auth/user",
            // name: "权限管理",
            // icon: <SafetyCertificateOutlined />,
            name: "用户管理",
            icon: <UserOutlined />,
            // children: [
            //     {
            //         path: "user",
            //         name: "用户管理",
            //         icon: <UserOutlined />,
            //     },
            //     {
            //         path: "permission",
            //         name: "权限配置",
            //     },
            // ],
        },
    ],
};
function selectFirstSubMenu(path: string) {
    let paths = path.split("/").slice(1);
    let router = menus;
    for (let i = 0; i < paths.length && router.children?.length; i++) {
        let key = paths[i];
        let res = router.children?.find((val) => val.path === key);
        if (res) router = res;
    }

    while (!router.lazy && router.children?.length) {
        router = router.children[0];
        path += "/" + router.path!;
    }
    return path;
}
