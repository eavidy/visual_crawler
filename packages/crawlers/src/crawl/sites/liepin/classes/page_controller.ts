import { Page } from "playwright";
export class PageNumController {
    constructor(readonly page: Page) {}
    async getCurrentPage() {
        const handler = this.page.locator(`.list-pagination-box>.ant-pagination-item-active`);
        let pageIndex = await handler.getAttribute("tabindex");
        return pageIndex ? pageIndex + 1 : null;
    }
    async gotoPage(num: number) {
        const handler = this.page.locator(`.list-pagination-box>.ant-pagination-item[title='${num}']`);
        await handler.click();
    }

    private getNextButton() {
        return this.page.locator(".list-pagination-box>.ant-pagination-next");
    }
    async hasNextPage() {
        const handler = this.getNextButton();
        let className = await handler.getAttribute("class");
        if (!className) return false;
        if (className.includes("ant-pagination-disabled")) return false;
        return true;
    }
    async nextPage() {
        const handler = this.getNextButton();
        return await handler.click();
    }
}
