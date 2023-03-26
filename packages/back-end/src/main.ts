import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, new FastifyAdapter());
    app.listen(3000, "0.0.0.0");
    console.log("start:" + 3000);
}
bootstrap();
