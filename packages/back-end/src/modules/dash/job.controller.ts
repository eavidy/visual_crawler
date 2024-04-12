import { Controller, Get, Query } from "@nestjs/common";
import { JobSearchDbService } from "../../services/db/job_search.db.service.js";

@Controller("job")
export class JobController {
  constructor(private jobSearchDbService: JobSearchDbService) {}
  @Get("search_job_name")
  async searchJobName(@Query() query: { name: string }) {
    if (!query.name) return { items: [] };
    const items = await await this.jobSearchDbService.searchJobName(
      query.name,
      10,
    );
    return { items };
  }
}
