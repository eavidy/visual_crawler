import { ArgumentMetadata, BadRequestException, Controller, Get, PipeTransform, Query, UsePipes } from "@nestjs/common";
import type { ApiRes } from "common/request/dashboard.js";
import { WorkExp } from "common/request/enum.js";
import { MatchFilter } from "../../services/db/job_analysis.db.service.js";
import { DashService } from "./dash.service.js";

const validationPipe: PipeTransform = {
  transform(value: any, metadata: ArgumentMetadata) {
    let ct = function (val: any) {
      return val;
    };
    function paseDate(timeStrap: string) {
      return new Date(parseInt(timeStrap));
    }

    let yv: Record<string, (val: string) => any> = {
      cityId: parseInt,
      jobName: ct,
      jobType: ct,
      companyIndustry: ct,
      startTime: paseDate,
      endTime: paseDate,
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
  async getAnalysisCity(@Query() query: MatchFilter): Promise<ApiRes.AnalysisByCity> {
    let items = await this.dashService.getDataByCity(query);
    return { items };
  }
  @Get("analysis_job")
  @UsePipes(validationPipe)
  async getAnalysisJob(@Query() query: MatchFilter): Promise<ApiRes.AnalysisByJob> {
    let items = await this.dashService.getDataByJobName(query);
    return { items };
  }
  @Get("data_by_education")
  @UsePipes(validationPipe)
  async getDataByEducation(@Query() query: MatchFilter) {
    let items = await this.dashService.getDataByEducation(query);

    return { items };
  }
  @Get("data_by_exp")
  @UsePipes(validationPipe)
  async getDataByWorkExp(@Query() query: MatchFilter) {
    let items = await this.dashService.getDataByWorkExp(query);

    return { items };
  }
  @Get("data_by_time")
  @UsePipes(validationPipe)
  async getDataByTime(@Query() query: MatchFilter) {
    let items = await this.dashService.getDataByTime(query);

    return { items };
  }

  @Get("job_billboard")
  @UsePipes(validationPipe)
  async getJobBillboard(@Query() query: MatchFilter): Promise<ApiRes.JobBillboard> {
    return this.dashService.getJobBillboard(query);
  }

  @Get("dq_options")
  deOptions() {
    return this.dashService.cityOption;
  }
}
