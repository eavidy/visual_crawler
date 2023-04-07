import * as argParser from "./classes/parse_args";
const args = argParser as ProcessArgs;

interface ProcessArgs {
    /** 运行方式 默认 childProcess*/
    runType?: "db" | "net" | "childProcess";
}

async function check() {
    switch (args.runType) {
        case "db":
            await import("./runner/manual");
            break;
        case "net":
            await import("./runner/net_connect");
            break;
        default:
            await import("./runner/child_process");
            break;
    }
}

check();
