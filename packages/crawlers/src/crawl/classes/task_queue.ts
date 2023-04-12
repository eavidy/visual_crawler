import { CrawlerTaskAppend, SiteTag, TaskState, TaskType } from "common/model";
import { taskQueueData, UnexecutedCrawlerTask } from "../../db";
import { cities } from "common/constants/cities";

export class TaskQueue {
    constructor(readonly siteTag: SiteTag, public taskType?: TaskType, public cacheSize = 5) {}
    protected cache: UnexecutedCrawlerTask[] = []; //队列缓存

    async pushMany(tasks: CrawlerTaskAppend[]) {
        return taskQueueData.appendTasks(tasks);
    }
    async takeTask() {
        let task = this.cache.shift();
        if (!task) {
            let newTasks = await taskQueueData.takeTasks(this.cacheSize, this.siteTag, this.taskType);
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

export class NewCityTaskQueue extends TaskQueue {
    constructor(siteTag: SiteTag) {
        super(siteTag, TaskType.jobFilter, 1);
        this.#cache.shift();
    }
    #cache = cities.sort((a, b) => a.cityLevel - b.cityLevel).filter((val) => val.liepinCode !== undefined);
    async takeTask() {
        let city = this.#cache.shift();
        if (!city) return;

        let task: UnexecutedCrawlerTask = {
            _id: city._id as any,
            siteTag: this.siteTag,
            type: this.taskType!,
            taskInfo: {
                fixedFilter: {
                    city: city._id,
                    emitTime: 3,
                },
            },
        };

        return task;
    }
}
