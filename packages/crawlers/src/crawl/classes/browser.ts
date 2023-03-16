import { chromium, Browser, LaunchOptions } from "playwright";

const chromePath = process.argv[2];
let opt: LaunchOptions | undefined = chromePath
    ? {
          executablePath: chromePath,
      }
    : undefined;
export async function createBrowser() {
    const browser = await chromium.launch({
        args: ["--disable-plugins"],
        headless: true,
        // devtools: true,
        // channel: "chrome-dev",
        // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        ...opt,
    });

    browser.on("disconnected", () => browser.close());
    return browser;
}
export async function getBrowser() {
    if (!bs) bs = await createBrowser();
    return bs;
}
let bs: Browser | undefined;
export async function createContext() {
    if (bs) return bs.newContext();
    bs = await createBrowser();
    return bs.newContext();
}
export async function closeBrowser() {
    bs?.close();
    bs = undefined;
}
