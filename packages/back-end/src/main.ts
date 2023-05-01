import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./modules/app.module";
import { HttpExceptionFilter } from "./filters/exp.filter";
import { LoggerInterceptor } from "./interceptors/logger.interceptor";
import * as config from "./config";
import { loggerMiddleware } from "./middlewares/logger.middleware";

const PORT = config.MODE === "dev" ? 3000 : 80;
async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
    app.listen(PORT, "0.0.0.0");
    if (config.MODE === "dev") {
        app.use(loggerMiddleware); //首页访问日志
        app.useGlobalFilters(new HttpExceptionFilter());
    }
    if (config.LOGS_DIR) app.useGlobalInterceptors(new LoggerInterceptor());
    console.log("start:" + PORT);
}
bootstrap();
