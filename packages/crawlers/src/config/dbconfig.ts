export const DB_HOST = "asnow.cn",
    DB_PORT = 27017,
    DB_NAME = "vsCrawlerDb",
    USER_NAME = process.env["DB_USER"] ?? "vscr",
    AUTH_DB = process.env["AUTH_DB"] ?? DB_NAME,
    PASSWORD = "visual_crawler_asnow";

export const DB_URI = `mongodb://${USER_NAME}:${PASSWORD}@${DB_HOST}:${DB_PORT}/${AUTH_DB}`;
