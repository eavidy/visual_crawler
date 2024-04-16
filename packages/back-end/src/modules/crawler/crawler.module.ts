import { Module, SetMetadata } from "@nestjs/common";
import { MODULE_PATH } from "@nestjs/common/constants.js";
import { CrawlerController } from "./crawler.controller.js";
import { CrawlProcessController } from "./crawl_process.controller.js";
import { CrawlProcessService, CrawlerService } from "./services/index.js";

@SetMetadata(MODULE_PATH, "api/crawl")
@Module({
  providers: [CrawlProcessService, CrawlerService],
  controllers: [CrawlerController, CrawlProcessController],
})
export class CrawlerModule {
  constructor() {}
}
