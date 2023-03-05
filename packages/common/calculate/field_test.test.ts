import { it, expect, describe } from "vitest";
import { checkType, testFx, optional } from "./field_test";
describe("基本", function () {
    it("基本", function () {
        let obj = { s: 3, i: "s", q: undefined };
        expect(checkType(obj, { s: "number", i: "string", q: "undefined" })).toBeUndefined();
    });
    describe("元组检测", function () {
        it("全匹配", function () {
            expect(checkType([1, "d"], ["number", "string"])).toBeUndefined();

            let res = checkType([1, "d"], ["number", "number"]);
            expect(res[0]).toBeUndefined();
            expect(res[1]).toBeTypeOf("string");
        });
        it("移除多余", function () {
            let val = [1, "d", null];
            expect(checkType(val, ["number", "string"])).toBeUndefined();
            expect(val).toEqual([1, "d"]);
        });
    });
    it("使用自定义函数判断", function () {
        let obj = { s: 3, i: "s", y: null };
        expect(checkType(obj, { s: "number", i: (a: any) => "sd" })).has.key("i");
        expect(checkType(obj, { s: "number", i: (a: any) => undefined })).toBeUndefined();
    });
    it("预期类型不一致", function () {
        let obj = { s: 3, i: "s", y: null, q: undefined };
        expect(checkType(obj, { s: "string", y: {}, q: "undefined" }), "预期类型不一致").has.keys(["s", "y"]);
        expect(checkType(obj, { s: "string", y: (a: any) => undefined }), "预期类型不一致").has.keys(["s"]);
    });
    it("预期不存在", function () {
        let res = checkType({ a: 8 }, { a: "number", b: "number" });
        expect(res).has.key("b");
    });
    it("判断null类型", function () {
        let res = checkType({ a: null }, { a: "null" });
        expect(res).toBeUndefined();
    });
    it("传入错误预期类型", function () {
        let res = checkType({ a: 3 }, { a: "D" } as any);
        expect(res).has.key("a");
    });
});
it("嵌套", function () {
    let res = checkType(
        { s: 3, i: { q: "s", y: null, c: undefined } },
        { s: "number", i: { q: "string", c: "undefined" } }
    );
    expect(res).toBeUndefined();
});
it("删除多余", function () {
    let obj: any = { s: 3, i: "s" };
    checkType(obj, { s: "number" });
    expect(obj).toEqual({ s: 3 });
    obj = { s: 3, i: "s" };
    checkType(obj, testFx.objCheckOnly({ s: "number" }));
    expect(obj).toEqual({ s: 3, i: "s" });

    obj = { a: 3, b: 8, c: "aa", e: { a: 7, s: null, q: "D" } };
    checkType(obj, { a: "number", e: { q: "string" } });
    expect(obj, "嵌套删除").toEqual({ a: 3, e: { q: "D" } });
});

describe("内置测试函数", function () {
    it("联合类型", function () {
        //联合类型
        expect(
            checkType(
                { s: 3, i: null },
                { s: testFx.unionType(["number", "string"]), i: testFx.unionType(["string", (a) => undefined]) }
            )
        ).toBeUndefined();
        expect(checkType({ s: 3 }, { s: testFx.unionType(["bigint", "string"]) })).has.key("s");
    });
    it("可选", function () {
        expect(checkType({ s: 3, i: "s" }, { s: "number", i: "string", q: optional("string") })).toBeUndefined();
        expect(checkType({ s: 3, i: "s", q: 8 }, { s: "number", i: "string", q: optional("string") })).has.keys(["q"]);
        expect(
            checkType({ s: 3, i: "s", q: "sd" }, { s: "number", i: "string", q: optional("string") })
        ).toBeUndefined();
    });
    it("数字范围", function () {
        let towToFour = testFx.numScope(2, 4);
        expect(checkType({ a: 2 }, { a: towToFour })).toBeUndefined();
        expect(checkType({ a: 3 }, { a: towToFour })).toBeUndefined();
        expect(checkType({ a: 4 }, { a: towToFour })).toBeUndefined();
        expect(checkType({ a: 5 }, { a: towToFour })).has.key("a");
        expect(checkType({ a: 1 }, { a: towToFour })).has.key("a");
        expect(checkType({ a: "d" }, { a: towToFour })).has.key("a");
        expect(checkType({ a: undefined }, { a: towToFour })).has.key("a");
        expect(checkType({ a: new Set() }, { a: towToFour })).has.key("a");
    });
    it("实例类型", function () {
        let mapIns = testFx.instanceof(Map);
        expect(checkType({ a: new Map() }, { a: mapIns })).toBeUndefined();
        expect(checkType({ a: null }, { a: mapIns })).has.key("a");
        expect(checkType({ a: NaN }, { a: mapIns })).has.key("a");
        expect(checkType({ a: undefined }, { a: mapIns })).has.key("a");
        expect(checkType({}, { a: mapIns })).has.key("a");
    });
    describe("数组类型判断", function () {
        it("数组类型判断", function () {
            let res = checkType({ a: [2, 4, 56, 78] }, { a: testFx.arrayType("number") });
            expect(res).toBeUndefined();

            res = checkType({ a: [2, 4, "d", 78] }, { a: testFx.arrayType("number") });
            expect(res?.a).has.keys([2]);
        });
        it("数组长度限制", function () {
            let res = checkType({ a: [2, 4, 56, 78] }, { a: testFx.arrayType("number", 2, true) });
            expect(res).toBeUndefined();

            res = checkType({ a: [2, 4, 56, 78] }, { a: testFx.arrayType("number", 2, false) });
            expect(res).has.key("a");
            expect(res.a).has.keys(["length"]);

            res = checkType({ a: [2, 4, "d", 78] }, { a: testFx.arrayType("number", 3, false) });
            expect(res).has.key("a");
            expect(res.a).has.keys([2, "length"]);
        });
    });
});
