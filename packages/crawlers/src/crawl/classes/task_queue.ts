import { CrawlerTaskAppend, SiteTag, TaskState } from "api/model";
import { taskQueueData, UnexecutedCrawlerTask } from "../../db";

export class TaskQueue {
    constructor(readonly siteTag: SiteTag, public cacheSize = 5) {}
    private cache: UnexecutedCrawlerTask[] = []; //队列缓存

    async pushMany(tasks: CrawlerTaskAppend[]) {
        return taskQueueData.appendTasks(tasks);
    }
    async takeTask() {
        let task = this.cache.shift();
        if (!task) {
            let newTasks = await taskQueueData.takeTasks(this.cacheSize, this.siteTag);
            if (newTasks.length) {
                task = newTasks.shift();
                this.cache = this.cache.concat(newTasks);
                return task;
            } else return null;
        }
    }
    async restoreTask() {
        if (this.cache.length === 0) return;
        return taskQueueData.updateTasksStatus(
            this.cache.map((task) => task._id),
            TaskState.unexecuted
        );
    }
}
