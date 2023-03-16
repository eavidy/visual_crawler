import { chromium, Browser, LaunchOptions } from "playwright";

declare let navigator: any;

export class CrawlerDevice {
    static async create() {
        const options = {
            args: ["--disable-plugins"],
            headless: true,
            // devtools: true,
            // channel: "msedge",
            // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
            executablePath: process.argv[2],
        };
        const browser = await chromium.launch(options);

        browser.on("disconnected", () => browser.close());
        return new this(browser, options);
    }
    private static dvc?: CrawlerDevice | Promise<CrawlerDevice>;
    static async newContext() {
        if (!this.dvc) {
            let pms = this.create().then((bs) => {
                CrawlerDevice.dvc = bs;
                return bs;
            });
            this.dvc = pms;
        }
        let bs = this.dvc instanceof Promise ? await this.dvc : this.dvc;
        return bs.newContext();
    }
    static async close() {
        if (!this.dvc) return;

        let bs = this.dvc;
        this.dvc = undefined;
        if (bs instanceof Promise) {
            return (await bs).close();
        } else return bs.close();
    }

    private constructor(readonly browser: Browser, private options?: LaunchOptions) {}
    async newContext() {
        const userAgent: Record<string, string> = {
            msedge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.41",
            chrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
            firefox: "",
        };
        const context = await this.browser.newContext({
            userAgent: userAgent[this.options?.channel ?? "chrome"],
        });
        context.addInitScript(function () {
            function getter() {
                return false;
            }
            Object.defineProperty(navigator.__proto__, "webdriver", {
                configurable: true,
                enumerable: true,
                get: getter,
            });

            const primitiveToString = Function.prototype.toString;
            function toString(this: any) {
                if (this === getter) {
                    return "function get webdriver() { [native code] }";
                } else if (this === toString) {
                    return "function toString() { [native code] }";
                }
                return primitiveToString.call(this);
            }
            Function.prototype.toString = toString;
            console.log("de webdriver");
        });
        return context;
    }
    close() {
        return this.browser.close();
    }
}
