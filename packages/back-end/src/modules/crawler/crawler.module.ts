import { Module, SetMetadata, UseGuards } from "@nestjs/common";
import { MODULE_PATH } from "@nestjs/common/constants";
import { CrawlerController } from "./crawler.controller";
import { CrawlProcessController } from "./crawl_process.controller";
import { CrawlProcessService } from "./services/process_center.service";
import { AuthGuard } from "../auth/grand";

@UseGuards(AuthGuard)
@SetMetadata(MODULE_PATH, "api/crawl")
@Module({
    providers: [CrawlProcessService],
    controllers: [CrawlerController, CrawlProcessController],
})
export class CrawlerModule {
    constructor() {}
}
