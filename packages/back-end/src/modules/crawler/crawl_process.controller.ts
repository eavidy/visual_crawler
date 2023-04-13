import {
    BadRequestException,
    InternalServerErrorException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    PipeTransform,
    Post,
    Put,
    UsePipes,
    UseGuards,
} from "@nestjs/common";
import { CrawlProcessService } from "./services/process_center.service";
import type { ApiReq } from "common/request/crawler/crawl_process";
import { checkFx, checkType, optional } from "@asnc/tslib/lib/std";
import { CrawlerProcessStatus } from "common/request/enum";
import { authGuard } from "../auth/grand";

const updateBodyPipes: PipeTransform = {
    transform(value: ApiReq.UpdateProcess, metadata) {
        if (metadata.type === "body") {
            CrawlerProcessStatus;
            let res = checkType(value, {
                name: optional.string,
                startOrStop: optional((v) =>
                    v === "start" || v === "stop" ? undefined : "只能是start或stop, 实际:" + v
                ),
            });
            if (res) throw new BadRequestException(res);
        }
        return value;
    },
};
const crateBodyPipes: PipeTransform = {
    transform(value: ApiReq.CreateProcess, metadata) {
        if (metadata.type === "body") {
            CrawlerProcessStatus;
            let res = checkType(value, {
                name: optional.string,
                memoryLimit: optional(checkFx.numScope(100, 1024)),
            });
            if (res) throw new BadRequestException({ message: "字段校验不通过", cause: res });
        }
        return value;
    },
};

@UseGuards(authGuard)
@Controller("process")
export class CrawlProcessController {
    constructor(private crawlProcessService: CrawlProcessService) {}
    @Get()
    getCrawlProcessList() {
        const list = this.crawlProcessService.getAllProcessInfo();
        return { items: list };
    }

    @UsePipes(crateBodyPipes)
    @Post()
    createCrawlProcess(@Body() body: ApiReq.CreateProcess) {
        return this.crawlProcessService.createByChildProcess(body);
    }
    @Delete(":id")
    deleteCrawlProcess(@Param("id", ParseIntPipe) id: number) {
        return this.crawlProcessService.deleteChildProcess(id);
    }

    @UsePipes(updateBodyPipes)
    @Put(":id")
    async updateCrawlProcess(@Param("id", ParseIntPipe) id: number, @Body() body: ApiReq.UpdateProcess) {
        const { startOrStop, ...data } = body;
        if (startOrStop == "stop") await this.crawlProcessService.stopChildProcess(id);
        else if (startOrStop === "start") {
            try {
                await this.crawlProcessService.startChildProcess(id);
            } catch (e) {
                let error = e as Error;
                throw new InternalServerErrorException(error.message);
            }
        }
        if (Object.keys(data)) this.crawlProcessService.updateProcessInfo(id, data);
    }
}
