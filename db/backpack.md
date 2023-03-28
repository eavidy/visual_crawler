mongodump --host="localhost:27017" -u "user" -p "pwd" --authenticationDatabase=admin --db vsCrawlerDb -o "A:/appData/vs"

mongorestore --host="asnow.cn:27017" -u "user" -p "pwd" --authenticationDatabase=admin --dir "A:/appData/vs"