import { it, expect, describe } from "vitest";
import { testObjectField, testFx, optional } from "./field_test";

it("基本", function () {
    let obj = { s: 3, i: "s", y: null, q: undefined };
    expect(testObjectField(obj, { s: "number", i: "string", y: "object", q: "undefined" })).toBeUndefined();
    expect(
        testObjectField(obj, { s: "number", i: "string", y: "object", q: "undefined", aa: "number" }),
        "预期不存在"
    ).has.keys(["aa"]);
    expect(
        testObjectField(obj, { s: "string", i: (a: any) => "sd", y: {}, q: "undefined" }),
        "预期类型不一致"
    ).has.keys(["s", "i", "y"]);
    expect(
        testObjectField(obj, { s: "string", i: (a: any) => undefined, y: (a: any) => undefined }),
        "预期类型不一致"
    ).has.keys(["s"]);
});
it("嵌套", function () {
    let res = testObjectField(
        { s: 3, i: { q: "s", y: null, c: undefined } },
        { s: "number", i: { q: "string", c: "undefined" } }
    );
    expect(res).toBeUndefined();
});
it("可选", function () {
    expect(testObjectField({ s: 3, i: "s" }, { s: "number", i: "string", q: optional("string") })).toBeUndefined();
    expect(testObjectField({ s: 3, i: "s", q: 8 }, { s: "number", i: "string", q: optional("string") })).has.keys([
        "q",
    ]);
    expect(
        testObjectField({ s: 3, i: "s", q: "sd" }, { s: "number", i: "string", q: optional("string") })
    ).toBeUndefined();

    //联合类型
    expect(
        testObjectField({ s: 3, i: null }, { s: ["number", "string"], i: ["string", (a) => undefined] })
    ).toBeUndefined();
    expect(testObjectField({ s: 3 }, { s: ["bigint", "string"] })).has.key("s");
});
it("删除多余", function () {
    let obj = { s: 3, i: "s" };
    testObjectField(obj, { s: "number" });
    expect(obj).toEqual({ s: 3 });
    obj = { s: 3, i: "s" };
    testObjectField(obj, { s: "number" }, false);
    expect(obj).toEqual({ s: 3, i: "s" });
});

describe("内置测试函数", function () {
    it("数字范围", function () {
        let towToFour = testFx.numScope(2, 4);
        expect(testObjectField({ a: 2 }, { a: towToFour })).toBeUndefined();
        expect(testObjectField({ a: 3 }, { a: towToFour })).toBeUndefined();
        expect(testObjectField({ a: 4 }, { a: towToFour })).toBeUndefined();
        expect(testObjectField({ a: 5 }, { a: towToFour })).has.key("a");
        expect(testObjectField({ a: 1 }, { a: towToFour })).has.key("a");
        expect(testObjectField({ a: "d" }, { a: towToFour })).has.key("a");
        expect(testObjectField({ a: undefined }, { a: towToFour })).has.key("a");
        expect(testObjectField({ a: new Set() }, { a: towToFour })).has.key("a");
    });
    it("实例类型", function () {
        let mapIns = testFx.instanceof(Map);
        expect(testObjectField({ a: new Map() }, { a: mapIns })).toBeUndefined();
        expect(testObjectField({ a: null }, { a: mapIns })).has.key("a");
        expect(testObjectField({ a: NaN }, { a: mapIns })).has.key("a");
        expect(testObjectField({ a: undefined }, { a: mapIns })).has.key("a");
        expect(testObjectField({}, { a: mapIns })).has.key("a");
    });
});
