import { describe, it, expect } from "vitest";
import { citiesData } from "../index";
import { SiteTag } from "api/model";

describe.skip("手动任务", function () {
    it("添加任务", async function () {
        let res = await citiesData.appendAllCitesTasksFromCitesCollection(SiteTag.liepin);
        console.log(res);
        expect(true).toBeTruthy();
    });
});
