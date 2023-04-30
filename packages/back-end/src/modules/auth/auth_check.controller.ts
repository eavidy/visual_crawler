import { Controller, Post, UseGuards } from "@nestjs/common";
import { authGuard } from "./grand";

@UseGuards(authGuard)
@Controller()
export class AuthenticationController {
    constructor() {}

    @Post("visit_page")
    async pageIsVisibility(): Promise<void> {}
}
