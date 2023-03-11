import { expect, it, describe } from "vitest";
import { DataParser as Parser } from "./data_parser";
import { CompanyScale, Education } from "api/model";

it("解析薪资", function () {
    expect(Parser.paseSalary("8-10k")).toMatchObject({ salaryMin: 8000, salaryMax: 10000, salaryMonth: 12 });
    expect(Parser.paseSalary("8-10K")).toMatchObject({ salaryMin: 8000, salaryMax: 10000, salaryMonth: 12 });
    expect(Parser.paseSalary("8-10k·14薪")).toMatchObject({ salaryMin: 8000, salaryMax: 10000, salaryMonth: 14 });
    expect(Parser.paseSalary("200-300元/天")).toMatchObject({ salaryMin: 4400, salaryMax: 6600, salaryMonth: 12 });
    expect(Parser.paseSalary("300元/天")).toMatchObject({ salaryMin: 6600, salaryMax: 6600, salaryMonth: 12 });
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

describe("解析学历", function () {
    it("全匹配", function () {
        expect(Parser.matchEducation("中专")).toEqual(Education.中专);
        expect(Parser.matchEducation("本科")).toEqual(Education.本科);
    });
});
