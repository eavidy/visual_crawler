import { $http } from "@/http/index.ts";
import type { ApiReq, ApiRes } from "common/request/crawler/crawl_process.d.ts";

class CrawlerResource {
  async getProcessList(): Promise<ApiRes.GetProcessList> {
    const { data } = await $http.get<{ items: ApiRes.GetProcessList }>("/api/crawl/process");
    for (const item of data.items) {
      if (item.startRunTime) item.startRunTime = new Date(item.startRunTime);
      for (const err of item.errors) {
        err.time = new Date(err.time);
      }
    }
    return data.items;
  }
  async createProcess(data: ApiReq.CreateProcess) {
    return $http.post("/api/crawl/process", data);
  }
  async updateProcess(id: number, data: ApiReq.UpdateProcess) {
    return $http.put("/api/crawl/process/" + id, data);
  }
  async deleteProcess(id: number) {
    return $http.delete("/api/crawl/process/" + id);
  }
}

export const processResource = new CrawlerResource();
