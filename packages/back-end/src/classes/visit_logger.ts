import { createLogger, transports, transport, format, Logform } from "winston";
import { DevTransport } from "./dev_transport.js";
import * as config from "../config.js";

export enum LogType {
  login = "login",
  home = "home",
  other = "other",
}
const logLevels = {
  [LogType.login]: 0,
  [LogType.home]: 1,
  [LogType.other]: 99,
};
let loggerTransport: transport;

if (process.env.MODE === "prod") {
  const dir = config.LOGS_DIR;
  if (dir)
    loggerTransport = new transports.File({
      level: LogType.other,
      filename: `${dir}/visit-log.txt`,
    });
} else {
  loggerTransport = new DevTransport({ level: LogType.other }) as any;
}

export const visitLogger = createLogger({
  level: LogType.other,
  levels: logLevels,
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.json(),
  ),
  transports: loggerTransport!,
});
type Format = InstanceType<typeof Logform.Format>;
type TransformableInfo = Parameters<Format["transform"]>[0];

export interface VisitHeader {
  host?: string;
  referer?: string;
  userAgent?: string;
}
export interface VisitInfo {
  srcIp: string;
  header: VisitHeader;
  extra?: Record<string, string>;
  url: string;
  statusCode: number;
}
