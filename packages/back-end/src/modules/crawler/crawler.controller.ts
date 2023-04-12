import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    PipeTransform,
    Post,
    Put,
    Query,
    UsePipes,
} from "@nestjs/common";
import type { ApiReq, ApiRes, CrawlerMeta } from "common/request/crawler/crawler";
import { CrawlerService } from "./services";
import { checkType, optional } from "@asnc/tslib/lib/std";

const createCrawlerCheck: PipeTransform = {
    transform(value: ApiReq.CreateCrawler, metadata) {
        if (metadata.type === "body") {
            let res = checkType(value, {
                taskType: optional.string,
                taskCountLimit: optional.number,
                name: optional.string,
            });
            if (res) throw new BadRequestException({ message: "字段校验不通过", cause: res });
        }
        return value;
    },
};

@Controller("crawler")
export class CrawlerController {
    constructor(private crawlerService: CrawlerService) {}

    @UsePipes(createCrawlerCheck)
    @Put(":processId")
    createCrawler(@Param("processId", ParseIntPipe) pcId: number, @Body() body: ApiReq.CreateCrawler) {
        return this.crawlerService.createCrawler(pcId, body);
    }

    @Post()
    updateCrawler(@Body() body: ApiReq.UpdateCrawler) {
        const { crawlerId, processId, data } = body;
        return this.crawlerService.updateCrawler(processId, crawlerId, data);
    }

    @Delete()
    deleteCrawler(@Query("crawlerId", ParseIntPipe) crawlerId: number, @Query("processId", ParseIntPipe) pcId: number) {
        return this.crawlerService.deleteCrawler(pcId, crawlerId);
    }

    @Get(":processId")
    getCrawlerList(@Param("processId", ParseIntPipe) pcId: number): { item: ApiRes.GetCrawlerInfo } {
        let item = this.crawlerService.getCrawlerList(pcId);
        return { item };
    }
}
