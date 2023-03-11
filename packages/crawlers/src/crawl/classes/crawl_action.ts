export const ACTION_TIMEOUT = 1000; //playwright与浏览器交互的超时时间, 单位毫秒

export class DeepAssignFilter {
    readonly assignRes: number[]; //记录当前迭代数量
    constructor(private readonly list: readonly FilterIteratorFx[]) {
        this.assignRes = list.map(() => 0);
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
            if (res.done) {
                this.assignRes[index] = 0;
                return res.value;
            } else this.assignRes[index]++;
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
