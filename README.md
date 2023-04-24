## 项目结构

```

┌─ node_modules     //node依赖
├─ db
|  └─ init_db.js    //mongodb 初始化脚本
|
├─ dist             //项目输出文件夹
|  ├─ node_modules    //依赖
|  ├─ back-end        //后端接口管理
|  ├─ crawler         //采集器进程
|  ├─ public          //前端文件
|  └─ package.json
|
├─ docs             //文档
|  ├─ system        //系统设计文档
|  └─ ...
|
├─ packages
|  ├─ common
|  ├─ crawlers
|  ├─ font-end
|  └─ back-end
|
├─ tsconfig.json
├─ vitest.config.mts        //vitest单元测试配置
├─ .gitignore
├─ package.json
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ README.md
└─ LICENSE
```
