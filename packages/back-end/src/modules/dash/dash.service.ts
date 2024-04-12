import { Injectable } from "@nestjs/common";
import {
  JobAnalysisDbService,
  MatchFilter,
} from "../../services/db/job_analysis.db.service.js";
import cityIdMap from "common/constants/city_id_map.js";
import { GroupItem } from "common/request/dashboard.js";
import { Education } from "common/model/index.js";
function mathRound(value: number, decimals = 0) {
  let dv = 10 ** decimals;
  return Math.round(value * dv) / dv;
}

@Injectable()
export class DashService {
  constructor(private jobAnalysisDbService: JobAnalysisDbService) {
    let date = new Date().getTime();
    this.initCache().then(() => {
      console.log(
        "dashboard首页缓存完成: " + (new Date().getTime() - date) + "ms",
      );
    });
  }
  private async initCache() {
    let cache = this.cache;
    let pms1 = this.getDataByCity({}).then((items) => {
      cache.dataByCity = items;
    });
    let pms2 = this.getJobBillboard({}).then((items) => {
      cache.jobBillboard = items;
    });
    let pms3 = this.getDataByTime({}).then((items) => {
      cache.dataByTime = items;
    });
    let pms4 = this.getDataByEducation({}).then((items) => {
      cache.dataByEducation = items;
    });
    let pms5 = this.getDataByWorkExp({}).then((items) => {
      cache.dataByWorkExp = items;
    });

    return Promise.all([pms1, pms2, pms3, pms4, pms5]);
  }

  async getDataByTime(matchFilter: MatchFilter) {
    if (Object.keys(matchFilter).length === 0 && this.cache.dataByTime)
      return this.cache.dataByTime;
    let items =
      await this.jobAnalysisDbService.avgAndTotalGroupByTime(matchFilter);
    for (const item of items) {
      item.avgSalary = mathRound(item.avgSalary);
    }
    return items;
  }
  async getDataByCity(matchFilter: MatchFilter) {
    if (Object.keys(matchFilter).length === 0 && this.cache.dataByCity)
      return this.cache.dataByCity;
    let extFilter = matchFilter.cityId
      ? undefined
      : { "jobData.cityId": { $ne: null } };
    let items = await this.jobAnalysisDbService.avgAndTotalGroupBy<
      GroupItem & { cityId: number; cityName: string }
    >(
      matchFilter,
      {
        groupBy: "cityId",
        renameId: "cityId",
        sort: { avgSalary: 1 },
      },
      extFilter,
    );

    for (const item of items) {
      item.cityName = cityIdMap[item.cityId];
      item.avgSalary = mathRound(item.avgSalary, 2);
    }

    return items;
  }
  async getDataByJobName(matchFilter: MatchFilter) {
    if (Object.keys(matchFilter).length === 0) return [];

    let items = await this.jobAnalysisDbService.avgAndTotalGroupBy<
      GroupItem & { jobName: string }
    >(matchFilter, {
      groupBy: "name",
      renameId: "jobName",
      sort: { avgSalary: -1 },
      limit: 100,
    });
    items = items.reverse();
    for (const item of items) item.avgSalary = mathRound(item.avgSalary, 2);

    return items;
  }
  async getDataByEducation(matchFilter: MatchFilter) {
    if (Object.keys(matchFilter).length === 0 && this.cache.dataByEducation)
      return this.cache.dataByEducation;
    type EduAnItem = GroupItem & { education: string };
    let items = await this.jobAnalysisDbService.avgAndTotalGroupBy<EduAnItem>(
      matchFilter,
      {
        groupBy: "education",
        renameId: "education",
        sort: { education: 1 },
      },
    );
    let newList: any[] = [];
    let nEdu: EduAnItem | undefined;
    let last: EduAnItem | undefined;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      if ([null, 0].includes(item.education as any)) {
        // 将null 和 0 合并(不限学历)
        if (nEdu) {
          let sum =
            nEdu.jobCount * nEdu.avgSalary + item.jobCount * item.avgSalary;
          nEdu.jobCount += item.jobCount;
          nEdu.avgSalary = sum / nEdu.jobCount;
        } else {
          nEdu = item;
          item.education = 0 as any;
        }
      } else {
        item.avgSalary = mathRound(item.avgSalary, 2);
        if ((item.education as any) === Education.博士)
          last = item; //排序
        else newList.push(item);
      }
    }
    last && newList.push(last);
    if (nEdu) {
      nEdu.avgSalary = mathRound(nEdu.avgSalary, 2);
      newList.unshift(nEdu);
    }

    return newList;
  }
  async getDataByWorkExp(matchFilter: MatchFilter) {
    if (Object.keys(matchFilter).length === 0 && this.cache.dataByWorkExp)
      return this.cache.dataByWorkExp;
    type WorkExpAnItem = GroupItem & { workExp: string };
    let items =
      await this.jobAnalysisDbService.avgAndTotalGroupBy<WorkExpAnItem>(
        matchFilter,
        {
          groupBy: "workExperience",
          renameId: "workExp",
          sort: { workExp: 1 },
        },
      );
    let newList: any[] = [];
    let nExp: WorkExpAnItem | undefined;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      if ([null, -1].includes(item.workExp as any)) {
        // 将null 和 -1 合并(不限经验)
        if (nExp) {
          let sum =
            nExp.jobCount * nExp.avgSalary + item.jobCount * item.avgSalary;
          nExp.jobCount += item.jobCount;
          nExp.avgSalary = sum / nExp.jobCount;
        } else {
          nExp = item;
          item.workExp = -1 as any;
        }
      } else {
        item.avgSalary = mathRound(item.avgSalary, 2);
        newList.push(item);
      }
    }
    if (nExp) {
      nExp.avgSalary = mathRound(nExp.avgSalary, 2);
      newList.unshift(nExp);
    }

    return newList;
  }
  async getJobBillboard(matchFilter: MatchFilter) {
    if (Object.keys(matchFilter).length === 0 && this.cache.jobBillboard)
      return this.cache.jobBillboard;
    let allBillboard = await this.jobAnalysisDbService.avgAndTotalByJob(
      matchFilter,
      30,
    );
    for (const data of Object.values(allBillboard)) {
      for (const item of data) {
        item.avgSalary = mathRound(item.avgSalary, 2);
      }
    }
    return {
      avgSalary: allBillboard[0],
      jobCount: allBillboard[1],
    };
  }

  private cache: {
    jobBillboard?: {
      avgSalary: any[];
      jobCount: any[];
    };
    dataByCity?: any[];
    dataByEducation?: any[];
    dataByWorkExp?: any[];
    dataByTime?: any[];
  } = {};
  readonly provinceIdNameMap = provinceIdNameMap;
  get cityOption() {
    let option: { value: string; label: string }[] = Object.entries(
      cityIdMap,
    ).map(([value, label]) => ({
      label,
      value,
    }));
    return option;
  }
}

const provinceIdNameMap = [
  {
    value: "100",
    label: "甘肃",
  },
  {
    value: "110",
    label: "广西",
  },
  {
    value: "120",
    label: "贵州",
  },
  {
    value: "130",
    label: "海南",
  },
  {
    value: "140",
    label: "河北",
  },
  {
    value: "150",
    label: "河南",
  },
  {
    value: "160",
    label: "黑龙江",
  },
  {
    value: "170",
    label: "湖北",
  },
  {
    value: "180",
    label: "湖南",
  },
  {
    value: "190",
    label: "吉林",
  },
  {
    value: "200",
    label: "江西",
  },
  {
    value: "210",
    label: "辽宁",
  },
  {
    value: "220",
    label: "内蒙古",
  },
  {
    value: "230",
    label: "宁夏",
  },
  {
    value: "240",
    label: "青海",
  },
  {
    value: "250",
    label: "山东",
  },
  {
    value: "260",
    label: "山西",
  },
  {
    value: "270",
    label: "陕西",
  },
  {
    value: "280",
    label: "四川",
  },
  {
    value: "290",
    label: "西藏",
  },
  {
    value: "300",
    label: "新疆",
  },
  {
    value: "310",
    label: "云南",
  },
  {
    value: "340",
    label: "台湾",
  },
  {
    value: "050",
    label: "广东",
  },
  {
    value: "060",
    label: "江苏",
  },
  {
    value: "070",
    label: "浙江",
  },
  {
    value: "080",
    label: "安徽",
  },
  {
    value: "090",
    label: "福建",
  },
  {
    value: "a6",
    label: "直辖市、特别行政区",
  },
];

function getTheCurrentYearDateScope() {
  let endTime = new Date();
  let startTime = new Date();
  startTime.setFullYear(endTime.getFullYear() - 3);
  return { startTime, endTime };
}
