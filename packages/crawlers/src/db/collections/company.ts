import {
  CompanyCrawlerData,
  CompanyCrawlerDataAppend,
  CrawlerPriorityCompanyTask,
  SiteTag,
  TaskType,
} from "common/model/index.js";
import { ObjectId, WithId } from "mongodb";
import { checkType, ExceptType, typeChecker } from "evlib";
import { FieldCheckError } from "../classes/errors.js";
import { companyCollection } from "../db.js";
const { optional, array } = typeChecker;

export class CompanyData {
  constructor() {}

  /** 成功插入返回true, 如果数据库中已经存在ID, 返回false */
  async appendCompany(comp: CompanyCrawlerDataAppend) {
    {
      let res = checkType(comp, companyChecker, CheckTypeOption).error;
      if (res) throw new FieldCheckError(res);
    }
    let res = await companyCollection.findOne({ companyId: comp.companyId, siteTag: comp.siteTag });
    if (res === null) {
      await companyCollection.insertOne({ ...comp });
      return true;
    }
    return false;

    // companyCollection.updateOne({ _id: res._id }, patchObject(comp, res));
    //todo: 如果存在, 更新公司
  }
  /**
   * 如果数据库存在相同id的公司, 则不插入, 返回重复公司列表
   * @param insertCheckedItem 插入校验通过的项
   */
  async appendCompanies(comps: CompanyCrawlerDataAppend[], siteTag: SiteTag, insertCheckedItem = true) {
    let newComps: CompanyCrawlerDataAppend[] = [];
    let checkFail: { item: CompanyCrawlerDataAppend; err: any }[] = [];
    {
      if (insertCheckedItem) {
        for (const item of comps) {
          let err = checkType(item, companyChecker, CheckTypeOption).error;
          if (err) checkFail.push({ err, item });
          else newComps.push(item);
        }
      } else {
        let res = checkType(comps, array(companyChecker), CheckTypeOption).error;
        if (res) throw new FieldCheckError(res);
      }
    }
    let idMap = getIdMap(newComps, siteTag);
    let notInsertComps: CompanyCrawlerDataAppend[] = []; //todo: 更新重复的公司
    {
      let oldComps = await companyCollection
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
    let insertable = Object.values(idMap);
    if (insertable.length) await companyCollection.insertMany(insertable);
    return {
      inserted: insertable,
      uninserted: notInsertComps.length ? notInsertComps : null,
      checkFail: checkFail.length ? checkFail : null,
    };
  }

  async deleteCompany(compId: string) {
    return companyCollection.deleteOne({ _id: new ObjectId(compId) });
  }

  async appendCompanyTasksToTaskQueue(beforeTime: Date, options?: { siteTag?: SiteTag; expirationTime?: Date }) {
    {
      let res = checkType(
        [beforeTime, options],
        [
          typeChecker.instanceof(Date),
          {
            siteTag: "number",
            expirationTime: optional(typeChecker.instanceof(Date)),
            fixedFilter: optional(() => {
              return {};
            }),
            nonFixedFilter: optional(() => {
              return {};
            }),
          },
        ],
        CheckTypeOption
      ).error;
      if (res) throw new FieldCheckError(res);
    }
    let siteTag = options?.siteTag;
    let res = await companyCollection
      .aggregate<CrawlerPriorityCompanyTask>([
        {
          $match: {
            nonexistent: { $not: true },
            siteTag,
            lastPushQueueDate: { $or: [null, { $lt: beforeTime }] },
          },
        },
        {
          $set: {
            type: TaskType.company,
            taskInfo: "$companyId",
          },
        },
        {
          $project: {
            _id: 0,
            siteTag: 1,
          },
        },
        // {
        //     $out: this.taskQueueCollName,
        // },
      ])
      .toArray();
    return res;
  }
}

function getIdMap(comps: CompanyCrawlerDataAppend[], siteTag: SiteTag) {
  let idMap: Record<string, CompanyCrawlerDataAppend> = {};
  for (const comp of comps) {
    if (siteTag !== comp.siteTag) throw "siteTag不匹配";
    idMap[comp.companyId] = comp;
  }
  return idMap;
}

const companyChecker: ExceptType = {
  companyId: "string",
  companyData: {
    /* 所属行业 */
    industry: optional.string,
    /** 规模 */
    scale: "number",
    /* 公司福利标签 */
    welfareLabel: array("string"),
    name: "string",
  },
  siteTag: "number",
  lastUpdate: optional(typeChecker.instanceof(Date)),
};
const CheckTypeOption = {
  checkAll: true,
  policy: "delete",
} as const;
