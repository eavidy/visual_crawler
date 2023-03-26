export const DB_HOST = "127.0.0.1",
    DB_PORT = 27017,
    DB_NAME = "vsCrawlerDb",
    USER_NAME = "vscr",
    PASSWORD = "visual_crawler_asnow";

export const DB_URI = `mongodb://${USER_NAME}:${PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
