import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as Path from "node:path";
const rootPath = Path.resolve(require.main!.path, "..", "public");

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath,
            renderPath: "/v/*",
        }),
    ],
})
export class ViewModule {
    constructor() {}
}
