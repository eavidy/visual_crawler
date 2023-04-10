import { PageContainer } from "@ant-design/pro-components";
import React, { useState } from "react";
import { LeftOutlined } from "@ant-design/icons";
import { CrawlerList } from "./components/crawler-list";
import { ProcessList } from "./components/process-list";
import { useRequest } from "ahooks";
import { crawlerResource } from "./services/crawler.resource";

export default function CrawlerControllerCenter() {
    const [processInfo, setProcessInfo] = useState<{ id: number; name: string }>();

    const { data, loading } = useRequest(crawlerResource.getProcessList, { pollingInterval: 2000 });

    function onDetail(id: number, name: string) {
        setProcessInfo({ id, name });
    }
    return (
        <PageContainer
            onBack={() => setProcessInfo(undefined)}
            backIcon={<LeftOutlined />}
            title={processInfo ? processInfo.name : undefined}
        >
            {processInfo !== undefined ? (
                <CrawlerList {...processInfo} />
            ) : (
                <ProcessList data={data} loading={loading} onDetail={onDetail} />
            )}
        </PageContainer>
    );
}
