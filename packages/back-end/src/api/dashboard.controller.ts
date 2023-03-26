import { ArgumentMetadata, BadRequestException, Controller, Get, PipeTransform, Query, UsePipes } from "@nestjs/common";
import type { ApiReq, ApiRes } from "api/request/dashboard";
import { WorkExp } from "api/request/enum";
import { DashService } from "./services";

const validationPipe: PipeTransform = {
    transform(value: any, metadata: ArgumentMetadata) {
        let ct = function (val: any) {
            return val;
        };

        let yv: Record<string, (val: string) => any> = {
            cityId: parseInt,
            jobName: ct,
            jobType: ct,
            companyIndustry: ct,
            startTime: parseInt,
            endTime: parseInt,
            education: parseInt,
            workExp: (val) => WorkExp[(WorkExp as any)[val]],
        };
        let res: any = {};
        for (const [key, val] of Object.entries(value)) {
            let fx = yv[key];
            if (!fx) continue;
            try {
                res[key] = fx(val as any);
            } catch (error) {
                throw new BadRequestException("字段校验不通过: " + key, (error as Error).message);
            }
        }

        return res;
    },
};

@Controller("dashboard")
export class DashboardCtrl {
    constructor(private dashService: DashService) {}

    @Get("analysis_city")
    @UsePipes(validationPipe)
    async getAnalysisCity(@Query() query: ApiReq.MatchFilter): Promise<ApiRes.AnalysisByCity> {
        return this.dashService.getAnalysisByCity(query);
    }
    @Get("analysis_job")
    @UsePipes(validationPipe)
    async getAnalysisJob(@Query() query: ApiReq.MatchFilter): Promise<ApiRes.AnalysisByJob> {
        return this.dashService.getAnalysisByJob(query);
    }
    @Get("global_billboard")
    async getGlobalBillboard(): Promise<ApiRes.GlobalBillboard> {
        return this.dashService.getGlobalBillboard();
    }
    @Get("dq_options")
    deOptions() {
        return this.dashService.cityOption;
    }
}
