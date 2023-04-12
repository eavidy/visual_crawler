import { $http } from "@/http";
import { ApiReq, ApiRes, CrawlerMeta, CrawlerInfo as RawCrawlerInfo } from "common/request/crawler/crawler";
import { CrawlerProcessStatus, CrawlerStatus } from "common/request/enum";
export interface CrawlerInfo extends RawCrawlerInfo {
    companyRepetitionRate: number;
    jobRepetitionRate: number;
    taskPercent: number;
}
export interface GetCrawlerInfo {
    processName: string;
    processStatus: CrawlerProcessStatus;
    crawlerList: CrawlerInfo[];
}
class CrawlerResource {
    async getCrawlerList(processId: number): Promise<GetCrawlerInfo> {
        const { data } = await $http.get<{ item: ApiRes.GetCrawlerInfo }>("/api/crawl/crawler/" + processId);
        let list = data.item.crawlerList;
        for (const item of list as CrawlerInfo[]) {
            if (item.status === CrawlerStatus.working || item.status === CrawlerStatus.stopping) {
                item.startWorkDate = new Date(item.startWorkDate!);
            }
            let statistics = item.statistics;

            let jobTotal = statistics.newJob + statistics.jobRepeated;
            let companyTotal = statistics.newCompany + statistics.companyRepeated;
            item.companyRepetitionRate = companyTotal
                ? Math.round((statistics.companyRepeated / companyTotal) * 10000) / 100
                : 0;
            item.jobRepetitionRate = jobTotal ? Math.round((statistics.jobRepeated / jobTotal) * 10000) / 100 : 0;

            let schedule = item.schedule;
            item.taskPercent = schedule.total ? Math.round((schedule.current / schedule.total) * 10000) / 100 : 0;
        }
        return data.item as GetCrawlerInfo;
    }
    async createCrawler(processId: number, data: ApiReq.CreateCrawler) {
        return $http.put("/api/crawl/crawler/" + processId, data);
    }
    async updateCrawler(meta: CrawlerMeta, data: ApiReq.UpdateCrawler["data"]) {
        return $http.post("/api/crawl/crawler", { data, ...meta });
    }
    async deleteCrawler(meta: CrawlerMeta) {
        return $http.delete("/api/crawl/crawler", { params: meta });
    }
}

export const crawlerResource = new CrawlerResource();
