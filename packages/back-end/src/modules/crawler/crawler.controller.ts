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
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import type { ApiReq, ApiRes } from "common/request/crawler/crawler.js";
import { CrawlerService } from "./services/index.js";
import { authGuard } from "../auth/grand/index.js";
import { checkType, typeChecker } from "evlib";
const { optional } = typeChecker;

const createCrawlerCheck: PipeTransform = {
  transform(value: ApiReq.CreateCrawler, metadata) {
    if (metadata.type === "body") {
      let res = checkType(value, {
        taskType: optional.string,
        taskCountLimit: optional.number,
        name: optional.string,
        isAuto: optional("boolean"),
      }).error;
      if (res)
        throw new BadRequestException({
          message: "字段校验不通过",
          cause: res,
        });
    }
    return value;
  },
};

@UseGuards(authGuard)
@Controller("crawler")
export class CrawlerController {
  constructor(private crawlerService: CrawlerService) {}

  @UsePipes(createCrawlerCheck)
  @Put(":processId")
  createCrawler(
    @Param("processId", ParseIntPipe) pcId: number,
    @Body() body: ApiReq.CreateCrawler,
  ) {
    return this.crawlerService.createCrawler(pcId, body);
  }

  @Post()
  updateCrawler(@Body() body: ApiReq.UpdateCrawler) {
    const { crawlerId, processId, data } = body;
    return this.crawlerService.updateCrawler(processId, crawlerId, data);
  }

  @Delete()
  deleteCrawler(
    @Query("crawlerId", ParseIntPipe) crawlerId: number,
    @Query("processId", ParseIntPipe) pcId: number,
  ) {
    return this.crawlerService.deleteCrawler(pcId, crawlerId);
  }

  @Get(":processId")
  getCrawlerList(@Param("processId", ParseIntPipe) pcId: number): {
    item: ApiRes.GetCrawlerInfo;
  } {
    let item = this.crawlerService.getCrawlerList(pcId);
    return { item };
  }
}
