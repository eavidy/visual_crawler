import { expect, it, describe } from "vitest";
import { DataParser, DataParser as Parser } from "./data_parser.js";
import { CompanyScale, Education } from "common/model/index.js";

it("解析薪资", function () {
  expect(Parser.paseSalary("8-10k")).toMatchObject({
    salaryMin: 8000,
    salaryMax: 10000,
    salaryMonth: 12,
  });
  expect(Parser.paseSalary("8-10K")).toMatchObject({
    salaryMin: 8000,
    salaryMax: 10000,
    salaryMonth: 12,
  });
  expect(Parser.paseSalary("8-10k·14薪")).toMatchObject({
    salaryMin: 8000,
    salaryMax: 10000,
    salaryMonth: 14,
  });
  expect(Parser.paseSalary("200-300元/天")).toMatchObject({
    salaryMin: 4400,
    salaryMax: 6600,
    salaryMonth: 12,
  });
  expect(Parser.paseSalary("300元/天")).toMatchObject({
    salaryMin: 6600,
    salaryMax: 6600,
    salaryMonth: 12,
  });
  expect(Parser.paseSalary("薪资面议")).toEqual(null);
  expect(Parser.paseSalary("sd3")).toBeUndefined();
});
it("城市转id", function () {
  expect(Parser.cityNameToId("北京")).toEqual(101010100);
  expect(Parser.cityNameToId("上海")).toEqual(101020100);
  expect(Parser.cityNameToId("徐州")).toEqual(101190800);
  expect(Parser.cityNameToId("位置")).toBeUndefined();
});
it("匹配城市", function () {
  expect(Parser.matchCityToId("北京"), "1").toEqual(101010100);
  expect(Parser.matchCityToId("s北京d")).toEqual(101010100);
  expect(Parser.matchCityToId("北京-朝阳区")).toBeUndefined(); //北京市 朝阳市, 字符串中有相同城市,解析失败
  expect(Parser.matchCityToId("北京s上海")).toBeUndefined();
});
describe("解析公司规模", function () {
  it("正常范围", function () {
    expect(Parser.paseScale("50-99人")).toEqual(CompanyScale.c20_99);
    expect(Parser.paseScale("0-9人")).toEqual(CompanyScale.c0_20);
    expect(Parser.paseScale("200-300人")).toEqual(CompanyScale.c100_499);
  });
  it("大于10000", function () {
    expect(Parser.paseScale("10000人以上")).toEqual(CompanyScale.gt_10000);
  });
  it("解析失败", function () {
    expect(Parser.paseScale("sdg")).toEqual(CompanyScale.unknown);
  });
});
describe("解析名称", function () {
  let nameList = {
    "开发工程师（后端）": "开发工程师",
    "客户经理-储备": "客户经理",
    "应用工程师-贵阳": "应用工程师",
    "内勤--贵州贵阳": "内勤",
    "行业销售经理（物流）": "行业销售经理",
    "化学发光产品线销售经理-贵阳": "化学发光产品线销售经理",
    "商务经理（市场方向）": "商务经理",
    "土建工程师（海外） (MJ013623)": "土建工程师",
    "EHS工程师（安全环保）": "ehs工程师",
    "农夫山泉2023届“堂堂新生”（管培生）— 销售校招生": "销售校招生",
    "区域经理（贵州）": "区域经理",
    "财务主管（医疗业务）": "财务主管",
    "自动化行业销售经理（汽车、工程机械）": "自动化行业销售经理",
    "学术代表（肺癌-谷美替尼）": "学术代表",
    "院校客户经理（异地招聘26）": "院校客户经理",
    "区域销售经理（外派出差补助+无责任底薪）": "区域销售经理",
    "人力行政主管 5-7K": "人力行政主管",
    "机电项目经理（公建）": "机电项目经理",
    "安装项目经理（机电+消防）": "安装项目经理",
    "区域营销/销售经理（风电后市场）": "区域营销/销售经理",
    "（高级）产品专员（全球新药方向）-上海": "产品专员",
    "行业拓展经理（五险一金、双休、商务拓展经理）": "行业拓展经理",
    "城市开发官（城市市场拓展经理）": "城市开发官",
    "BD（商务拓展经理）": "bd",
  };
  it("名称", function () {
    let list = Object.entries(nameList);
    for (let i = 0; i < list.length; i++) {
      let [value, expectVal] = list[i];
      expect(DataParser.paseJobName(value), i.toString()).toEqual(expectVal);
    }
  });
  it("en", function () {
    let nameList = {
      "Marketing Content Supervisor": "marketing content supervisor",
      "Assistant Business Planning Manager":
        "assistant business planning manager",
      "Dior - Marketing Executive (6-month contract)": "marketing executive",
      "Social Media Customer Support Program Manager":
        "social media customer support program manager",
    };
    let list = Object.entries(nameList);
    for (let i = 0; i < list.length; i++) {
      let [value, expectVal] = list[i];
      expect(DataParser.paseJobName(value), i.toString()).toEqual(expectVal);
    }
  });
});
describe("解析学历", function () {
  it("全匹配", function () {
    expect(Parser.matchEducation("中专")).toEqual(Education.中专);
    expect(Parser.matchEducation("本科")).toEqual(Education.本科);
  });
});
