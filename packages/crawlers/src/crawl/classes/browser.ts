import { chromium, Browser, LaunchOptions } from "playwright";

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

  private constructor(
    readonly browser: Browser,
    private options?: LaunchOptions,
  ) {}
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
