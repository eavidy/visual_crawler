import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./modules/app.module";
import { HttpExceptionFilter } from "./filters/exp.filter";
import { LoggerInterceptor } from "./interceptors/logger.interceptor";
import * as config from "./config";
import { loggerMiddleware } from "./middlewares/logger.middleware";

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

    let prot: number;
    switch (config.MODE) {
        case "dev":
            app.useGlobalFilters(new HttpExceptionFilter());
            prot = 3000;
            break;
        case "prod":
            app.use(loggerMiddleware); //首页访问日志
            prot = 80;
            break;
        default:
            throw new Error("请通过环境变量设置MODE正确的值");
    }
    if (config.LOGS_DIR) app.useGlobalInterceptors(new LoggerInterceptor());

    app.listen(prot, "0.0.0.0");
    console.log("start:" + prot);
}
bootstrap();
