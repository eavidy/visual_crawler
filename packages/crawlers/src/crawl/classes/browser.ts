import { chromium, Browser, LaunchOptions, BrowserContext } from "playwright";
declare let navigator: any;

export class CrawlerDevice {
  static async create(options?: LaunchOptions) {
    const defaultOptions = {
      args: ["--disable-plugins"],
      headless: true,
      channel: "chrome",
      ...options,
    };
    const browser = await chromium.launch(defaultOptions);

    browser.on("disconnected", function (this: Browser) {
      this.close();
    });
    return new this(browser, options);
  }
  private static device?: CrawlerDevice | Promise<CrawlerDevice>;
  static async newContext(): Promise<BrowserContext> {
    let deviceWait = this.device;
    if (!deviceWait) {
      deviceWait = this.create().then((bs) => {
        CrawlerDevice.device = bs;
        return bs;
      });
      this.device = deviceWait;
    }
    const device = await deviceWait;
    return device.newContext();
  }
  static async close() {
    let deviceWait = this.device;
    if (!deviceWait) return;
    const device = await deviceWait;
    return device.close();
  }

  private constructor(readonly browser: Browser, private options?: LaunchOptions) {}
  private randomNumber() {
    return Math.floor(Math.random() * 9);
  }
  async newContext() {
    const webkitVersion = this.randomNumber();
    const chromeVersion = this.randomNumber();
    const edgeVersion = this.randomNumber();
    const userAgent: Record<string, string> = {
      msedge: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.3${webkitVersion} (KHTML, like Gecko) Chrome/111.0.0.${chromeVersion} Safari/537.3${webkitVersion} Edg/111.0.1661.4${edgeVersion}`,
      chrome: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.3${webkitVersion} (KHTML, like Gecko) Chrome/111.0.0.${chromeVersion} Safari/537.3${webkitVersion}`,
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
export type { BrowserContext, Page } from "playwright";
