import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { CrawlProcessService } from "./process_center.service.js";
import type { ApiRes, CreateCrawlerOptions } from "common/request/crawler/crawler.js";

@Injectable()
export class CrawlerService {
  constructor(private crawlProcessService: CrawlProcessService) {}
  createCrawler(pcId: number, option: CreateCrawlerOptions) {
    let process = this.getProcess(pcId);
    return process.createCrawler(option);
  }
  getCrawlerList(pcId: number): ApiRes.GetCrawlerInfo {
    let process = this.getProcess(pcId);
    return {
      processName: process.info.name,
      crawlerList: process.getAllCrawlerInfo(),
      processStatus: process.status,
    };
  }
  deleteCrawler(pcId: number, crawlerId: number) {
    let process = this.getProcess(pcId);
    return process.removeCrawler(crawlerId);
  }
  updateCrawler(pcId: number, crawlerId: number, data: { start?: boolean; name?: string; taskCountLimit?: number }) {
    const { start, ...config } = data;
    let process = this.getProcess(pcId);
    if (!Object.keys(config).length) {
      process.updateCrawlerConfig(crawlerId, config);
    }
    if (start !== undefined) {
      try {
        start ? process.startWork(crawlerId) : process.stopWork(crawlerId, true);
      } catch (error) {
        throw new ConflictException();
      }
    }
  }

  private getProcess(pcId: number) {
    let process = this.crawlProcessService.getProcess(pcId);
    if (!process) throw new BadRequestException("进程id不存在");
    return process;
  }
}
