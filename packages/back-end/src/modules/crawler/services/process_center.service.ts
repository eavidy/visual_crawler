import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CrawlProcess } from "./crawl_process.js";
import { ApiRes, CreateCrawlProcessOptions } from "common/request/crawler/crawl_process.js";
import { CrawlerProcessStatus } from "common/request/enum.js";
import * as Path from "node:path";

let crawlModPath = Path.resolve(process.cwd(), "crawler/main.js");
let startArgs: string[] = [];
let nodeArgs: string[] = [];
if (process.env["MODE"] === "dev") {
    crawlModPath = Path.resolve(process.cwd(), "packages/crawlers/src/main.ts");
    startArgs = ["--nh"];
    nodeArgs = ["--loader", "/A:/packages/asnc-pack/ts_hook/hook.mjs"];
}

@Injectable()
export class CrawlProcessService {
    private map = new Map<number, CrawlProcess>();
    private i = 1;
    constructor() {
        setInterval(this.tickMemory, 10 * 1000);
    }
    tickMemory = () => {
        for (const [_, crawler] of this.map) {
            if (crawler.status === CrawlerProcessStatus.running) {
                crawler.getMemoryUsage();
            }
        }
    };
    createByNet() {}
    createByChildProcess(options: CreateCrawlProcessOptions = {}) {
        const id = this.i++;
        if (!options.name) options.name = id.toString();
        this.map.set(id, new CrawlProcess(crawlModPath, options));
        return id;
    }
    stopChildProcess(id: number) {
        this.getProcess(id).kill();
    }
    startChildProcess(id: number) {
        let crawlPcs = this.getProcess(id);
        if (crawlPcs.status !== CrawlerProcessStatus.stop) throw new BadRequestException("当前状态不能启动运行");

        try {
            return crawlPcs.start(startArgs, nodeArgs);
        } catch (error) {
            throw new InternalServerErrorException("启动失败");
        }
    }
    async deleteChildProcess(id: number) {
        let process = this.getProcess(id);
        if (process.status === CrawlerProcessStatus.stop) {
            this.map.delete(id);
            return;
        } else process.kill();

        await new Promise(function (resolve, reject) {
            process!.on("exit", resolve);
        });
        this.map.delete(id);
    }
    getProcessInfo(id: number) {}
    getAllProcessInfo(): ApiRes.GetProcessList {
        let list: ApiRes.GetProcessList = [];
        for (const [id, crawler] of this.map) {
            let status = crawler.status;
            if (status === CrawlerProcessStatus.stop) {
                list.push({
                    key: id,
                    memoryTotal: crawler.info.memoryLimit,
                    name: crawler.info.name,
                    status,
                    errors: crawler.info.errors,
                });
            } else {
                let memoryUsed = crawler.memory?.rss ?? 0;

                list.push({
                    key: id,
                    memoryTotal: crawler.info.memoryLimit,
                    name: crawler.info.name,
                    status,
                    pid: crawler.pid,
                    memoryUsage: Math.round((memoryUsed / 1024 / 1024) * 100) / 100,
                    startRunTime: crawler.info.startRunTime as any,
                    errors: crawler.info.errors,
                });
            }
        }

        return list;
    }
    updateProcessInfo(id: number, info: { name?: string }) {
        let crawlPcs = this.getProcess(id);
        Object.assign(crawlPcs.info, info);
    }
    getProcess(id: number) {
        let process = this.map.get(id);
        if (!process) throw new BadRequestException("id不存在");
        return process;
    }
}
