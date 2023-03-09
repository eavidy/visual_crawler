import { describe, expect, it } from "vitest";
import { WaitTime, waitTime } from "./time";

describe("WaitTime", function () {
    it("正确定时", async function () {
        let time = new WaitTime(500);
        let value = true;
        await waitTime(400);
        time.then(() => {
            value = false;
        });
        expect(value).toBeTruthy();
        await waitTime(110);
        expect(value).toBeFalsy();
    });
    it("thenable", async function () {
        let time = new WaitTime(500);
        let value = true;
        await waitTime(200);
        await time;
        expect(value).toBeTruthy();
    });
    it("中断触发", async function () {
        let time = new WaitTime(500);
        let value = true;
        time.then(() => {
            value = false;
        });
        await waitTime(100);
        time.clear();
        await waitTime(500);
        expect(value).toBeTruthy();
    });
});
