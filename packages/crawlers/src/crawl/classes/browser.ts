import { webkit, chromium, firefox } from "playwright";
import type { BrowserContext, Browser } from "playwright";
// const iPhone = devices["iPhone 6"];
const setup = async () => {
    var browser = await createBrowser();
    const context = await browser.newContext({
        // ...iPhone,
    });
    context.on("close", () => console.log("close"));
    context.on("page", () => console.log("page"));
    const page = await context.newPage();
    // page.exposeFunction("asnowSend", (...args: any[]) => console.log(args)).then((val) => console.log(val + "dddd"));
    page.on("load", () => console.log("load"));
    page.on("close", () => browser.close());
    await page.exposeFunction("sha256", (text: any) => {
        console.log(text);
    });
    await page.goto("https://www.baidu.com");
};

export async function createBrowser() {
    const browser = await chromium.launch({
        // args: ["--disable-plugins"],
        headless: false,
        // devtools: true,
        channel: "msedge",

        ignoreDefaultArgs: ["--enable-automation"],

        // channel: "chrome-dev",
        // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        // ignoreDefaultArgs: ["--mute-audio"],
    });

    browser.on("disconnected", () => browser.close());
    return browser;
}
let bs: Browser | undefined;
export async function createContext() {
    if (bs) return bs.newContext();
    bs = await createBrowser();
    return bs.newContext();
}
