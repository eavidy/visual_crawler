type Obj = Record<string | number | symbol, any>;

export function patchObject(from: Obj, to: Obj) {
    for (const [key, val] of Object.entries(from)) {
        if (typeof val === "object") {
            if (val === null) to[key] = null;
            let toObj = to[key];
            if (typeof toObj !== "object" || toObj === null) to[key] = val;
            else patchObject(val, toObj);
        } else to[key] = val;
    }
    return from;
}
export function groupBy<Key, T extends Obj>(data: T[], key: keyof T) {
    let res = new Map<Key, T[]>();
    for (const it of data) {
        let id = it[key] as Key;
        let group = res.get(id);
        if (!group) {
            group = [];
            res.set(id, group);
        }
        group.push(it);
    }
    return res;
}

export function removeUndefined<T extends Obj>(obj: T, deep = true): T {
    for (const key of Object.keys(obj)) {
        let val = obj[key];
        if (val === undefined) delete obj[key];
        if (deep && typeof val === "object" && val !== null) removeUndefined(val);
    }
    return obj;
}
