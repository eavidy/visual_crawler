import { it, describe, expect } from "vitest";
import { parseProcessArgs } from "./parse_args.js";

describe("parseProcessArgs", function () {
    it("无参", function () {
        expect(parseProcessArgs([])).toEqual({ default: [], map: {} });
    });
    it("无key", function () {
        expect(parseProcessArgs(["sg", "dg"])).toEqual({ default: ["sg", "dg"], map: {} });
    });
    describe("boolean参数", function () {
        it("纯布尔", function () {
            expect(parseProcessArgs(["-a", "-b"])).toEqual({ default: [], map: { a: true, b: true } });
        });
        it("连续的", function () {
            expect(parseProcessArgs(["-abc"])).toEqual({ default: [], map: { a: true, b: true, c: true } });
        });
        it("带参数", function () {
            expect(parseProcessArgs(["-a", "1"])).toEqual({ default: [], map: { a: "1" } });
        });
        it("连续且带参数", function () {
            expect(parseProcessArgs(["-abc", "1"])).toEqual({
                default: [],
                map: { a: true, b: true, c: "1" },
            });
        });
    });
    describe("键值对", function () {
        it("纯布尔", function () {
            expect(parseProcessArgs(["--aa", "--bb"])).toEqual({ default: [], map: { aa: true, bb: true } });
        });

        it("带参数", function () {
            expect(parseProcessArgs(["--aa", "1"])).toEqual({ default: [], map: { aa: "1" } });
        });
    });
    it("混合", function () {
        expect(parseProcessArgs(["sg", "-ab", "dg", "--sc", "1", "2"])).toEqual({
            default: ["sg", "2"],
            map: { a: true, b: "dg", sc: "1" },
        });
    });
});
