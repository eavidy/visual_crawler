export function patchObject(from: Record<string | number | symbol, any>, to: Record<string | number | symbol, any>) {
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
export function groupBy<Key, T extends {}>(data: T[], key: keyof T) {
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
