/**
 * @param deleteSurplus 如果doc中的key不存在test中, 则将其删除
 */
export function testObjectField(doc: Record<string, any>, test: TestTypeMap, deleteSurplus = true) {
    let errors: Record<string, any> = {};
    let keys = deleteSurplus ? new Set(Object.keys(doc)) : undefined;

    for (let [testKey, exceptType] of Object.entries(test)) {
        if (exceptType && typeof exceptType === "object" && exceptType instanceof OptionalKey) {
            if (!Object.hasOwn(doc, testKey)) continue;
            exceptType = exceptType.type;
        }
        let res = fieldTest(doc[testKey], exceptType);
        if (res) errors[testKey] = res;
        keys?.delete(testKey);
    }
    if (keys?.size) for (const key of keys) delete doc[key];
    if (Object.keys(errors).length) return errors;
}
function createErrDest(exceptType: string, actType: string) {
    return "预期类型:" + exceptType + ", 实际:" + actType;
}
function fieldTest(val: any, exceptType: TestType, deleteSurplus = false): undefined | string | any {
    switch (typeof exceptType) {
        case "string":
            if (typeof val !== exceptType) return createErrDest(exceptType, typeof val);
            break;
        case "function":
            if (exceptType.type && typeof val !== exceptType.type) return createErrDest(exceptType.type, typeof val);
            return exceptType(val);
        case "object":
            if (Array.isArray(exceptType)) {
                let resList: any[] = [];
                for (const item of exceptType) {
                    let res = fieldTest(val, item);
                    if (res) resList.push(res);
                    else return undefined;
                }
                return resList;
            } else if (exceptType === null) throw new Error("预期类型错误");
            else if (val && typeof val === "object") return testObjectField(val, exceptType as TestTypeMap);
            else return createErrDest("object", val === null ? "null" : typeof val);
        default:
            throw new Error("预期类型错误");
    }
}
class OptionalKey {
    constructor(public readonly type: TestType) {}
}

export function optional(type: TestType) {
    return new OptionalKey(type);
}
optional.number = new OptionalKey("number");
optional.string = new OptionalKey("string");

interface TestFx {
    (val: any): any;
    type?: string;
}
export const testFx = {
    numScope(min: number, max = Infinity): TestFx {
        function testFx(val: any) {
            if (val > max || val < min) return `超过范围:[${min},${max}], 值为:${val}`;
        }
        testFx.type = "number";
        return testFx;
    },
    instanceof(obj: Function): TestFx {
        function testFx(val: any) {
            if (val === null || !(val instanceof obj)) {
                return createErrDest(obj.name, val === null ? "null" : val.constructor.name);
            }
        }
        testFx.type = "object";
        return testFx;
    },
    any(): TestFx {
        return function testFx() {};
    },
};
export type TestTypeMap = { [key: string]: TestType };
type TestType = TestFx | OptionalKey | VabBasicType | TestTypeMap | TestType[];
type VabBasicType = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
