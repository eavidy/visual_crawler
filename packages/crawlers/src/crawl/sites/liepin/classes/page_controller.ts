import { ACTION_TIMEOUT } from "../../../../crawl/classes/crawl_action.js";
import { Page } from "playwright";
export abstract class PageNumControllable {
    constructor(readonly page: Page) {}
    async getCurrentPage() {
        const handler = this.page.locator(`.list-pagination-box>.ant-pagination-item-active`);
        let pageIndex = await handler.getAttribute("tabindex", { timeout: ACTION_TIMEOUT });
        return pageIndex ? pageIndex + 1 : null;
    }
    async gotoPage(num: number) {
        const handler = this.page.locator(`.list-pagination-box>.ant-pagination-item[title='${num}']`);
        await handler.click({ timeout: ACTION_TIMEOUT });
    }

    private getNextButton() {
        return this.page.locator(".list-pagination-box .ant-pagination-next");
    }
    async hasNextPage(): Promise<boolean | never> {
        const handler = this.getNextButton();
        let className = await handler.getAttribute("class", { timeout: ACTION_TIMEOUT }).catch(() => {});
        if (!className) return false;
        if (className.includes("ant-pagination-disabled")) return false;
        return true;
    }
    async nextPage() {
        const handler = this.getNextButton();
        await handler.click({ timeout: ACTION_TIMEOUT });
    }
    async isAuth() {
        return /safe.liepin.com\/page\/liepin\/captchaPage_ip_PC/.test(this.page.url());
    }
    async close() {
        return this.page.close();
    }
    async refresh() {
        return this.page.reload();
    }
    abstract pageNumIterator(errors: any[]): AsyncGenerator<boolean, void, void>;
}
