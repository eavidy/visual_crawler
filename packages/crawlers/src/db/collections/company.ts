import { CompanyCrawlerData, SiteTag } from "api/model";
import { ObjectId, Collection, WithId } from "mongodb";
import { checkType, ExceptTypeMap, optional, testFx } from "common/calculate/field_test";
import { FieldCheckError } from "../classes/errors";

export class CompanyData {
    constructor(private table: Collection) {}

    /** 成功插入返回true, 如果数据库中已经存在ID, 返回false */
    async appendCompany(comp: CompanyCrawlerData) {
        {
            let res = checkType(comp, companyChecker);
            if (res) throw new FieldCheckError(res);
        }
        let res = await this.table.findOne({ companyId: comp.companyId, siteTag: comp.siteTag });
        if (res === null) {
            await this.table.insertOne(comp);
            return true;
        }
        return false;

        // this.table.updateOne({ _id: res._id }, patchObject(comp, res));
        //todo: 如果存在, 更新公司
    }
    /**
     * 如果数据库存在相同id的公司, 则不插入, 返回重复公司列表
     */
    async appendCompanies(comps: CompanyCrawlerData[], siteTag: SiteTag) {
        {
            let res = checkType(comps, testFx.arrayType(companyChecker));
            if (res) throw new FieldCheckError(res);
        }
        let idMap = getIdMap(comps, siteTag);
        let notInsertComps: CompanyCrawlerData[] = []; //todo: 更新重复的公司
        {
            let oldComps = await this.table
                .aggregate<WithId<Pick<CompanyCrawlerData, "companyId" | "siteTag">>>([
                    { $match: { siteTag, companyId: { $in: Object.keys(idMap) } } },
                    { $project: { siteTag: 1, companyId: 1 } },
                ])
                .toArray();

            for (const old of oldComps) {
                let val = idMap[old.companyId];
                if (val) notInsertComps.push(val);
                delete idMap[old.companyId];
            }
        }
        await this.table.insertMany(Object.values(idMap));
        return notInsertComps;
    }
    async deleteCompany(compId: string) {
        return this.table.deleteOne({ _id: new ObjectId(compId) });
    }
}

function getIdMap(comps: CompanyCrawlerData[], siteTag: SiteTag) {
    let idMap: Record<string, CompanyCrawlerData> = {};
    for (const comp of comps) {
        if (siteTag !== comp.siteTag) throw "siteTag不匹配";
        idMap[comp.companyId] = comp;
    }
    return idMap;
}

const companyChecker: ExceptTypeMap = {
    companyId: "string",
    /** 公司是否存在 */
    exist: "boolean",
    companyData: {
        /* 所属行业 */
        industry: "string",
        /** 规模 */
        scale: "number",
        /* 公司福利标签 */
        welfareLabel: testFx.arrayType("string"),
        name: "string",
    },
    siteTag: "number",
    lastUpdate: optional(testFx.instanceof(Date)),
};
