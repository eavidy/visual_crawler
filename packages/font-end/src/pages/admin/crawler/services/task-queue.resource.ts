import { $http } from "@/http/index.ts";
import type { ApiReq, ApiRes } from "common/request/crawler/task_queue.d.ts";

export type TaskQueueList = Required<ApiRes.GetTaskQueueList> & {
  taskInfo: string;
  key: string;
};
export type GetTasksFilterOption = Pick<ApiReq.GetTaskQueueList, "status" | "type">;
class TaskQueueResource {
  async getTasks(
    pagination: { pageSize: number; start: number },
    filterOption?: GetTasksFilterOption
  ): Promise<{ items: TaskQueueList[]; total: number }> {
    const { data } = await $http.get<{
      items: ApiRes.GetTaskQueueList[];
      total: number;
    }>("/api/task_queue/list", {
      params: { ...pagination, ...filterOption },
    });
    for (const item of data.items) {
      const tsItem: TaskQueueList = item as any;
      if (tsItem.priority === undefined) tsItem.priority = 99;
      tsItem.taskInfo = item.taskInfo ? item.taskInfo.toString() : "";
      tsItem.key = item._id;
      Reflect.deleteProperty(item, "_id");
    }
    return data as any;
  }
  async deleteTasks(idList: string[]) {
    let isListStr = "idList=" + idList.join("&idList=");
    return $http.delete("/api/task_queue" + "?" + isListStr);
  }
  async clearTasks() {
    return $http.post("/api/task_queue/clear");
  }
  async addCompanyTask(data: ApiReq.AddCompaniesToQueue) {
    return $http.post("/api/task_queue/addCompanyTask", data);
  }
  async addJobFilterTask(data: ApiReq.AddCompaniesToQueue) {
    return $http.post("/api/task_queue/addJobFilterTask", data);
  }
}

export const taskQueueResource = new TaskQueueResource();
