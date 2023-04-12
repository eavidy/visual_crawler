import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./modules/app.module";
import { HttpExceptionFilter } from "./filters/exp.filters";

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
    app.listen(3000, "0.0.0.0");
    app.useGlobalFilters(new HttpExceptionFilter());
    console.log("start:" + 3000);
}
bootstrap();
