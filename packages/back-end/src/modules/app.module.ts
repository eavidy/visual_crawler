import { Module, UseFilters } from "@nestjs/common";
import { AdminModule } from "./admin/admin.module";
import { DashModule } from "./dash/dash.module";
import { ViewModule } from "./view/view.module";
import { AuthModule } from "./auth/auth.module";
import { CrawlerModule } from "./crawler/crawler.module";

@UseFilters()
@Module({
    imports: [DashModule, AdminModule, ViewModule, AuthModule, CrawlerModule],
    controllers: [],
})
export class AppModule {
    constructor() {}
}
