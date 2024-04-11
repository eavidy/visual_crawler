import { CrawlerPriorityJobFilterTask, JobFilterOption, SiteTag, TaskState, TaskType } from "common/model";
import { taskQueueCollection, citiesCollection, companyCollection, jobsCollection } from "./db.js";
import { Injectable } from "@nestjs/common";
import { Document, ObjectId } from "mongodb";
import { checkType, typeChecker } from "evlib";
const { optional } = typeChecker;
export interface GetTasksFilter {
  siteTag?: SiteTag;
  status?: TaskState;
  type?: TaskType;
}
export interface TaskItem {
  _id: string;
  /** 任务类型 */
  type: TaskType;
  siteTag: SiteTag;
  status: TaskState;
  /** 优先级, 越小越优先 */
  priority?: number;
  taskInfo?: any;
  name: string;
}

@Injectable()
export class TaskQueueDbService {
  constructor() {}
  async appendCitesTasksFromCitesCollection(
    siteTag: SiteTag,
    option?: Omit<JobFilterOption, "city">,
    pickId?: number[]
  ) {
    {
      let res = checkType(
        [siteTag, option, pickId],
        ["number", typeChecker.union(["undefined", { emitTime: "number" }]), typeChecker.arrayType("number")],
        {
          checkAll: true,
          policy: "delete",
        }
      ).error;
      if (res) throw new Error("字段校验不通过", { cause: res });
    }

    let matchOption: Document = {};
    if (pickId && pickId.length) matchOption.companyId = { $in: pickId };

    const items = await citiesCollection
      .aggregate<CrawlerPriorityJobFilterTask>([
        { $match: matchOption },
        {
          $set: {
            type: TaskType.jobFilter,
            siteTag: siteTag,
            priority: "$cityLevel",
            status: TaskState.unexecuted,
            taskInfo: {
              fixedFilter: { ...option, city: "$_id" },
            },
          },
        },
      ])
      .project({
        _id: 0,
        siteTag: 1,
        status: 1,
        type: 1,
        taskInfo: 1,
        priority: 1,
      })
      .toArray();

    await taskQueueCollection.insertMany(items);
    return;
  }
  async appendCompanyTaskFromCompanyCollection(siteTag: SiteTag, pickId?: string[]) {
    {
      let res = checkType([siteTag, pickId], ["number", optional(typeChecker.arrayType("string"))], {
        checkAll: true,
        policy: "delete",
      }).error;
      if (res) throw new Error("字段校验不通过", { cause: res });
    }

    let matchOption: Document = {};
    if (pickId && pickId.length) matchOption.companyId = { $in: pickId };

    const pipeline = companyCollection
      .aggregate([
        { $match: matchOption },
        { $set: { type: TaskType.company, siteTag, status: TaskState.unexecuted, taskInfo: "$companyId" } },
      ])
      .project({ _id: 0, type: 1, siteTag: 1, status: 1, taskInfo: 1 });

    let cache: Document[] = [];
    while (true) {
      if (cache.length == 5000) {
        taskQueueCollection.insertMany(cache);
        cache = [];
      }
      let item = await pipeline.next();
      if (item) cache.push(item);
      else {
        if (cache.length) await taskQueueCollection.insertMany(cache);
        cache = [];
        return pipeline.clone();
      }
    }
  }
  async getTasks(filter: GetTasksFilter = {}, limit?: number, skip?: number) {
    {
      let res = checkType(
        filter,
        { siteTag: optional.number, status: optional.number, type: optional.string },
        {
          checkAll: true,
          policy: "delete",
        }
      ).error;
      if (res) throw new Error("字段校验不通过", { cause: res });
    }
    let matchOption: Document;
    if (filter.status !== undefined) {
      matchOption = { $and: [filter, { status: { $ne: TaskState.executed } }] };
    } else matchOption = { ...filter, status: { $ne: TaskState.executed } };

    let pipeline = taskQueueCollection.aggregate().match(matchOption).project<TaskItem>({
      status: 1,
      type: 1,
      siteTag: 1,
      taskInfo: 1,
      priority: 1,
    });

    pipeline.sort({ status: -1, priority: 1 });
    if (skip) pipeline.skip(skip);
    if (limit) pipeline.limit(limit);

    const [total, items] = await Promise.all([taskQueueCollection.countDocuments(matchOption), pipeline.toArray()]);
    await this.mgeTaskName(items);
    return { total, items };
  }
  private async mgeTaskName(items: TaskItem[]) {
    let map: Record<string | number, TaskItem> = {};

    let cityKeys: number[] = [];
    let companyKeys: string[] = [];
    for (const item of items) {
      if (item.type === TaskType.company) {
        let id = item.taskInfo as string;
        companyKeys.push(id);
        map[id] = item;
      } else {
        let id = item.taskInfo.fixedFilter.city as number;
        cityKeys.push(id);
        map[id] = item;
      }
    }

    let pms1 = cityKeys.length
      ? citiesCollection
          .aggregate()
          .match({ _id: { $in: cityKeys } })
          .project({ name: 1 })
          .toArray()
      : [];
    let pms2 = companyKeys.length
      ? companyCollection
          .aggregate()
          .match({ companyId: { $in: companyKeys } })
          .project({ _id: "$companyId", name: "$companyData.name" })
          .toArray()
      : [];
    const [cityNameList, companyNameList] = await Promise.all([pms1, pms2]);

    for (const city of cityNameList) {
      let item = map[city._id];
      if (item) item.name = city.name ?? "";
    }
    for (const company of companyNameList) {
      let item = map[company._id];
      if (item) item.name = company.name ?? "";
    }
    return items;
  }
  async clearTasks() {
    await taskQueueCollection.deleteMany({});
  }
  async deleteTasks(idStrList: string[]) {
    let idList = idStrList.map((id) => new ObjectId(id));
    await taskQueueCollection.deleteMany({ _id: { $in: idList } });
    return;
  }

  async getName() {}
}
