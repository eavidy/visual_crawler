import { Controller, Headers, Post } from "@nestjs/common";
import { authGuard } from "./grand";
import { IncomingHttpHeaders } from "node:http";

@Controller()
export class AuthenticationController {
    constructor() {}

    @Post("visit_page")
    async pageIsVisibility(@Headers() headers: IncomingHttpHeaders): Promise<void> {
        await authGuard.parseToken(headers);
    }
}
