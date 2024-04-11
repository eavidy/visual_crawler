import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Observable } from "rxjs";
import { visitLogger, LogType, VisitInfo } from "../classes/visit_logger.js";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor() {}
  async getReqInfo(req: FastifyRequest, response: FastifyReply): Promise<VisitInfo> {
    const headers = req.headers;
    await response;
    return {
      srcIp: req.ip,
      header: {
        host: headers.host,
        referer: headers.referer,
        userAgent: headers["user-agent"],
      },
      url: req.url,
      statusCode: response.statusCode,
    };
  }
  async setLog(request: FastifyRequest, response: FastifyReply) {
    const url = request.url;
    if (url.startsWith("/api/")) return;

    let logType: LogType;
    let extra: any;
    if (url.startsWith("/auth/login")) {
      logType = LogType.login;
      let body = request.body as any;
      extra = { userName: body?.userId };
    } else if (url.startsWith("/auth/visit_page")) logType = LogType.other;
    else return;

    const reqInfo = await this.getReqInfo(request, response);
    if (extra) reqInfo.extra = extra;
    visitLogger.log(logType, reqInfo);
  }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    this.setLog(http.getRequest<FastifyRequest>(), http.getResponse<FastifyReply>());
    return next.handle();
  }
}
