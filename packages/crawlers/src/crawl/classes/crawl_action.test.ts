import { describe, it, expect } from "vitest";
import { DeepAssignFilter, FilterIteratorFx } from "./crawl_action";

describe("DeepAssignFilter", function () {
    function g(list: boolean[]): FilterIteratorFx {
        return async function* g1() {
            for (let i = 0; i < list.length; i++) {
                yield list[i];
            }
        };
    }
    it("全部完成", async function () {
        const list = [g([true, true, true]), g([true, true]), g([true, true])];
        let expectCount = 3 + 3 * 2 + 3 * 2 * 2;

        let asf = new DeepAssignFilter(list);
        let count = 0;
        let iterator = asf.assign();
        do {
            let res = await iterator.next();
            if (res.done) break;

            count++;
        } while (true);

        expect(count).toEqual(expectCount);
        expect(asf.assignRes).toEqual([3, 2, 2]);
    });
    it("中途断开", async function () {
        const list = [g([true, true, true]), g([false, true]), g([true, true])];
        let asf = new DeepAssignFilter(list);
        let iterator = asf.assign();
        do {
            let res = await iterator.next();
            if (res.done) break;
            if (!res.value) break;
        } while (true);

        expect(asf.assignRes).toEqual([1, 1]);
    });
    it("中途断开", async function () {
        const list = [g([true, true, true]), g([true, false]), g([true, true])];
        let asf = new DeepAssignFilter(list);
        let iterator = asf.assign();
        do {
            let res = await iterator.next();
            if (res.done) break;
            if (!res.value) break;
        } while (true);

        expect(asf.assignRes).toEqual([1, 2, 2]);
    });
    it("跳过", async function () {
        const list = [g([true, true, true]), g([true, false]), g([true, true])];
        let asf = new DeepAssignFilter(list);
        let iterator = asf.assign();

        let lastRes: boolean = false;
        let count = 0;
        do {
            let res: IteratorResult<boolean, void> = await iterator.next(!lastRes);
            if (res.done) break;
            count++;
            lastRes = res.value;
        } while (true);

        expect(count).toEqual(3 + 3 * 2 + 3 * 2);
    });
});
