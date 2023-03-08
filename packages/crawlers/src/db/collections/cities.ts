import { CrawlerPriorityJobFilterTask, SiteTag, TaskState, TaskType } from "api/model";
import { Collection } from "mongodb";
import { checkType, testFx } from "common/calculate/field_test";
import { FieldCheckError } from "../classes/errors";

export class CitiesData {
    private readonly taskQueueCollName = "task_queue";
    constructor(private table: Collection) {}
    async appendAllCitesTasksFromCitesCollection(siteTag: SiteTag, expirationTime?: Date) {
        {
            let res = checkType(
                [siteTag, expirationTime],
                ["number", testFx.unionType(["undefined", testFx.instanceof(Date)])]
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
