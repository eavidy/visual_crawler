import { Page } from "playwright";

export const ACTION_TIMEOUT = 1000; //playwright与浏览器交互的超时时间, 单位毫秒

export class DeepAssignFilter {
    readonly assignRes: number[] = []; //记录当前迭代数量
    constructor(private readonly list: readonly FilterIteratorFx[]) {}
    /**
     * @description 组合深度迭代生成器列表
     * @generator 如果迭代时出现异常, 则yield false, 否则yield true   如果执行 next() 时 传入true, 则跳过深度迭代
     * @param skinList 传入每个生成器的skinCount
     */
    async *assign(skinList?: readonly number[], index = 0): AsyncGenerator<boolean, void, boolean> {
        let list = this.list;
        this.assignRes[index] = 0;

        let generator = list[index](skinList?.[index]);
        do {
            let res = await generator.next();
            if (res.done) return res.value;

            this.assignRes[index]++;
            let stop = yield res.value;
            if (!stop && index + 1 < list.length) yield* this.assign(skinList, index + 1);
        } while (true);
    }
}
export async function* listIterator(list: FilterIteratorFx[]) {
    for (const fx of list) yield* fx();
}

/**
 * @param skipCount 要跳过操作的数量
 */
export type FilterIteratorFx = (skipCount?: number) => AsyncGenerator<boolean, void, void>;
