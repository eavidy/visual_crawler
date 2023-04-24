import type { ProSettings } from "@ant-design/pro-components";
import { PageContainer, ProLayout, ProCard } from "@ant-design/pro-components";
import { MenuProps } from "antd";
import { useState } from "react";
import { antdRouter } from "../admin.router";
import React from "react";
import Logo from "@/components/img/logo";
import { Outlet, useLocation, useNavigate, useNavigation, useParams } from "react-router-dom";
import { UserAvatar } from "./components/user-avatar";

function selectFirstSubMenu(path: string) {
    let paths = path.split("/").slice(1);
    let router = antdRouter;
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

const routerPrefix = "/v/admin";
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
            let firstPath = selectFirstSubMenu(path);
            navigate(routerPrefix + firstPath);
        }
    }
    function onMenuHeaderClick() {}
    return (
        <div
            id="test-pro-layout"
            style={{
                height: "100vh",
            }}
        >
            <ProLayout
                logo={<Logo size={40} />}
                route={antdRouter}
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
