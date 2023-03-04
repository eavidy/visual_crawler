import { expect, it, describe } from "vitest";
import { DataParser as Parser } from "./data_parser";

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
    expect(Parser.cityNameToId("位置")).toBeUndefined();
});
it("匹配城市", function () {
    expect(Parser.matchCityToId("北京"), "1").toEqual(101010100);
    expect(Parser.matchCityToId("s北京d")).toEqual(101010100);
    expect(Parser.matchCityToId("北京-朝阳区")).toBeUndefined(); //北京市 朝阳市, 字符串中有相同城市,解析失败
    expect(Parser.matchCityToId("北京s上海")).toBeUndefined();
});
