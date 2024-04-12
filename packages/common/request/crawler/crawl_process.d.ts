import { CrawlerProcessStatus } from "../enum.js";

export namespace ApiReq {
    interface DeleteCrawlProcess {}
    interface GetCrawlProcess {}

    interface UpdateProcess {
        name?: string;
        startOrStop?: "start" | "stop";
    }
    type CreateProcess = CreateCrawlProcessOptions;
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
