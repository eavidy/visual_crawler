import { Crawler, UnexecutedCompanyTask, UnexecutedJobTask } from "./crawler";
import { BrowserContext } from "playwright";
import { UnexecutedCrawlerTask } from "../../db";
import { LiePinCompanyDetail, LiePinJobList, PageNumControllable } from "../sites/liepin";
import { radomWaitTime } from "common/async/time";
import { SiteTag, TaskType } from "api/model";
import { DeepAssignFilter } from "../classes/crawl_action";

export class CrawlerLiepin extends Crawler {
    siteName = "猎聘";
    constructor(browserContext: BrowserContext) {
        super(SiteTag.liepin);
        const origin = "https://www.liepin.com";
        this.companyTask = new LiePinCompanyDetail(browserContext, origin);
        this.jobTask = new LiePinJobList(browserContext, origin);

        this.companyTask.on("data", this.onData);
        this.companyTask.on("error", this.onError);
        this.companyTask.on("auth", this.reportAuth.bind(this));
        this.jobTask.on("data", this.onData);
        this.jobTask.on("error", this.onError);
        this.jobTask.on("auth", this.reportAuth.bind(this));
    }
    private onData = ({ jobList, compList }: { jobList: any[]; compList?: any[] }) => {
        if (compList) this.saveCompanies(compList);
        if (jobList) this.saveJobs(jobList);
    };
    private onError = (err: any) => {
        this.reportError("页面控制器触发异常", err);
    };

    private companyTask: LiePinCompanyDetail;
    private jobTask: LiePinJobList;
    async executeTask(task: UnexecutedCrawlerTask, signal?: AbortSignal) {
        if (task.type === TaskType.company) return this.excCompanyTask(task as UnexecutedCompanyTask, signal);
        else if (task.type === TaskType.jobFilter) return this.excJobTask(task as UnexecutedJobTask, signal);
        return false;
    }
    randomTime() {
        return radomWaitTime(2 * 1000, 6 * 1000);
    }
    private async excCompanyTask(task: UnexecutedCompanyTask, signal?: AbortSignal) {
        let ctrl = await this.companyTask.open({ companyId: task.taskInfo });

        let breakSignal = false;
        let abortActon = () => (breakSignal = true);
        signal?.addEventListener("abort", abortActon);

        let errors: any[] = [];

        for await (const res of ctrl.pageNumIterator(errors)) {
            if (breakSignal) break;
            await radomWaitTime(2, 4);
            if (breakSignal) break;
            await this.traversePageNum(ctrl, signal);
        }
        signal?.removeEventListener("abort", abortActon);
        if (errors.length) this.reportError("公司页面翻页出错", errors);
        await ctrl.close();
        return !breakSignal;
    }
    private async excJobTask(task: UnexecutedJobTask, signal?: AbortSignal) {
        let ctrl = await this.jobTask.open(task.taskInfo.fixedFilter);
        let filter = new DeepAssignFilter(ctrl.iterationSequence);
        let filterGenerator = filter.assign();

        let breakSignal = false;
        let abortActon = () => (breakSignal = true);
        signal?.addEventListener("abort", abortActon);

        let filterGeneratorErrors: number[][] = [];
        let traversePageNumErrors: any[][] = [];
        do {
            if (breakSignal) break;
            let randomTime = this.randomTime();

            let { done, value } = await filterGenerator.next(!(await ctrl.isFullList()));
            if (done) break;
            while (!value && !breakSignal) {
                filterGeneratorErrors.push(filter.assignRes);
                let res = await filterGenerator.next();
                value = res.value;
                done = res.done;
                if (done) break;
            }
            if (breakSignal) break;
            await randomTime;
            let errors = await this.traversePageNum(ctrl, signal);
            if (errors) traversePageNumErrors.push(errors);
        } while (true);
        if (filterGeneratorErrors.length) this.reportError("迭代过滤选项失败", filterGeneratorErrors);
        if (traversePageNumErrors.length) this.reportError("职位翻页出错", traversePageNumErrors);
        signal?.removeEventListener("abort", abortActon);
        await ctrl.close();
        return !breakSignal;
    }

    //翻页
    async traversePageNum(pageCtrl: PageNumControllable, signal?: AbortSignal) {
        let breakSignal = false;
        let abortActon = () => (breakSignal = true);
        signal?.addEventListener("abort", abortActon);

        let errors: any[] = [];
        for await (const res of pageCtrl.pageNumIterator(errors)) {
            if (breakSignal) break;
            await this.randomTime();
            if (breakSignal) break;
        }
        signal?.removeEventListener("abort", abortActon);
        if (errors) return errors;
    }
}
