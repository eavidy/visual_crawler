import { PageContainer, Statistic, StatisticCard, StatisticProps } from "@ant-design/pro-components";
import React, { useMemo, useState } from "react";
import styled from "@emotion/styled";
import { EllipsisOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Card, Space } from "antd";
import { CardTabListType } from "antd/es/card";
import { COLOR } from "@/styles/colors";

const items: StatisticProps[] = [
    {
        title: "全部",
        value: 10,
        style: {
            borderInlineEnd: "1px solid #f0f0f0",
            paddingRight: 12,
        },
    },
    { status: "default", title: "未运行", value: 5 },
    { status: "error", title: "异常停止", value: 1 },
    { status: "success", title: "运行中", value: 1 },
];

export default function CrawlerList(props: { id: number; name: string }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const tabs = useMemo(
        () =>
            items.map((item): CardTabListType => {
                return {
                    key: item.status ?? "all",
                    tab: (
                        <CssStatistic
                            {...item}
                            layout="horizontal"
                            style={{
                                lineHeight: "30px",
                                width: 100,
                                ...item.style,
                            }}
                        />
                    ),
                };
            }),
        [items]
    );
    return (
        <PageContainer>
            <Card
                hoverable
                tabList={tabs}
                bodyStyle={{}}
                headStyle={{ fontWeight: "bold", fontSize: "24px" }}
                title="采集器进程管理"
                extra={
                    <Button type="primary" onClick={() => setShowCreateModal(true)}>
                        添加crawler
                    </Button>
                }
            >
                <flex style={{ background: COLOR.gray2, padding: "14px" }}>
                    <CrawlerCard></CrawlerCard>
                </flex>
            </Card>
        </PageContainer>
    );
}

function CrawlerCard() {
    return (
        <StatisticCard
            title={
                <Space>
                    <span>部门一</span>
                    <RightOutlined style={{ color: "rgba(0,0,0,0.65)" }} />
                </Space>
            }
            extra={<EllipsisOutlined />}
            statistic={{
                value: 1102893,
                prefix: "¥",
                description: (
                    <Space>
                        <Statistic title="实际完成度" value="82.3%" />
                        <Statistic title="当前目标" value="¥6000" />
                    </Space>
                ),
            }}
            style={{ width: 268 }}
        />
    );
}

const CssStatistic = styled(Statistic)`
    .ant-statistic,
    .ant-pro-card-statistic-wrapper {
        align-items: center;
    }
`;
