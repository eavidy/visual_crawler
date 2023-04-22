import { checkFx, checkType, optional } from "@asnc/tslib/std";
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    ParseIntPipe,
    PipeTransform,
    Post,
    Query,
    UseGuards,
    UsePipes,
} from "@nestjs/common";
import { SiteTag } from "common/model";
import { GetTasksFilter, TaskQueueDbService } from "../../services/db/task_queue.db.service";
import { authGuard } from "../auth/grand";

const getTaskListPipe: PipeTransform = {
    transform(value, metadata) {
        if (metadata.type === "query") {
            const checkType: Record<string, any> = {
                status: parseInt,
            };
            if (!metadata.data) {
                for (const [key, val] of Object.entries(value)) {
                    let fx = checkType[key];
                    if (fx) value[key] = fx(val);
                }
            } else {
                let fx = checkType[metadata.data ?? ""];
                if (fx) return fx(value);
            }
        }
        return value;
    },
};

@UseGuards(authGuard)
@Controller("task_queue")
export class TaskQueueController {
    constructor(private taskQueueDbService: TaskQueueDbService) {}
    @Get("list")
    @UsePipes(getTaskListPipe)
    async getTaskList(
        @Query("start", ParseIntPipe) start = 0,
        @Query("pageSize", ParseIntPipe) pageSize = 20,
        @Query()
        query: GetTasksFilter
    ) {
        return await this.taskQueueDbService.getTasks(query, pageSize, start * pageSize);
    }

    @Delete()
    async deleteTask(@Query("idList") id: string[] | string) {
        let idList = Array.isArray(id) ? id : [id];
        return this.taskQueueDbService.deleteTasks(idList);
    }

    @Post("addCompanyTask")
    async addCompaniesToQueue(@Body() body: { idList?: string[]; siteTag: SiteTag }) {
        let res = checkType(body, { idList: optional(checkFx.arrayType("string")), siteTag: "number" });
        if (res) throw new BadRequestException({ message: "字段校验不通过", cause: res });
        return this.taskQueueDbService.appendCompanyTaskFromCompanyCollection(body.siteTag, body.idList);
    }

    @Post("addJobFilterTask")
    async addCitiesToQueue(@Body() body: { cityIdList?: number[]; siteTag: SiteTag }) {
        let res = checkType(body, { idList: optional(checkFx.arrayType("number")), siteTag: "number" });
        if (res) throw new BadRequestException({ message: "字段校验不通过", cause: res });
        return this.taskQueueDbService.appendCitesTasksFromCitesCollection(body.siteTag);
    }
    @Post("clear")
    async clearTask() {
        return this.taskQueueDbService.clearTasks();
    }
}
