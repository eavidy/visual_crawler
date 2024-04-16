import { Modal, Form, Input, message, InputNumber } from "antd";
import React, { useEffect } from "react";
import type { ApiReq } from "common/request/crawler/crawl_process.d.ts";
import { useRequest } from "ahooks";
import { processResource } from "../services/process.resource.ts";

export interface ProcessAddModalProps {
  open?: boolean;
  onCancel: () => void;
  onRefresh: () => void;
  info?: { name: string; memoryLimit: number; id: number };
}
export function ProcessAddModal(props: ProcessAddModalProps) {
  const { info, open } = props;
  const typeDesc = info ? "修改" : "创建";
  const { loading, runAsync } = useRequest(
    async function (data: ApiReq.CreateProcess) {
      if (info) return processResource.updateProcess(info.id, data);
      else return processResource.createProcess(data);
    },
    {
      manual: true,
      onSuccess() {
        message.success(typeDesc + "成功");
      },
      onError(e, params) {
        message.error(typeDesc + "失败");
      },
    }
  );
  const [form] = Form.useForm();

  async function onOk() {
    let formValues = form.getFieldsValue();
    await runAsync(formValues);
    props.onRefresh();
    props.onCancel();
  }
  useEffect(() => {
    if (open) {
      form.resetFields();
      if (info) form.setFieldsValue(info);
    }
  }, [form, info, open]);
  return (
    <Modal
      open={open}
      destroyOnClose
      title={typeDesc + "进程"}
      onCancel={props.onCancel}
      onOk={onOk}
      okText={typeDesc}
      confirmLoading={loading}
      bodyStyle={{ paddingTop: 24 }}
    >
      <Form form={form} layout="horizontal">
        <Form.Item label="进程名称" name="name">
          <Input />
        </Form.Item>
        {!info && (
          <Form.Item label="内存上限" name="memoryLimit">
            <InputNumber min={100} max={1024} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
