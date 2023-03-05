import { beforeAll, describe, it, expect, afterAll } from "vitest";
import { companyData, dbClient } from "../";
import { SiteTag, CompanyCrawlerData } from "api/model";

describe.skip("手动测试", function () {
    it("单条重复", async function () {
        let res = await companyData.appendCompany({
            companyId: "sdg0",
            /** 公司是否存在 */
            exist: true,
            companyData: n,
            siteTag: SiteTag.boss,
        });
        expect(res).toBeFalsy();
    });
    it("单条插入", async function () {
        let res = await companyData.appendCompany({
            companyId: "sdg3",
            /** 公司是否存在 */
            exist: true,
            companyData: n,
            siteTag: SiteTag.boss,
        });
        expect(res).toBeTruthy();
    });

    it("多条重复", async function () {
        let dataList: CompanyCrawlerData[] = [
            {
                companyId: "sdg2",
                /** 公司是否存在 */
                exist: true,
                companyData: n,
                siteTag: SiteTag.boss,
            },
            {
                companyId: "sdg3",
                /** 公司是否存在 */
                exist: true,
                companyData: n,
                siteTag: SiteTag.boss,
            },
            {
                companyId: "sdg4",
                /** 公司是否存在 */
                exist: true,
                companyData: n,
                siteTag: SiteTag.boss,
            },
            {
                companyId: "sdg5",
                /** 公司是否存在 */
                exist: true,
                companyData: n,
                siteTag: SiteTag.boss,
            },
        ];
        let res = await companyData.appendCompanies(dataList, SiteTag.boss);
        expect(res.map((i) => i.companyId)).toEqual(["sdg2", "sdg3"]);
    });
});
let n = {
    industry: "互联网",
    name: "A",
    scale: 700,
    welfareLabel: [],
};
beforeAll(async function () {
    let data: CompanyCrawlerData[] = [
        {
            companyId: "sdg0",
            /** 公司是否存在 */
            exist: true,
            companyData: n,
            siteTag: SiteTag.boss,
        },
        {
            companyId: "sd1",
            /** 公司是否存在 */
            exist: true,
            companyData: n,
            siteTag: SiteTag.boss,
        },
        {
            companyId: "sdg2",
            /** 公司是否存在 */
            exist: true,
            companyData: n,
            siteTag: SiteTag.boss,
        },
    ];
    await dbClient.db().collection("companies").insertMany(data);
});
afterAll(async function () {
    await dbClient.db().collection("companies").deleteMany({});
    await dbClient.close();
});
