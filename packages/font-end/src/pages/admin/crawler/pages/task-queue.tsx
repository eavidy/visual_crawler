import { Button, Card, Form, Modal, Select, Space, Table, TableProps, message } from "antd";
import React, { useState } from "react";
import { DefaultStatus, FailedStatus, FinishedStatus } from "@/components/status-bar.tsx";
import { useRequest } from "ahooks";
import { taskQueueResource, type TaskQueueList, GetTasksFilterOption } from "../services/task-queue.resource.ts";
import { PageContainer } from "@ant-design/pro-components";
import { ProcessAddModal, ProcessAddModalProps } from "../components/process-add-modal.tsx";
import { SiteTag, TaskState, TaskType } from "common/model/index.js";
export default function TaskQueueList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [form] = Form.useForm<GetTasksFilterOption>();
  const pageSize = 15;
  const { data, refresh } = useRequest(
    () => taskQueueResource.getTasks({ pageSize, start: currentPage - 1 }, form.getFieldsValue()),
    {
      pollingInterval: 2000,
      refreshDeps: [currentPage],
    }
  );
  const [selectedIdList, setSelectedIdList] = useState<React.Key[]>([]);

  const [showCreateModal, setShowCreateModal] = useState<Pick<ProcessAddModalProps, "info" | "open">>({
    open: false,
  });
  const [modal, modalContent] = Modal.useModal();

  function onAddCityTask() {
    modal.confirm({
      title: "确认添加所有城市任务",
      async onOk() {
        try {
          await taskQueueResource.addJobFilterTask({ siteTag: SiteTag.liepin });
          message.success("添加成功");
        } catch (error) {
          message.error("添加失败");
        }
      },
    });
  }
  function onAddCompanyTask() {
    modal.confirm({
      title: "确认添加所有公司任务?",
      async onOk() {
        try {
          await taskQueueResource.addCompanyTask({ siteTag: SiteTag.liepin });
          message.success("添加成功");
        } catch (error) {
          message.error("添加失败");
        }
      },
    });
  }
  function onClear() {
    modal.confirm({
      title: "确认清空任务队列?",
      async onOk() {
        try {
          await taskQueueResource.clearTasks();
          message.success("已清空");
        } catch (error) {
          message.error("清空失败");
        }
      },
    });
  }
  function onDelete() {
    modal.confirm({
      title: "确认删除该进程?",
      async onOk() {
        try {
          await taskQueueResource.deleteTasks(selectedIdList as string[]);
          message.success("删除成功");
        } catch (error) {
          message.error("删除失败");
        }
      },
    });
  }

  const columns: TableProps<TaskQueueList>["columns"] = [
    { title: "id", dataIndex: "name" },
    {
      title: "类型",
      dataIndex: "type",
    },
    {
      title: "优先级",
      dataIndex: "priority",
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (value) => {
        switch (value) {
          case TaskState.executing:
            return <FinishedStatus text={"执行中"} style={{ width: "60px" }} />;
          case TaskState.failed:
            return <FailedStatus text={"失败"} style={{ width: "60px" }} />;
          case TaskState.unexecuted:
            return <DefaultStatus text="未执行" style={{ width: "60px" }} />;
          default:
            return "--";
        }
      },
    },
  ];
  return (
    <PageContainer>
      <Card
        title="任务管理"
        extra={
          <Space>
            <Button onClick={onClear}>清空任务队列</Button>
            <Button onClick={onAddCompanyTask}>添加公司任务</Button>
            <Button onClick={onAddCityTask}>添加城市任务</Button>
          </Space>
        }
      >
        <flex style={{ justifyContent: "space-between", marginBottom: 14 }}>
          <Form form={form} layout="inline" onValuesChange={refresh}>
            <Form.Item label="类型" name="type">
              <Select
                allowClear
                options={[
                  { label: "jobFilter", value: TaskType.jobFilter },
                  { label: "company", value: TaskType.company },
                ]}
                style={{ width: 100 }}
              />
            </Form.Item>
            <Form.Item label="状态" name="status">
              <Select
                allowClear
                options={[
                  { label: "失败", value: TaskState.failed },
                  { label: "执行中", value: TaskState.executing },
                  { label: "未执行", value: TaskState.unexecuted },
                ]}
                style={{ width: 100 }}
              />
            </Form.Item>
          </Form>
          {!!selectedIdList.length && (
            <Button type="primary" onClick={onDelete}>
              删除
            </Button>
          )}
        </flex>
        <Table
          pagination={{ pageSize, total: data?.total, onChange: (page) => setCurrentPage(page) }}
          rowSelection={{
            onChange: (selectedRowKeys) => setSelectedIdList(selectedRowKeys),
          }}
          size="small"
          dataSource={data?.items}
          columns={columns}
        />
        <ProcessAddModal
          open={showCreateModal.open}
          info={showCreateModal.info}
          onCancel={() => setShowCreateModal({ open: false })}
          onRefresh={refresh}
        />
        {modalContent}
      </Card>
    </PageContainer>
  );
}
