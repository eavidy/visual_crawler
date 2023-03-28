import { Collection, ObjectId, WithId, Db } from "mongodb";
import { CrawlerPriorityTask, TaskState, SiteTag, CrawlerTaskAppend, TaskType } from "common/model";
import { checkType, checkFx, optional } from "@asnc/tslib/lib/std/type_check";
import { FieldCheckError } from "../classes/errors";
export type UnexecutedTask<T extends CrawlerPriorityTask> = WithId<Omit<T, "priority" | "expirationTime" | "status">>;
export type UnexecutedCrawlerTask = UnexecutedTask<CrawlerPriorityTask>;
export class TaskQueueData {
    private priorityQueueView: Collection;

    constructor(db: Db, private collection: Collection) {
        this.priorityQueueView = db.collection("task_priority_queue");
    }
    async takeTasks(count: number, siteTag: SiteTag, taskType?: TaskType) {
        let match: Record<string, any> = { siteTag };
        if (taskType !== undefined) match.type = taskType;
        let res = await this.priorityQueueView.find<UnexecutedCrawlerTask>(match).limit(count).toArray();
        await this.collection.updateMany(
            { _id: { $in: res.map((val) => val._id) } },
            { $set: { status: TaskState.executing } }
        );
        return res;
    }
    async appendTask(task: CrawlerTaskAppend) {
        let res = checkType(task, taskChecker, CheckTypeOption);
        if (res) throw new FieldCheckError(res);
        return this.collection.insertOne({ ...task, status: TaskState.unexecuted });
    }
    async appendTasks(tasks: CrawlerTaskAppend[]) {
        {
            if (!tasks.length) throw new FieldCheckError({ length: "至少为1, 实际0" });
            let res = checkType(tasks, checkFx.arrayType(taskChecker), CheckTypeOption);
            if (res) throw new FieldCheckError(res);
        }
        let fullTasks: CrawlerPriorityTask[] = [];
        for (const task of tasks) {
            fullTasks.push({
                ...task,
                status: TaskState.unexecuted,
            });
        }
        return await this.collection.insertMany(fullTasks);
    }
    async updateTaskInfo(id: string | number | ObjectId, info: any) {
        return this.collection.updateOne({ _id: toId(id) }, {
            $set: {
                taskInfo: info,
            },
        } as Partial<CrawlerPriorityTask>);
    }
    async markTasksFailed(id: string | number | ObjectId, result?: any) {
        return this.collection.updateOne({ _id: toId(id) }, {
            $set: {
                status: TaskState.failed,
                result,
            },
        } as Partial<CrawlerPriorityTask>);
    }
    async markTasksSucceed(id: string | number | ObjectId, result?: any) {
        return this.collection.updateOne({ _id: toId(id) }, { $set: { status: TaskState.executed, result } });
    }
    async updateTasksStatus(ids: (string | ObjectId)[], status: TaskState) {
        {
            let res = checkType(status, checkFx.numScope(0), CheckTypeOption);
            if (res) throw new FieldCheckError(res);
        }
        return this.collection.updateMany({ _id: { $in: ids.map((id) => new ObjectId(id)) } }, { $set: { status } });
    }
}

const taskChecker = (function () {
    let filterTester = optional({
        city: optional.number,
        emitTime: checkFx.instanceof(Date),
        exp: optional.number,
        salary: optional.number,
        eduction: optional.number,
        companyScale: optional.number,
    });
    return {
        type: "string",
        siteTag: "number",
        priority: optional.number,
        expirationTime: optional.string,
        taskInfo: optional(checkFx.any()),
    } as {
        [key in keyof CrawlerPriorityTask]?: any;
    };
})();

function toId(id: string | number | ObjectId): any {
    if (typeof id === "number" || id instanceof ObjectId) return id;
    return new ObjectId(id);
}
const CheckTypeOption = {
    checkAll: true,
    deleteSurplus: true,
};
