import { EventEmitter } from "node:events";
if (!process.send) {
    console.log("当前进程需要通过crawl_process_handle启动");
    process.exit();
}

/**
 * @event createCrawler {id:number}
 */
class ParentProcess extends EventEmitter {
    static sendParent(type: string, data: any) {
        return new Promise<void>(function (resolve, reject) {
            process.send!({ type, data }, undefined, undefined, function (error) {
                if (error) reject(error);
                else resolve();
            });
        });
    }
    send(type: string, data: any) {
        return ParentProcess.sendParent(type, data);
    }
    constructor() {
        super();
        this.initEvent();
    }
    private initEvent() {
        process.on("message", ({ type, data }: { type: string; data: any }) => {
            this.emit(type, data);
        });
    }
}
const parent = new ParentProcess();

// parent.on("");
