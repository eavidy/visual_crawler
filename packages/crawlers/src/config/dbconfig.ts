export const DB_HOST = "127.0.0.1",
    DB_PORT = 27017,
    DB_NAME = "vsCrawlerDb",
    USER_NAME = process.env["DB_USER"] ?? "vscr",
    AUTH_DB = process.env["DB_AUTH_DB"] ?? DB_NAME,
    PASSWORD = process.env["DB_PWD"] ?? "visual_crawler_asnow";

export const DB_URI = `mongodb://${USER_NAME}:${PASSWORD}@${DB_HOST}:${DB_PORT}/${AUTH_DB}`;
