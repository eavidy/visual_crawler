import { Collection, ObjectId, WithId } from "mongodb";
import { CrawlerPriorityTask, TaskState, SiteTag } from "api/model";
import { checkType, testFx, optional } from "common/calculate/field_test";
import { FieldCheckError } from "../classes/errors";

export class TaskQueueData {
    constructor(private collection: Collection) {}
    async takeTasks(count: number, siteTag: SiteTag) {
        let res = await this.collection
            .aggregate<WithId<CrawlerPriorityTask>>([
                { $match: { siteTag, status: TaskState.unexecuted } },
                { $sort: { priority: -1, expirationTime: 1 } },
                { $limit: count },
            ])
            .toArray();
        await this.collection.updateMany(
            { _id: { $in: res.map((val) => val._id) } },
            { $set: { status: TaskState.executing } }
        );
        return res;
    }
    async appendTask(task: CrawlerPriorityTask) {
        let res = checkType(task, taskChecker);
        if (res) throw new FieldCheckError(res);
        return this.collection.insertOne(task);
    }
    async appendTasks(tasks: CrawlerPriorityTask[]) {
        {
            let res = checkType(tasks, testFx.arrayType(taskChecker));
            if (res) throw new FieldCheckError(res);
        }
        return this.collection.insertMany(tasks);
    }
    async markTasksFailed(id: string | number) {
        return this.collection.updateOne({ _id: toId(id) }, {
            $set: {
                status: TaskState.failed,
            },
        } as Partial<CrawlerPriorityTask>);
    }
    async markTasksSucceed(id: string | number) {
        return this.collection.deleteOne({ _id: toId(id) });
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
        status: "number",
        priority: optional.number,
        expirationTime: optional.string,
        fixedFilter: filterTester,
        nonFixedFilter: filterTester,
    } as {
        [key in keyof CrawlerPriorityTask]?: any;
    };
})();

function toId(id: string | number): any {
    if (typeof id === "number") return id;
    return new ObjectId(id);
}
