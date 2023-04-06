import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginForm, ProFormCheckbox, ProFormText } from "@ant-design/pro-components";
import { Divider, Spin, Tabs, message } from "antd";
import React from "react";
import { useState } from "react";
import LogoIcon from "@/components/img/logo";
import { $http, $localStore } from "@/http";
import { ApiReq, ApiRes } from "common/request/login";
import md5 from "js-md5";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useRequest } from "ahooks";
import { Effect } from "./components/effect";
import styled from "@emotion/styled";
import { PageContainer } from "@/components/page-container";

type LoginType = "phone" | "account";

export default () => {
    const [loginType, setLoginType] = useState<LoginType>("phone");
    const navigate = useNavigate();
    async function onLogin(req: ApiReq.Login) {
        const pwd = md5(req.pwd + "asnow");
        let reqParams: ApiReq.Login = {
            pwd,
            userId: req.userId,
            saveState: req.saveState,
        };
        try {
            const { data } = await $http.post<ApiRes.Login>("/auth/login", reqParams);
            $localStore.accessToken = data.accessToken;
            message.success("登录成功");
            navigate("/v/admin");
        } catch (error) {
            const { response } = error as AxiosError<{ message: string }>;
            response?.data?.message && message.error(response?.data.message);
        }
    }
    const { data, loading } = useRequest(() => $http.get<ApiRes.Visitor>("/auth/visitor").then(({ data }) => data));
    return (
        <PageContainer
            contentStyle={{
                display: "flex",
                justifyContent: "stretch",
                alignItems: "stretch",
            }}
        >
            <div
                style={{
                    flex: 1,
                    position: "relative",
                }}
            >
                <img
                    src="/img/bg2.jpg"
                    style={{
                        height: "100%",
                        width: "100%",
                        opacity: 0.8,
                        objectFit: "cover",
                    }}
                />
                <Effect style={{ position: "absolute", top: 0, left: 0 }} />
            </div>
            <div style={{ padding: 24 }}>
                <LoginForm
                    logo={<LogoIcon style={{ border: "1px #5470C6 solid" }} />}
                    style={{ flex: 0 }}
                    title="Visualized Analysis"
                    subTitle="基于爬虫的职位信息可视化系统"
                    onAuxClick={() => console.log("d")}
                    onFinish={onLogin}
                    actions={
                        <flex
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                                paddingTop: "48px",
                            }}
                        >
                            {data?.enable && (
                                <Divider plain>
                                    <span style={{ color: "#CCC", fontWeight: "normal", fontSize: 14 }}>
                                        {data?.message}
                                    </span>
                                </Divider>
                            )}
                            <Spin spinning={loading} style={{ width: "100%" }}>
                                {data?.enable && (
                                    <div>
                                        <p>账号：{data?.userId}</p>
                                        <p>密码：{data?.pwd}</p>
                                    </div>
                                )}
                            </Spin>
                        </flex>
                    }
                >
                    <Tabs centered activeKey={loginType} onChange={(activeKey) => setLoginType(activeKey as LoginType)}>
                        <Tabs.TabPane key={"account"} tab={"账号密码登录"} disabled />
                    </Tabs>
                    <ProFormText
                        name="userId"
                        fieldProps={{
                            size: "large",
                            prefix: <UserOutlined className={"prefixIcon"} />,
                        }}
                        placeholder={"用户名"}
                        rules={[
                            {
                                required: true,
                                message: "请输入用户名!",
                            },
                        ]}
                    />
                    <ProFormText.Password
                        name="pwd"
                        fieldProps={{
                            size: "large",
                            prefix: <LockOutlined className={"prefixIcon"} />,
                        }}
                        placeholder={"密码"}
                        rules={[
                            {
                                required: true,
                                message: "请输入密码！",
                            },
                        ]}
                    />
                    <div
                        style={{
                            marginBlockEnd: 24,
                        }}
                    >
                        <ProFormCheckbox noStyle name="saveState">
                            保持登录状态
                        </ProFormCheckbox>
                        <a
                            style={{
                                float: "right",
                            }}
                        >
                            忘记密码
                        </a>
                    </div>
                </LoginForm>
            </div>
        </PageContainer>
    );
};

const CssLoginForm = styled(LoginForm)`
    .ant-pro-form-login-top {
        color: "red";
    }
`;
