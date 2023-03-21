export const ACTION_TIMEOUT = 1000; //playwright与浏览器交互的超时时间, 单位毫秒

export class DeepAssignFilter {
    readonly assignRes: number[]; //记录当前迭代数量
    constructor(private readonly list: readonly FilterIteratorFx[], readonly index: readonly number[] = []) {
        this.assignRes = list.map((_, i) => 0);
        this.lev = DeepAssignFilter.excLev(index);
        this.total = DeepAssignFilter.excCount(index, this.lev);
    }
    readonly total: number;
    /**
     * 次数指数, 如计算 a=[2,2,2] 得到[4, 2, 1] ,表示当a[0] 每增加1 会迭代4次
     */
    private readonly lev: number[];
    /** 获取当前进度 */
    getCurrent() {
        return DeepAssignFilter.excCount(this.assignRes, this.lev);
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

        let skinCount = skinList?.[index];
        this.assignRes[index] = skinCount ?? 0;

        let generator = list[index](skinCount);
        do {
            let isLast = index + 1 === list.length;
            let res = await generator.next();
            if (res.done) return res.value;
            else this.assignRes[index]++;
            let stop = yield { value: res.value, isLast };
            if (!stop && !isLast) yield* this.assign(skinList, index + 1);
            else this.setZero(index + 1); //修改assignRes
            skinList = undefined;
        } while (true);
    }
    private setZero(i: number) {
        for (; i < this.assignRes.length; i++) {
            this.assignRes[i] = 0;
        }
    }

    static excLev(list: readonly number[]) {
        let lev: number[] = [];
        for (let i = 0; i < list.length - 1; i++) {
            let val = list[i + 1];
            for (let j = i + 2; j < list.length; j++) {
                val *= list[i];
            }
            lev[i] = val;
        }
        lev.push(1);
        return lev;
    }
    /** 计算迭代总次数 */
    static excCount(list: readonly number[], lev: readonly number[]) {
        let total = 0;
        for (let i = 0; i < list.length; i++) {
            total += list[i] * lev[i];
        }
        return total;
    }
}
export async function* listIterator(list: FilterIteratorFx[]) {
    for (const fx of list) yield* fx();
}

/**
 * @param skipCount 要跳过操作的数量
 */
export type FilterIteratorFx = (skipCount?: number) => AsyncGenerator<boolean, boolean, void>;
