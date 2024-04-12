import { TaskState } from "vitest";
import { SiteTag, TaskType } from "../../model";

export namespace ApiReq {
  interface GetTaskQueueList {
    type?: TaskType;
    status?: TaskState;
    start?: number;
    pageSize?: number;
  }

  interface AddCompaniesToQueue {
    siteTag: SiteTag;
    companyIdList?: string[];
  }
  interface AddCitiesToQueue {
    siteTag: SiteTag;
    emitTime?: number;
    cityIdList?: number[];
  }
}

export namespace ApiRes {
  interface GetTaskQueueList {
    _id: string;
    /** 任务类型 */
    type: TaskType;
    siteTag: SiteTag;
    status: TaskState;
    name: string;
    /** 优先级, 越小越优先 */
    priority?: number;
    taskInfo?: any;
  }
}
