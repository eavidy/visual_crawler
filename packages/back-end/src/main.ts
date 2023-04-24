import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./modules/app.module";
import { HttpExceptionFilter } from "./filters/exp.filters";
const PORT = process.env.MODE === "dev" ? 3000 : 80;
async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
    app.listen(PORT, "0.0.0.0");
    app.useGlobalFilters(new HttpExceptionFilter());
    if (process.env.PROD) console.log("start:" + PORT);
}
bootstrap();
