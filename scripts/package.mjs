import { copyFile, readFile, writeFile, cp } from "node:fs/promises";
import * as Path from "node:path";
import * as Url from "url";

async function copyPackageJson(srcPackagePath, distPackagePath) {
    let data = await readFile(Path.resolve(srcPackagePath, "package.json"), "utf-8")
    let packageJson = JSON.parse(data)
    delete packageJson.devDependencies
    let dependencies = packageJson.dependencies
    for (const [key, value] of Object.entries(dependencies)) {
        if (value.startsWith("workspace:") || value.startsWith("file:")) delete dependencies[key]
    }
    await writeFile(distPackagePath + "/package.json", JSON.stringify(packageJson, null, 4)).then(() => {
        console.log("重写package.json成功")
    })
}
async function copyFIle(srcPackage, distPackage) {
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

const projectDir = Path.resolve(Url.fileURLToPath(import.meta.url), "../..")
const srcPackage = projectDir + "/packages/back-end"
const distPackage = projectDir + "/dist/back-end"

copyPackageJson(srcPackage, distPackage).catch(() => { console.error("重写package.json失败") })
copyFIle(srcPackage, distPackage).catch((e) => { console.error("复制资源失败:"), console.log(e) })