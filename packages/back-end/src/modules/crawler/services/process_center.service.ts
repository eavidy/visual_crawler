import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CrawlProcess } from "./crawl_process";
import { ApiReq, ApiRes, CreateCrawlProcessOptions } from "common/request/crawler/crawl_process";
import { CrawlerProcessStatus } from "common/request/enum";
import * as Path from "node:path";

// const crawlModPath = Path.resolve(process.cwd(), "crawler/main.js");
const crawlModPath = Path.resolve(process.cwd(), "packages/crawlers/src/main.ts");
const startArgs = ["-r", "A:/back-end/pnpm/5/node_modules/@asnowc/node-tool/ts_hook"];

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
        let crawlPcs = this.map.get(id);
        if (!crawlPcs) throw new BadRequestException("id不存在");
        crawlPcs.kill();
    }
    startChildProcess(id: number) {
        let crawlPcs = this.map.get(id);
        if (!crawlPcs) throw new BadRequestException("id不存在");
        if (crawlPcs.status !== CrawlerProcessStatus.stop) throw new BadRequestException("当前状态不能启动运行");
        try {
            return crawlPcs.start(startArgs);
        } catch (error) {
            throw new InternalServerErrorException("启动失败");
        }
    }
    async deleteChildProcess(id: number) {
        let crawler = this.map.get(id);
        if (!crawler) throw new BadRequestException("不存在该ID");
        if (crawler.status === CrawlerProcessStatus.stop) {
            this.map.delete(id);
            return;
        } else crawler.kill();

        await new Promise(function (resolve, reject) {
            crawler!.on("exit", resolve);
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
                let memoryUsed = crawler.memory?.heapUsed ?? 0;

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
        let crawlPcs = this.map.get(id);
        if (!crawlPcs) throw new BadRequestException("id不存在");
        Object.assign(crawlPcs.info, info);
    }
}
