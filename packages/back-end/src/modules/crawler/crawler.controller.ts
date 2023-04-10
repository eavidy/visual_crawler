import { Body, Controller, Delete, Get, Patch, Post, Put } from "@nestjs/common";
import { ApiReq, ApiRes } from "common/request/crawler/crawl_process";
import { CrawlProcessService } from "./services/process_center.service";

@Controller("crawler")
export class CrawlerController {
    constructor(private crawlProcessService: CrawlProcessService) {}
    @Post()
    createCrawler(@Body() body: ApiReq.CreateCrawlProcess) {}

    @Delete()
    deleteCrawler() {}

    @Get()
    getCrawler() {}

    @Put()
    updateCrawler() {}
}
