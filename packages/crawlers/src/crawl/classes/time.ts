import { TimeoutPromise } from "@asnc/tslib/async";

/**
 *  @param threshold 阈值 0~1之间的浮点数, 约接近0 随机数接近min的概率更高
 */
export function radomTime(min: number, max: number, threshold?: number): number {
    let number = min + (max - min) * Math.random();
    return Math.round(number);
}
export function radomWaitTime(...args: Parameters<typeof radomTime>) {
    return new TimeoutPromise(radomTime(...args));
}
