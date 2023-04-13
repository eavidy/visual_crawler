import { EditOutlined, LockOutlined, LogoutOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, MenuProps, Modal, Space, Form, Input, message, Spin, notification } from "antd";
import { useState } from "react";
import React from "react";
import { useRequest } from "ahooks";
import { $http, $localStore } from "@/http";
import { Rule } from "antd/es/form";
import type { ApiReq } from "common/request/auth/user";
import { createPwdHash } from "@/pages/login/funcs/pwd_hash";
import { AxiosError } from "axios";

interface UserInfo {
    id: string;
    name: string;
    permission: Set<string>;
}

function goToLoginPage() {
    location.href = "/v/login";
}
export function UserAvatar() {
    let { refresh, data, loading } = useRequest(
        async function () {
            const {
                data: { item },
            } = await $http.get<{ item: UserInfo }>("/auth/user/info");

            if (Array.isArray(item.permission)) item.permission = new Set(item.permission);
            return item;
        },
        {
            onSuccess(data, params) {
                if (data.permission.has("readonly"))
                    notification.warning({
                        message: "您当前处于访客模式，欢迎参观！",
                        description: "访客模式下您没有权限执行增删改操作",
                        placement: "top",
                        duration: 0,
                    });
            },
        }
    );
    const [openModal, setOpenModal] = useState<boolean | string>();
    const userName = data?.name ?? "--";

    function loginOut() {
        $localStore.clearToken();
        goToLoginPage();
    }
    const items: MenuProps["items"] = [
        {
            key: "updateUserInfo",
            label: "修改信息",
            icon: <EditOutlined />,
            onClick: () => setOpenModal("info"),
        },
        { key: "changePwd", label: "修改密码", icon: <LockOutlined />, onClick: () => setOpenModal("pwd") },
        { key: "logout", label: "退出登录", icon: <LogoutOutlined />, onClick: loginOut },
    ];
    return (
        <>
            {loading ? (
                <Spin style={{ margin: "0 12px" }} />
            ) : (
                <Dropdown menu={{ items }}>
                    <Space style={{ justifyContent: "center", height: "calc(100% - 12px)" }}>
                        <Avatar>{userName[0]}</Avatar>
                        {userName}
                    </Space>
                </Dropdown>
            )}
            <UserUpdateModal
                open={!!openModal}
                onClose={setOpenModal}
                onUserInfoChange={refresh}
                title={openModal === "pwd" ? "修改密码" : "修改用户信息"}
                pwd={openModal === "pwd"}
                info={openModal == "info"}
            />
        </>
    );
}

function UserUpdateModal(props: {
    title: string;
    open: boolean;
    onClose: (val: boolean) => void;
    onUserInfoChange?: (info: UserInfo) => void;
    pwd?: boolean;
    info?: boolean;
}) {
    const { pwd = false, info = false, onUserInfoChange } = props;
    const [form] = Form.useForm<ApiReq.UserInfo>();

    const { runAsync, loading } = useRequest(
        (formData) => $http.post("/auth/user/info", { ...formData, id: $localStore.userId }),
        {
            manual: true,
            onError(e: Error | AxiosError, params) {
                let msg = e.message;
                if (e instanceof AxiosError) msg = e.response?.data.message ?? e.message;
                message.error(msg);
            },
        }
    );
    const onClose = () => {
        form.resetFields();
        props.onClose(false);
    };
    async function onOk() {
        let { newPwd, oldPwd, pwdConfirm, ...info } = await form.validateFields();

        if (newPwd !== pwdConfirm) {
            message.error("密码不一致");
            return;
        }
        if (pwd) {
            await runAsync({ ...info, pwd: { old: createPwdHash(oldPwd), new: createPwdHash(newPwd) } });
            goToLoginPage();
        } else {
            await runAsync(info);
            onUserInfoChange?.(info as UserInfo);
        }
        message.success("修改成功");
        onClose();
    }

    const rules: { [key: string]: Rule } = {
        require: { required: true },
    };
    return (
        <Modal title={props.title} open={props.open} onCancel={onClose} onOk={onOk} confirmLoading={loading}>
            <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                {info && (
                    <Form.Item name="name" label="用户名" required rules={[rules.require]}>
                        <Input placeholder="请输入新的用户名" required />
                    </Form.Item>
                )}
                {pwd && (
                    <>
                        <Form.Item name="oldPwd" label="旧密码" required rules={[rules.require]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="newPwd" label="新密码" required rules={[rules.require]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="pwdConfirm" label="确认密码" required rules={[rules.require]}>
                            <Input />
                        </Form.Item>
                    </>
                )}
            </Form>
        </Modal>
    );
}
