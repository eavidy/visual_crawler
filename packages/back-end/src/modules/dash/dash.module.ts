import { Module, SetMetadata } from "@nestjs/common";
import { MODULE_PATH } from "@nestjs/common/constants";
import { DashboardCtrl } from "./dashboard.controller";
import { DashService } from "./dash.service";
import { JobAnalysisDbService } from "../../services/db/job_analysis.db.service";
import { JobSearchDbService } from "../../services/db/job_search.db.service";
import { JobController } from "./job.controller";

@SetMetadata(MODULE_PATH, "api")
@Module({
    controllers: [DashboardCtrl, JobController],
    providers: [JobAnalysisDbService, JobSearchDbService, DashService],
})
export class DashModule {
    constructor() {}
}
