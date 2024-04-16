import { Module, SetMetadata } from "@nestjs/common";
import { TaskQueueController } from "./task_queue.controller.js";
import { TaskQueueDbService } from "../../services/db/task_queue.db.service.js";
import { MODULE_PATH } from "@nestjs/common/constants.js";

@SetMetadata(MODULE_PATH, "api")
@Module({
  controllers: [TaskQueueController],
  providers: [TaskQueueDbService],
})
export class AdminModule {
  constructor() {}
}
