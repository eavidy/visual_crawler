import { DeepAssignFilter, FilterIteratorFx } from "./crawl_action.js";
import { it, describe, expect } from "vitest";

async function* d(skipCount = 0) {
    let val = [true, true, true, true, true];
    for (let i = skipCount; i < val.length; i++) {
        yield val[i];
    }
    return true;
}
const iteratorFx: FilterIteratorFx[] = [d, d];
describe("DeepAssignFilter", function () {
    it("总数计算", function () {
        let assign = new DeepAssignFilter(iteratorFx, [5, 5]);
        expect(assign.total).toEqual(30);
    });
    it("次数正确", async function () {
        let assign = new DeepAssignFilter(iteratorFx, [5, 5]);
        let itv = assign.assign();
        let res;
        let count = 0;
        do {
            res = await itv.next(false);
            if (!res.done) count++;
        } while (!res.done);

        expect(count).toEqual(assign.total);
        expect(assign.assignRes).toEqual([5, 5]);
    });
    describe("使用skpList", function () {
        it("使用skipList", async function () {
            let assign = new DeepAssignFilter(iteratorFx, [5, 5]);
            let itv = assign.assign([3, 0]);

            await itv.next(false); //-1
            await itv.next(false); //-1
            expect(assign.assignRes).toEqual([4, 1]);

            let res;
            do {
                res = await itv.next(false);
            } while (!res.done);
            expect(assign.assignRes).toEqual([5, 5]);
        });
        it("skipList同时skipDeep", async function () {
            let assign = new DeepAssignFilter(iteratorFx, [5, 5]);
            let itv = assign.assign([3, 1]);

            await itv.next(false); //-1
            await itv.next(true); //-1
            expect(assign.assignRes).toEqual([5, 0]);
            await itv.next(false); //-1
            expect(assign.assignRes).toEqual([5, 1]);
        });
    });
});
