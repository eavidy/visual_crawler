import { it, expect, describe, beforeAll, afterAll } from "vitest";
import { dbClient, taskQueueData } from "../index";
import { CrawlerPriorityTask, SiteTag, TaskState } from "api/model";
import { Collection, ObjectId } from "mongodb";

it("插入任务", async function () {
    let res = await taskQueueData.appendTasks(initTasks);
    expect(res).toMatchObject({ insertedCount: 18 });
});
it("获取任务", async function () {
    let res = await taskQueueData.takeTask(2, SiteTag.boss);
    expect(res).has.length(2);
});
it("完成任务", async function () {
    // let res = await taskQueueData.markTasksSucceed(2);
    expect(true).toBeTruthy();
});

let initTasks: CrawlerPriorityTask[] = [
    { siteTag: SiteTag.boss, status: TaskState.unexecuted, type: "bb" },
    { siteTag: SiteTag.boss, status: TaskState.unexecuted, type: "kk", priority: 2 },
    { siteTag: SiteTag.boss, status: TaskState.unexecuted, type: "kk", priority: 3 },
    { siteTag: SiteTag.boss, status: TaskState.executing, type: "cc", priority: 1 },
    { siteTag: SiteTag.boss, status: TaskState.executing, type: "kk", priority: 2 },
    { siteTag: SiteTag.boss, status: TaskState.executing, type: "kk", priority: 1 },
    { siteTag: SiteTag.boss, status: TaskState.failed, type: "kk", priority: 10 },
    { siteTag: SiteTag.boss, status: TaskState.failed, type: "kk", priority: 8 },
    { siteTag: SiteTag.boss, status: TaskState.failed, type: "kk", priority: 1 },
];
initTasks = initTasks.concat(initTasks.map((item) => ({ ...item, siteTag: SiteTag.job51 })));
initTasks.forEach((item: any, index) => {
    item._id = index;
});

const coll: Collection = (taskQueueData as any).collection;
beforeAll(async function () {
    await dbClient.connect();
    await coll.insertMany(initTasks);
});
afterAll(async function () {
    // await coll.deleteMany({});
    await dbClient.close();
});
