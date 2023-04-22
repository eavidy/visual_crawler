import { Module, SetMetadata } from "@nestjs/common";
import { TaskQueueController } from "./task_queue.controller";
import { TaskQueueDbService } from "../../services/db/task_queue.db.service";
import { MODULE_PATH } from "@nestjs/common/constants";

@SetMetadata(MODULE_PATH, "api")
@Module({
    controllers: [TaskQueueController],
    providers: [TaskQueueDbService],
})
export class AdminModule {
    constructor() {}
}
