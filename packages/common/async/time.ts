export function waitTime(time: number) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

export class WaitTime {
    readonly startTime: number;
    private id?: NodeJS.Timeout;
    constructor(readonly time: number) {
        this.startTime = new Date().getTime();
        this.id = setTimeout(this.timeout.bind(this), time);
    }
    private timeout() {
        for (const fx of this.fxList!) fx();
        this.fxList = undefined;
        this.id = undefined;
    }
    /** 执行中断后, 如果再添加then函数, 则直接触发 */
    clear() {
        if (this.id) {
            clearTimeout(this.id);
            this.fxList = undefined;
            this.id = undefined;
        }
    }
    /** 剩余触发时间 */
    get residue() {
        let haveBeenWaiting = new Date().getTime() - this.startTime;
        return this.time - haveBeenWaiting;
    }
    private fxList? = new Set<() => void>();
    then(res: () => any) {
        if (!this.fxList) {
            res();
            return;
        }
        this.fxList.add(res);
    }
}

/**
 *  @param threshold 阈值 0~1之间的浮点数, 约接近0 随机数接近min的概率更高
 */
export function radomTime(min: number, max: number, threshold?: number): number {
    let number = min + (max - min) * Math.random();
    return Math.round(number);
}
export function radomWaitTime(...args: Parameters<typeof radomTime>) {
    return new WaitTime(radomTime(...args));
}
