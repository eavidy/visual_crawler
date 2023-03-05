/**
 * @param deleteSurplus 如果doc中的key不存在test中, 则将其删除
 */
function checkObject(doc: Record<string, any>, except: ExceptTypeMap, deleteSurplus = true) {
    let errors: Record<string, any> = {};
    let keys = deleteSurplus ? new Set(Object.keys(doc)) : undefined;

    for (let [testKey, exceptType] of Object.entries(except)) {
        if (exceptType instanceof OptionalKey) {
            if (!Object.hasOwn(doc, testKey)) continue;
            exceptType = exceptType.type;
        }
        let res = checkType(doc[testKey], exceptType);
        if (res) errors[testKey] = res;
        keys?.delete(testKey);
    }
    if (keys?.size) for (const key of keys) delete doc[key];
    if (Object.keys(errors).length) return errors;
}
function checkTuple(arr: any[], except: ExceptType[], deleteSurplus = true) {
    let errors: any[] = [];
    if (Array.isArray(arr)) {
        let maxLen = except.length;
        if (arr.length != except.length) {
            if (arr.length > except.length && deleteSurplus) arr.length = except.length;
            else {
                if (arr.length < except.length) maxLen = except.length;
                errors.push(`预期长度: ${except.length}, 实际: ${arr.length}`);
            }
        }
        for (let i = 0; i < maxLen; i++) {
            let exceptType = except[i];
            let actualType = arr[i];
            let res = checkType(actualType, exceptType);
            if (res) errors[i] = res;
        }
    } else errors.push(createErrDest("Array", getClassType(arr)));

    if (errors.length) return errors;
}
export function checkType(val: any, exceptType: ExceptType): undefined | string | any {
    switch (typeof exceptType) {
        case "string":
            let actType = getBasicType(val);
            if (actType !== exceptType) return createErrDest(exceptType, actType);
            break;
        case "function":
            if (exceptType.type && typeof val !== exceptType.type) return createErrDest(exceptType.type, typeof val);
            return exceptType(val);
        case "object":
            if (exceptType === null) throw new Error("预期类型错误");
            else if (Array.isArray(exceptType)) return checkTuple(val, exceptType);
            else if (getBasicType(val) === "object") return checkObject(val, exceptType as ExceptTypeMap);
            else return createErrDest("object", val === null ? "null" : typeof val);
        default:
            throw new Error("传入参数2类型错误");
    }
}

/** 在typeof之上区分null */
function getBasicType(val: any): VabBasicType {
    return val === null ? "null" : typeof val;
}
function getClassType(val: any) {
    let basicType = getBasicType(val);
    if (basicType === "object") {
        let type: string = val.__proto__?.constructor?.name ?? "Object";
        return type;
    } else return basicType;
}
function createErrDest(exceptType: string, actType: string) {
    return "预期类型:" + exceptType + ", 实际:" + actType;
}

class OptionalKey {
    constructor(public readonly type: ExceptType) {}
}

export function optional(type: ExceptType) {
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
    unionType(types: ExceptType[]): TestFx {
        function testFx(val: any) {
            let errors: string[] = [];
            for (const type of types) {
                let res = checkType(val, type);
                if (res === undefined) return;
                errors.push(res);
            }
            return errors;
        }
        return testFx;
    },
    arrayType(type: ExceptType, length?: number, deleteSurplus = true): TestFx {
        function testFx(val: any) {
            if (Array.isArray(val)) {
                let errCount = 0;
                let errors: any = {};
                if (length !== undefined && length !== val.length) {
                    if (deleteSurplus) val.length = length;
                    else {
                        errors.length = `预期长度: ${length}, 实际: ${val.length}`;
                        errCount++;
                    }
                }
                for (let i = 0; i < val.length; i++) {
                    let item = val[i];
                    let res = checkType(item, type);
                    if (res) {
                        errors[i] = res;
                        errCount++;
                    }
                }
                if (errCount) return errors;
            } else return createErrDest("Array", getClassType(val));
        }
        testFx.type = "object";
        return testFx;
    },
    objCheckOnly(type: ExceptTypeMap, deleteSurplus = false) {
        return function testFx(val: any) {
            return checkObject(val, type, deleteSurplus);
        };
    },
    tupleCheckOnly(type: ExceptType[], deleteSurplus = false) {
        return function testFx(val: any) {
            return checkTuple(val, type, deleteSurplus);
        };
    },
    any(): TestFx {
        return function testFx() {};
    },
};
export type ExceptTypeMap = { [key: string | number]: ExceptType };
export type ExceptType = TestFx | OptionalKey | VabBasicType | ExceptTypeMap | ExceptType[];
type VabBasicType =
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function"
    | "null";
