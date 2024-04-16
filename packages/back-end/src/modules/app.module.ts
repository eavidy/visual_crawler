import { Module, UseFilters } from "@nestjs/common";
import { AdminModule } from "./admin/admin.module.js";
import { DashModule } from "./dash/dash.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { CrawlerModule } from "./crawler/crawler.module.js";

@UseFilters()
@Module({
  imports: [DashModule, AdminModule, AuthModule, CrawlerModule],
  controllers: [],
})
export class AppModule {
  constructor() {}
}
