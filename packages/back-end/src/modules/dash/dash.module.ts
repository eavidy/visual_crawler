import { Module, SetMetadata } from "@nestjs/common";
import { MODULE_PATH } from "@nestjs/common/constants.js";
import { DashboardCtrl } from "./dashboard.controller.js";
import { DashService } from "./dash.service.js";
import { JobAnalysisDbService } from "../../services/db/job_analysis.db.service.js";
import { JobSearchDbService } from "../../services/db/job_search.db.service.js";
import { JobController } from "./job.controller.js";

@SetMetadata(MODULE_PATH, "api")
@Module({
  controllers: [DashboardCtrl, JobController],
  providers: [JobAnalysisDbService, JobSearchDbService, DashService],
})
export class DashModule {
  constructor() {}
}
