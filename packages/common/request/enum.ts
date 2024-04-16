export enum WorkExp {
  "在校/实习生" = -2,
  "应届生" = 0,
  "1年以内" = 0.5,
  "1-3年" = 2,
  "3-5年" = 4,
  "5-10年" = 7.5,
  "10年以上" = 10,
  经验不限 = -1,
}
export enum CrawlerProcessStatus {
  stop = 0,
  running = 1,
  stopping = 2,
  starting = 3,
}
export enum CrawlerStatus {
  stopped = 0,
  starting = 1,
  working = 2,
  stopping = 3,
}
