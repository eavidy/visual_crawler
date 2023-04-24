import { Button, Card, Modal, Table, TableProps, Tooltip, Space, message } from "antd";
import React, { useState } from "react";
import { ApiRes } from "common/request/crawler/crawl_process";
import { DefaultStatus, FinishedStatus } from "@/components/status-bar";
import { DeleteOutlined, EditOutlined, PlaySquareOutlined, StopOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import { processResource } from "../services/process.resource";
import { CrawlerProcessStatus } from "common/request/enum";
import { Link } from "react-router-dom";
import { PageContainer } from "@ant-design/pro-components";
import { ProcessAddModal, ProcessAddModalProps } from "../components/process-add-modal";
export default function ProcessList(props: {
    data?: ApiRes.GetProcessList;
    loading?: boolean;
    onDetail?: (id: number, name: string) => void;
}) {
    const { data, refresh } = useRequest(processResource.getProcessList, { pollingInterval: 2000 });
    const [typeFilter, setTypeFilter] = useState("all");

    const [showCreateModal, setShowCreateModal] = useState<Pick<ProcessAddModalProps, "info" | "open">>({
        open: false,
    });
    const [modal, modalContent] = Modal.useModal();
    const { run: updateReq } = useRequest(
        async (id: number, isStart: boolean) =>
            processResource.updateProcess(id, { startOrStop: isStart ? "start" : "stop" }),
        {
            manual: true,
            onError: (err, params) => message.error((params[1] ? "启动" : "终止") + "失败"),
            onSuccess() {
                message.success("指令已发送");
                refresh();
            },
        }
    );
    const { run: deleteReq } = useRequest(async (id: number) => processResource.deleteProcess(id), {
        manual: true,
        onError: () => message.error("删除失败"),
        onSuccess() {
            message.success("指令已发送");
            refresh();
        },
    });

    function onDelete(item: ApiRes.ProcessInfo) {
        modal.confirm({
            title: "确认删除该进程?",
            onOk: () => deleteReq(item.key),
        });
    }
    function onUpdate(item: ApiRes.ProcessInfo) {
        setShowCreateModal({ open: true, info: { memoryLimit: item.memoryTotal, name: item.name, id: item.key } });
    }
    function onStopOrStart(item: ApiRes.ProcessInfo, isStart: boolean) {
        if (isStart) updateReq(item.key, isStart);
        else modal.confirm({ title: "确认终止当前进程?", onOk: () => updateReq(item.key, isStart) });
    }

    const columns: TableProps<ApiRes.ProcessInfo>["columns"] = [
        {
            title: "名称",
            dataIndex: "name",
            render(value, record) {
                return <Link to={record.key.toString()}>{value}</Link>;
            },
        },
        {
            title: "PID",
            dataIndex: "pid",
            render(value) {
                return value ? value : "--";
            },
        },
        {
            title: "内存",
            dataIndex: "memoryTotal",
            render(memoryTotal, record) {
                let memory = record.status ? record.memoryUsage + "/" : "--/";
                return memory + memoryTotal + " MB";
            },
        },
        {
            title: "状态",
            dataIndex: "status",
            render: (value) => {
                switch (value) {
                    case CrawlerProcessStatus.running:
                        return <FinishedStatus text={"运行中"} style={{ width: "60px" }} />;
                    case CrawlerProcessStatus.starting:
                        return <FinishedStatus text={"启动中"} style={{ width: "60px" }} />;
                    case CrawlerProcessStatus.stopping:
                        return <FinishedStatus text={"停止中"} style={{ width: "60px" }} />;
                    case CrawlerProcessStatus.stop:
                        return <DefaultStatus text="已停止" style={{ width: "60px" }} />;
                    default:
                        return "--";
                }
            },
        },
        {
            title: "运行时间",
            render(_, record) {
                let runTime;
                if (record.status) {
                    runTime = Date.now() - record.startRunTime.getTime();
                } else if (record.lastEndTime && record.startRunTime) {
                    runTime = record.lastEndTime.getTime() - record.startRunTime.getTime();
                }
                return runTime ? (runTime / 1000 / 60 / 60).toFixed(1) + " h" : "--";
            },
        },
        {
            title: "异常",
            dataIndex: "errors",
            render(value) {
                return <a>{value?.length}</a>;
            },
        },
        {
            title: "操作",
            filteredValue: typeFilter !== "all" ? [typeFilter] : undefined,
            onFilter(value, record) {
                let cp = typeFilter === "stopping" ? 0 : 1;
                return record.status === cp;
            },
            render(_, record) {
                let startOrStop =
                    record.status === CrawlerProcessStatus.running
                        ? "停止"
                        : record.status === CrawlerProcessStatus.stop
                        ? "启动"
                        : undefined;
                return (
                    <Space>
                        <Tooltip title="删除">
                            <DeleteOutlined style={{ cursor: "pointer" }} onClick={() => onDelete(record)} />
                        </Tooltip>
                        {startOrStop && (
                            <Tooltip title={startOrStop}>
                                {startOrStop === "停止" ? (
                                    <StopOutlined
                                        style={{ cursor: "pointer" }}
                                        onClick={() => onStopOrStart(record, false)}
                                    />
                                ) : (
                                    <PlaySquareOutlined
                                        style={{ cursor: "pointer" }}
                                        onClick={() => onStopOrStart(record, true)}
                                    />
                                )}
                            </Tooltip>
                        )}

                        <Tooltip title="修改名称">
                            <EditOutlined style={{ cursor: "pointer" }} onClick={() => onUpdate(record)} />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];
    return (
        <PageContainer>
            <Card
                tabList={[
                    { key: "all", tab: "全部" },
                    { key: "running", tab: "运行中" },
                    { key: "stopping", tab: "已停止" },
                ]}
                title="进程管理"
                extra={
                    <Button type="primary" onClick={() => setShowCreateModal({ open: true })}>
                        添加进程
                    </Button>
                }
                onTabChange={(e) => setTypeFilter(e)}
            >
                <Table size="small" loading={!data && props.loading} dataSource={data} columns={columns} />;
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
