import { BrowserContext, Page } from "playwright";
import { EventEmitter } from "node:events";
import { SiteTag } from "api/model";

declare let navigator: any;
async function createPage(ct: BrowserContext) {
    const page = await ct.newPage();
    page.addInitScript(function () {
        function getter() {
            return false;
        }
        Object.defineProperty(navigator.__proto__, "webdriver", { configurable: true, enumerable: true, get: getter });

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
    return page;
}

/**
 * @event data
 * @event errData PageCrawlError[]
 */
export abstract class PageCrawl extends EventEmitter {
    constructor(protected context: BrowserContext) {
        super();
    }
    abstract readonly siteTag: SiteTag;
    protected async newPage() {
        const page = createPage(this.context);
        return page;
    }
    readonly errors: PageCrawlError[] = [];
    reportError<T extends PageCrawlError>(err: T) {
        this.errors.push(err);
    }
    /** 当前页面完成, 处理异常 */
    protected pageCrawlFin(data: any) {
        const errors = this.errors;
        (this as any).errors = [];
        this.emit("data", data);
        if (errors.length) this.emit("errData", errors);
    }

    protected page: Page | undefined;
    async close() {
        if (this.page) {
            return this.page.close();
        }
    }
}

interface PageCrawlError {
    msg: string;
}
