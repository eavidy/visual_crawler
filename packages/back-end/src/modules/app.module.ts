import { Module } from "@nestjs/common";
import { ApiModule } from "./api/api.module";
import { ViewModule } from "./view/view.module";
import { AuthModule } from "./auth/auth.module";

@Module({
    imports: [ApiModule, ViewModule, AuthModule],
    controllers: [],
    providers: [],
})
export class AppModule {
    constructor() {}
}
