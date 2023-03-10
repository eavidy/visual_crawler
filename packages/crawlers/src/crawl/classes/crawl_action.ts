export const ACTION_TIMEOUT = 1000; //playwright与浏览器交互的超时时间, 单位毫秒

export class DeepAssignFilter {
    readonly assignRes: number[] = []; //记录当前迭代数量
    constructor(private readonly list: readonly FilterIteratorFx[]) {}
    /**
     * @description 组合深度迭代生成器列表
     * @generator 如果迭代时出现异常, 则yield false, 否则yield true   如果执行 next() 时 传入true, 则跳过深度迭代
     * @param skinList 传入每个生成器的skinCount
     * @deprecated
     */
    async *assignFromLast(skinList?: readonly number[], index = 0): AsyncGenerator<boolean, boolean, boolean> {
        let list = this.list;
        this.assignRes[index] = 0;

        let skinCount = skinList?.[index];
        let generator = list[index](skinCount);

        let stop = false;
        do {
            if (!stop && index + 1 < list.length) yield* this.assignFromLast(skinList, index + 1);
            let res = await generator.next();
            if (res.done) return res.value;

            this.assignRes[index]++;
            stop = yield res.value;
        } while (true);
    }
    /**
     * @deprecated
     */
    async *assign2(skinList?: readonly number[]): AsyncGenerator<{ value: boolean; isLast: boolean }, void, boolean> {
        let list = this.list.map((fx, index) => fx(skinList?.[index]));
        for (let i = 0; i < list.length; i++) {
            let ge = list[i];
            let nextVal = await ge.next();
            let ct = yield { value: nextVal.value, isLast: i + 1 === list.length };
            if (ct) break;
        }
        yield* this.deep(list, 0);
    }
    async *deep(
        list: AsyncGenerator<boolean, boolean, void>[],
        index: number
    ): AsyncGenerator<{ value: boolean; isLast: boolean }, boolean, boolean> {
        let generator = list[index];
        let stop = false;
        do {
            let isLast = index + 1 === list.length;
            if (!stop && !isLast) yield* this.deep(list, index + 1);
            let res = await generator.next();
            if (res.done) return res.value;

            this.assignRes[index]++;
            stop = yield { value: res.value, isLast };
        } while (true);
    }

    /**
     * @description 组合深度迭代生成器列表
     * @generator 如果迭代时出现异常, 则yield false, 否则yield true   如果执行 next() 时 传入true, 则跳过深度迭代
     * @param skinList 传入每个生成器的skinCount
     */
    async *assign(
        skinList?: readonly number[],
        index = 0
    ): AsyncGenerator<{ value: boolean; isLast: boolean }, boolean, boolean> {
        let list = this.list;
        this.assignRes[index] = 0;

        let skinCount = skinList?.[index];
        let generator = list[index](skinCount);
        do {
            let isLast = index + 1 === list.length;
            let res = await generator.next();
            if (res.done) return res.value;

            this.assignRes[index]++;
            let stop = yield { value: res.value, isLast };
            if (!stop && !isLast) yield* this.assign(skinList, index + 1);
        } while (true);
    }
}
export async function* listIterator(list: FilterIteratorFx[]) {
    for (const fx of list) yield* fx();
}

/**
 * @param skipCount 要跳过操作的数量
 */
export type FilterIteratorFx = (skipCount?: number) => AsyncGenerator<boolean, boolean, void>;
