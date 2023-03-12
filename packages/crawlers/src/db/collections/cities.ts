import { CrawlerPriorityJobFilterTask, SiteTag, TaskState, TaskType } from "api/model";
import { Collection } from "mongodb";
import { checkType, checkFx } from "@asnc/tslib/lib/std/type_check";
import { FieldCheckError } from "../classes/errors";

export class CitiesData {
    private readonly taskQueueCollName = "task_queue";
    constructor(private table: Collection) {}
    async appendAllCitesTasksFromCitesCollection(siteTag: SiteTag, expirationTime?: Date) {
        {
            let res = checkType(
                [siteTag, expirationTime],
                ["number", checkFx.unionType(["undefined", checkFx.instanceof(Date)])],
                {
                    checkAll: true,
                    deleteSurplus: true,
                }
            );
            if (res) throw new FieldCheckError(res);
        }
        return this.table
            .aggregate<CrawlerPriorityJobFilterTask>([
                { $match: {} },
                {
                    $set: {
                        siteTag: siteTag,
                        status: TaskState.unexecuted,
                        type: TaskType.jobFilter,
                        taskInfo: {
                            fixedFilter: { city: "$_id" },
                        },
                        expirationTime: expirationTime,
                    },
                },
                {
                    $project: {
                        _id: 0,
                        siteTag: 1,
                        status: 1,
                        type: 1,
                        taskInfo: 1,
                        expirationTime: 1,

                        priority: "$cityLevel",
                    },
                },
                { $out: this.taskQueueCollName },
            ])
            .toArray();
    }
}
