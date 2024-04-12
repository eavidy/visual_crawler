import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  InternalServerErrorException,
} from "@nestjs/common";
import type { FastifyRequest, FastifyReply } from "fastify";

@Catch(Error)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(error: HttpException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    if (error instanceof HttpException) this.rep(response, error);
    else if (error instanceof Error) {
      this.rep(
        response,
        new InternalServerErrorException({
          message: error.message,
          cause: error.cause,
          stack: error.stack,
        } as Error),
      );
    }
  }
  rep(response: FastifyReply, error: HttpException) {
    response.status(error.getStatus());
    response.send(error.getResponse());
  }
}
