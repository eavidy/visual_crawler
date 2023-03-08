import { Collection, ObjectId, WithId, Db } from "mongodb";
import { CrawlerPriorityTask, TaskState, SiteTag } from "api/model";
import { checkType, testFx, optional } from "common/calculate/field_test";
import { FieldCheckError } from "../classes/errors";
export type CrawlerTaskAppend = Omit<CrawlerPriorityTask, "status">;
export type UnexecutedCrawlerTask = WithId<Omit<CrawlerPriorityTask, "status" | "priority" | "expirationTime">>;
export class TaskQueueData {
    private priorityQueueView: Collection;

    constructor(db: Db, private collection: Collection) {
        this.priorityQueueView = db.collection("task_priority_queue");
    }
    async takeTasks(count: number, siteTag: SiteTag) {
        let res = await this.priorityQueueView.find<UnexecutedCrawlerTask>({ siteTag }).limit(count).toArray();
        await this.collection.updateMany(
            { _id: { $in: res.map((val) => val._id) } },
            { $set: { status: TaskState.executing } }
        );
        return res;
    }
    async appendTask(task: CrawlerTaskAppend) {
        let res = checkType(task, taskChecker);
        if (res) throw new FieldCheckError(res);
        return this.collection.insertOne({ ...task, status: TaskState.unexecuted });
    }
    async appendTasks(tasks: CrawlerTaskAppend[]) {
        {
            let res = checkType(tasks, testFx.arrayType(taskChecker));
            if (res) throw new FieldCheckError(res);
        }
        return this.collection.insertMany(tasks);
    }
    async markTasksFailed(id: string) {
        return this.collection.updateOne({ _id: toId(id) }, {
            $set: {
                status: TaskState.failed,
            },
        } as Partial<CrawlerPriorityTask>);
    }
    async markTasksSucceed(id: string | number) {
        return this.collection.deleteOne({ _id: toId(id) });
    }
    async updateTasksStatus(ids: (string | ObjectId)[], status: TaskState) {
        {
            let res = checkType(status, testFx.numScope(0));
            if (res) throw new FieldCheckError(res);
        }
        return this.collection.updateMany({ _id: { $in: ids.map((id) => new ObjectId(id)) } }, { $set: { status } });
    }
}

const taskChecker = (function () {
    let filterTester = optional({
        city: optional.number,
        emitTime: testFx.instanceof(Date),
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
        taskInfo: optional(testFx.any()),
    } as {
        [key in keyof CrawlerPriorityTask]?: any;
    };
})();

function toId(id: string | number): any {
    if (typeof id === "number") return id;
    return new ObjectId(id);
}
