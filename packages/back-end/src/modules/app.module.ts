import { Module } from "@nestjs/common";
import { DashModule } from "./dash/dash.module";
import { ViewModule } from "./view/view.module";
import { AuthModule } from "./auth/auth.module";
import { CrawlerModule } from "./crawler/crawler.module";

@Module({
    imports: [DashModule, ViewModule, AuthModule, CrawlerModule],
    controllers: [],
    providers: [],
})
export class AppModule {
    constructor() {}
}
