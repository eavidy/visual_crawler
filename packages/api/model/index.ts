export enum SiteTag {
    boss = 1,
    job51 = 2,
    zhilian = 3,
    liepin = 4,
}
export enum Education {
    硕士 = 7,
    博士 = 6,
    本科 = 5,
    大专 = 4,
    中专 = 3,
    高中 = 2,
    初中 = 1,
    不限 = 0,
}
export enum CompanyScale {
    c0_20 = 10,
    c20_99 = 60,
    c100_499 = 300,
    c500_999 = 750,
    c1000_9999 = 5500,
    gt_10000 = 1000,
    unknown = -1,
}
export * from "./company";
export * from "./job";
export * from "./task_queue";
