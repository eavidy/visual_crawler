import { Module, SetMetadata } from "@nestjs/common";
import { MODULE_PATH } from "@nestjs/common/constants";
import { CrawlerController } from "./crawler.controller";
import { CrawlProcessController } from "./crawl_process.controller";
import { CrawlProcessService, CrawlerService } from "./services";

@SetMetadata(MODULE_PATH, "api/crawl")
@Module({
    providers: [CrawlProcessService, CrawlerService],
    controllers: [CrawlerController, CrawlProcessController],
})
export class CrawlerModule {
    constructor() {}
}
