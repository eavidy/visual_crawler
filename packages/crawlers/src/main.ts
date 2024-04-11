import * as argParser from "./classes/parse_args.js";
const args = argParser as ProcessArgs;

interface ProcessArgs {
    /** 运行方式 默认 childProcess*/
    runType?: "db" | "net" | "childProcess";
}

async function check() {
    switch (args.runType) {
        case "db":
            await import("./runner/manual.js");
            break;
        case "net":
            await import("./runner/net_connect.js");
            break;
        default:
            await import("./runner/child_process.js");
            break;
    }
}

check();
