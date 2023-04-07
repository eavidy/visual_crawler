import { readFile, writeFile, cp } from "node:fs/promises";
import * as Path from "node:path";
import * as Url from "url";
/** @param {string} path */
async function readJsonFile(path) {
    let data = await readFile(path, "utf-8")
    return JSON.parse(data)
}
class Pkg {
    get packageJsonPath() {
        return this.dir + "/package.json"
    }
    /** @type string */
    dir
    constructor(home) {
        this.dir = home
    }
    async readPackageJson() {
        return readJsonFile(this.packageJsonPath)
    }
}


async function copyPackageJson() {
    let [backEndPkgJson, crawlerPkgJson] = await Promise.all([backEndPkg.readPackageJson(), crawlerPkg.readPackageJson()])

    delete backEndPkgJson.devDependencies
    let dependencies = Object.assign(crawlerPkgJson.dependencies, backEndPkgJson.dependencies)
    backEndPkgJson.dependencies = dependencies

    for (const [key, value] of Object.entries(dependencies)) {
        if (value.startsWith("workspace:") || value.startsWith("file:")) {
            console.log("本地依赖: " + key);
            delete dependencies[key]
        }
    }

    const distPkgPath = rootPkg.dir + "/dist/package.json"
    await writeFile(distPkgPath, JSON.stringify(backEndPkgJson, null, 4)).then(() => {
        console.log("重写package.json成功")
    })
}
async function copyFile(srcPackage, distPackage) {
    let src = Path.resolve(srcPackage, "dist"), dst = Path.resolve(distPackage, "dist")
    let pms1 = cp(src, dst, { recursive: true }).then(() => {
        console.log(`复制${src} > ${dst}`)
    })

    let src2 = Path.resolve(srcPackage, "public"), dist2 = Path.resolve(distPackage, "public")
    let pms2 = cp(src2, dist2, { recursive: true }).then(() => [
        console.log(`复制${src2} > ${dist2}`)
    ])
    return Promise.all([pms1, pms2])
}


const rootPkg = new Pkg(Path.resolve(Url.fileURLToPath(import.meta.url), "../.."))
const crawlerPkg = new Pkg(rootPkg.dir + "/packages/crawlers")
const backEndPkg = new Pkg(rootPkg.dir + "/packages/back-end")

copyPackageJson().catch((e) => { console.log(e); console.error("重写package.json失败") })
