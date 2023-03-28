import { Module } from "@nestjs/common";
import { ApiModule } from "./api/api.module";
import { ViewModule } from "./view/view.module";

@Module({
    imports: [ApiModule, ViewModule],
    controllers: [],
    providers: [],
})
export class AppModule {
    constructor() {}
}
