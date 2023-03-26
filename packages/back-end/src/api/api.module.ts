import { Module, SetMetadata } from "@nestjs/common";
import { MODULE_PATH } from "@nestjs/common/constants";
import { DashboardCtrl } from "./dashboard.controller";
import { DashService } from "./services";
import { JobAnalysisDbService, JobSearchDbService } from "../services/db";

@SetMetadata(MODULE_PATH, "api")
@Module({
    controllers: [DashboardCtrl],
    providers: [JobAnalysisDbService, JobSearchDbService, DashService],
})
export class ApiModule {
    constructor() {}
}
