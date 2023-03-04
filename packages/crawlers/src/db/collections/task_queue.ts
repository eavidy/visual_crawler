import { Collection, ObjectId, WithId } from "mongodb";
import { CrawlerPriorityTask, TaskState, SiteTag } from "api/model";
import { testObjectField, testFx, optional } from "common/calculate/field_test";

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
        let res = taskTest(task);
        if (res) throw new Error("数据结构异常", { cause: res });
        return this.collection.insertOne(task);
    }
    async appendTasks(tasks: CrawlerPriorityTask[]) {
        for (let i = 0; i < tasks.length; i++) {
            let res = taskTest(tasks[i]);
            if (res) throw new Error("数据结构异常: 第" + i + "个数据", { cause: res });
        }
        return this.collection.insertMany(tasks);
    }
    async markTasksFailed(id: string | number) {
        return this.collection.updateOne({ _id: new ObjectId(id) }, {
            $set: {
                status: TaskState.failed,
            },
        } as Partial<CrawlerPriorityTask>);
    }
    async markTasksSucceed(id: string | number) {
        return this.collection.deleteOne({ _id: new ObjectId(id) });
    }
}

function taskTest(task: CrawlerPriorityTask) {
    let filterTester = optional({
        city: optional.number,
        emitTime: testFx.instanceof(Date),
        exp: optional.number,
        salary: optional.number,
        eduction: optional.number,
        companyScale: optional.number,
    });
    return testObjectField(task, {
        type: "string",
        siteTag: "number",
        status: "number",
        priority: optional.number,
        expirationTime: optional.string,
        fixedFilter: filterTester,
        nonFixedFilter: filterTester,
    } as {
        [key in keyof CrawlerPriorityTask]?: any;
    });
}
