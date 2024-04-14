import { ProCard, StatisticCard } from "@ant-design/pro-components";
import React, { useMemo } from "react";
import { CaretRightOutlined, DeleteOutlined, LoadingOutlined, StopOutlined } from "@ant-design/icons";
import { Space, Tooltip, Statistic, Progress } from "antd";
import { COLOR } from "@/styles/colors.ts";
import { CrawlerInfo } from "../services/crawler.resource.ts";
import { CrawlerStatus } from "common/request/enum.ts";

export function CrawlerCard(
  props: CrawlerInfo & { onStart: (id: number) => void; onDelete: (id: number) => void; onStop: (id: number) => void }
) {
  const { config, errors = [], statistics, status, id, companyRepetitionRate, jobRepetitionRate } = props;

  const actionIcon = useMemo(() => {
    if (status === CrawlerStatus.stopped)
      return (
        <Tooltip title="启动">
          <CaretRightOutlined onClick={() => props.onStart(id)} style={{ cursor: "pointer" }} />
        </Tooltip>
      );
    else if (status === CrawlerStatus.working)
      return (
        <Tooltip title="终止运行">
          <StopOutlined onClick={() => props.onStop(id)} style={{ cursor: "pointer" }} />
        </Tooltip>
      );
    else return <LoadingOutlined />;
  }, [status]);
  const taskInfo = useMemo(() => {
    if (!props.currentTask) return undefined;
    return JSON.stringify(props.currentTask, null, 4);
  }, [props.currentTask]);

  const subTitle = useMemo(() => {
    let subTitle = config.taskType ?? "";
    if (config.taskCountLimit) subTitle += " limit:" + config.taskCountLimit;
    if (props.startWorkDate) subTitle += " " + props.startWorkDate.toLocaleDateString();

    return subTitle;
  }, [config, props.startWorkDate]);
  return (
    <ProCard
      style={{ cursor: "default", minWidth: "350px", flex: 1 }}
      split="horizontal"
      hoverable
      title={
        <Tooltip title={taskInfo}>
          <Space>
            <CrawlerStatusSpot status={status} error={props.reportAuth} />
            <a>{config.name}</a>
          </Space>
        </Tooltip>
      }
      subTitle={subTitle}
      extra={
        <Space>
          {actionIcon}
          <Tooltip title="删除">
            <DeleteOutlined onClick={() => props.onDelete(id)} style={{ cursor: "pointer" }} />
          </Tooltip>
        </Space>
      }
    >
      <div style={{ margin: "0 24px" }}>
        <Progress percent={props.taskPercent} size="small" strokeColor={COLOR.main1} />
      </div>
      <ProCard split="vertical">
        <StatisticCard
          statistic={{
            title: "新增职位",
            value: statistics?.newJob,
            valueStyle: { color: COLOR.main1 },
            description: (
              <Space>
                <Statistic title="重复数量" value={statistics.jobRepeated} />
                <Statistic title="重复率" suffix="%" value={jobRepetitionRate} />
              </Space>
            ),
          }}
        />
        <StatisticCard
          statistic={{
            title: "新增公司",
            valueStyle: { color: COLOR.main1 },
            value: statistics.newCompany,
            description: (
              <Space>
                <Statistic title="重复数量" value={statistics.companyRepeated} />
                <Statistic title="重复率" suffix="%" value={companyRepetitionRate} />
              </Space>
            ),
          }}
        />
      </ProCard>
      <ProCard style={{ width: "100%" }}>
        <flex style={{ justifyContent: "space-between" }}>
          <div>
            任务执行数(成功/失败)：
            <b>{(statistics.taskCompleted ?? 0) + "/" + (statistics.taskFailed ?? 0)}</b>
          </div>
          <div>
            异常数量：<b>{errors.length}</b>
          </div>
        </flex>
      </ProCard>
    </ProCard>
  );
}

let colorMap = {
  [CrawlerStatus.starting]: "#BFBFBF",
  [CrawlerStatus.stopped]: "#BFBFBF",
  [CrawlerStatus.working]: "#52C41A",
  [CrawlerStatus.stopping]: "#52C41A",
};
function CrawlerStatusSpot(props: { size?: number; status: CrawlerStatus; error?: boolean }) {
  const { size = 6, status, error } = props;

  return (
    <div
      style={{
        borderRadius: "50%",
        width: size,
        height: size,
        backgroundColor: error ? "#FF4D4F" : colorMap[status],
      }}
    />
  );
}
