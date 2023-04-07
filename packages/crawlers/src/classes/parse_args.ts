export function parseNodeArgs() {
    return parseProcessArgs(process.argv.slice(2));
}
export function parseProcessArgs(args: string[]) {
    let map: Record<string, boolean | string> = {};
    let defArg: string[] = [];
    for (let i = 0; i < args.length; i++) {
        let arg = args[i];
        let next = args[i + 1];
        if (arg.length > 1 && arg[0] === "-") {
            if (arg[1] === "-") {
                let key = arg.slice(2);
                if (!next || (next !== "-" && next !== "--" && next[0] === "-")) map[key] = true;
                else {
                    map[key] = next;
                    i++;
                }

                continue;
            } else {
                let key = arg.slice(1);
                if (next && next[0] !== "-") {
                    let lastChar = arg[arg.length - 1];
                    map[lastChar] = args[++i];
                    key = key.slice(0, key.length - 1);
                }
                for (let j = 0; j < key.length; j++) map[key[j]] = true;
                continue;
            }
        }
        defArg.push(arg);
    }
    return { default: defArg, map };
}

export const args = parseNodeArgs().map;
