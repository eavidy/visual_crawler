import { ServerResponse, IncomingMessage } from "node:http";
import { visitLogger, LogType, VisitInfo } from "../classes/visit_logger";

export function loggerMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
    const url = req.url;
    if (url === "/") {
        res.on("close", function () {
            let header = req.headers;
            let data: VisitInfo = {
                srcIp: req.socket.remoteAddress!,
                url: req.url!,
                statusCode: res.statusCode,
                header: {
                    host: header.host,
                    referer: header.referer,
                    userAgent: header["user-agent"],
                },
            };
            visitLogger.log(LogType.home, data);
        });
    }

    next();
}
