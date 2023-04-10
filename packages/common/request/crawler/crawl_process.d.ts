import { TaskType } from "../../model";
import { CrawlerProcessStatus } from "../enum";

export namespace ApiReq {
    interface DeleteCrawlProcess {}
    interface GetCrawlProcess {}

    interface UpdateProcess {
        name?: string;
        startOrStop?: "start" | "stop";
    }
    interface CreateProcess {
        memoryLimit?: number;
        name?: string;
    }
}
interface ProcessInfoBase {
    key: number;
    name: string;
    memoryTotal: number;
    status: CrawlerProcessStatus;
    errors: { time: Date; error: Error }[];
    pid?: number;
}

export interface CreateCrawlProcessOptions {
    name?: string;
    memoryLimit?: number;
}
export interface CreateCrawlerOptions {
    taskType?: TaskType;
}
export namespace ApiRes {
    interface RunningProcessInfo extends ProcessInfoBase {
        memoryUsage: number;

        startRunTime: Date;
        status: CrawlerProcessStatus.running | CrawlerProcessStatus.stopping | CrawlerProcessStatus.starting;
    }
    interface StoppingProcessInfo extends ProcessInfoBase {
        startRunTime?: Date;
        lastEndTime?: Date;
        status: CrawlerProcessStatus.stop;
    }
    type ProcessInfo = RunningProcessInfo | StoppingProcessInfo;
    type GetProcessList = ProcessInfo[];
}
