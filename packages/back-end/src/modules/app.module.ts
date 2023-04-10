import { Module } from "@nestjs/common";
import { ApiModule } from "./api/api.module";
import { ViewModule } from "./view/view.module";
import { AuthModule } from "./auth/auth.module";
import { CrawlerModule } from "./crawler/crawler.module";

@Module({
    imports: [ApiModule, ViewModule, AuthModule, CrawlerModule],
    controllers: [],
    providers: [],
})
export class AppModule {
    constructor() {}
}
