import { Controller, Get, Query } from "@nestjs/common";

@Controller("job")
class JobController {
    constructor() {}
    @Get("search_job_name")
    searchJobName(@Query() query: { name: string }) {}
}
