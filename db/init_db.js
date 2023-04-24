const DB_NAME = "vsCrawlerDb",
    USER_NAME = "vscr",
    PWD = "pwd";
db = db.getSiblingDB(DB_NAME);
function createUsers() {
    db.createRole({
        role: "crawler",
        privileges: [
            {
                resource: { db: DB_NAME, collection: "" },
                actions: ["find", "insert"],
            },
            {
                resource: { db: DB_NAME, collection: "task_queue" },
                actions: ["update"],
            },
        ],
        roles: [],
    });
    db.createUser({
        user: USER_NAME,
        pwd: PWD,
        roles: [{ role: "crawler", db: DB_NAME }],
    });
}
function createCollections() {
    db.createCollection("companies");
    db.createCollection("jobs");
    db.createCollection("cities");
    db.createCollection("task_queue");
    db.createCollection("error_log");
    db.createCollection("users");

    db.createView("task_priority_queue", "task_queue", [
        { $match: { status: 0 } },
        {
            $set: {
                typeNum: {
                    $function: {
                        body: `function(type){return type===${"'company'"}?0:type===${"'jobFilter'"}?1:2;}`,
                        args: ["$type"],
                        lang: "js",
                    },
                },
            },
        },
        { $sort: { typeNum: 1, priority: 1, expirationTime: 1 } },
        {
            $project: {
                status: 0,
                typeNum: 0,
                priority: 0,
            },
        },
    ]);
}

createUsers();
createCollections();
