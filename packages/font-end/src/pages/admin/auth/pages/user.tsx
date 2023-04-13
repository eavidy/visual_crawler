import { useRequest } from "ahooks";
import { Button, Card, Form, Input, Modal, Space, Table, Tooltip, message } from "antd";
import React, { useState } from "react";
import { userResource } from "../services/user.resource";
import { DeleteOutlined } from "@ant-design/icons";
import { ColumnType } from "antd/es/table";
import { PageContainer } from "@ant-design/pro-components";
import { ApiRes } from "common/request/auth/user";

export default function User() {
    const { data, loading, refresh } = useRequest(userResource.getUserList, { pollingInterval: 2000 });
    const { run: createUserReq, loading: creating } = useRequest(userResource.createUser, {
        manual: true,
        onSuccess(data, params) {
            message.success("添加成功");
        },
        onError(e, params) {
            message.error("添加失败");
        },
    });
    const [modal, modalContent] = Modal.useModal();
    const [showModal, setShowModal] = useState(false);
    const [form] = Form.useForm<{ name?: string; id: string; pwd: string; pwdConfirm: string }>();
    async function onDelete(id: string) {
        modal.confirm({
            title: "确认删除该用户?",
            async onOk() {
                try {
                    await userResource.deleteUsers(id);
                    message.success("删除成功");
                    refresh();
                } catch (error) {
                    message.error("删除失败");
                }
            },
        });
    }
    async function onAdd() {
        const { pwdConfirm, ...data } = await form.validateFields();
        if (pwdConfirm !== data.pwd) {
            message.error("密码不一致");
        }
        await createUserReq(data);
        setShowModal(false);
        refresh();
    }
    const columns: ColumnType<ApiRes.GetUserList>[] = [
        {
            title: "用户ID",
            dataIndex: "_id",
        },
        {
            title: "昵称",
            dataIndex: "name",
        },
        {
            title: "操作",
            dataIndex: "_id",
            render(userId, record) {
                return (
                    <Space>
                        <Tooltip title="删除">
                            <DeleteOutlined onClick={() => onDelete(userId)} />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    const requiredRule = { required: true };
    return (
        <PageContainer>
            <Card
                title="用户管理"
                extra={
                    <Button onClick={() => setShowModal(true)} type="primary">
                        新增用户
                    </Button>
                }
            >
                <Table
                    rowKey="key"
                    pagination={{ pageSize: 15 }}
                    size="small"
                    dataSource={data?.items}
                    columns={columns}
                ></Table>
            </Card>
            <Modal
                title="新增用户"
                open={showModal}
                confirmLoading={creating}
                onOk={onAdd}
                onCancel={() => setShowModal(false)}
            >
                <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} form={form}>
                    <Form.Item required name="id" label="用户ID" rules={[requiredRule]}>
                        <Input />
                    </Form.Item>
                    <Form.Item required name="pwd" label="密码" rules={[requiredRule]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item required name="pwdConfirm" label="确认密码" rules={[requiredRule]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="name" label="昵称">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
            {modalContent}
        </PageContainer>
    );
}
