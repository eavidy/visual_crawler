import React, { useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { COLOR } from "./styles/colors.ts";
import { ConfigProvider } from "antd";
// @ts-ignore
import zhCN from "antd/locale/zh_CN.js";
import { useGlobalNavigate } from "./utils/global-navigate.ts";
function removeLoadingAnimation() {
  let styleEle = document.getElementById("loadingStyle");
  styleEle?.parentNode?.removeChild(styleEle);
  let ele = document.getElementById("loading");
  ele?.parentNode?.removeChild(ele);
}

export default function App() {
  useEffect(() => {
    removeLoadingAnimation();
  }, []);
  useGlobalNavigate(); //react-router v6 navigate, 解决axios拦截器外部修改路由的问题

  const theme = useMemo(function () {
    return {
      token: {
        colorPrimary: COLOR.main1,
      },
    };
  }, []);
  return (
    <ConfigProvider locale={zhCN as any} theme={theme}>
      <Outlet />
    </ConfigProvider>
  );
}
