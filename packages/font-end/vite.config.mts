import type { UserConfig, Alias } from "vite";
import { isAbsolute } from "node:path";
import pkg from "./package.json" with { type: "json" };

function genPkgMap(deps: Record<string, string>) {
  let map: Record<string, string> = {};
  const testor = /^.\d+\./;
  const d = /^\d/;
  for (const [name, version] of Object.entries(deps)) {
    if (d.test(version)) {
      map[name] = version;
    } else if (testor.test(version)) {
      map[name] = version.slice(1);
    }
  }
  return map;
}
const CDN_LIST = genPkgMap(pkg.dependencies);

function toESM_CDN(name: string, version: string, sub: string = ""): string {
  let base = `https://esm.sh/${name}@${version}${sub}`;
  // if (["antd", "react", "echarts"].includes(name)) base += "?bundle-deps";
  return base;
}

function pasePkg(importname: string): { name: string; sub?: string } | undefined {
  if (isAbsolute(importname) || importname.startsWith(".")) return;
  let f1 = importname.indexOf("/");
  if (f1 === -1) return { name: importname };

  if (importname.startsWith("@")) {
    let sub = importname.slice(f1 + 1);
    const f2 = sub.indexOf("/");
    if (f2 === -1) return { name: importname };

    return { name: importname.slice(0, f1 + 1 + f2), sub: sub.slice(f2) };
  } else {
    let sub = importname.slice(f1);
    return { name: importname.slice(0, f1), sub: sub ? sub : undefined };
  }
}
class CdnReplace implements Alias {
  find = /^/;
  replacement = "";
  customResolver(source: string, importer?: string) {
    const res = pasePkg(source);
    if (!res) return;
    const version = CDN_LIST[res.name];
    if (!version) {
      return;
    }
    const finalName = toESM_CDN(res.name, version, res.sub);

    return {
      external: true,
      id: finalName,
    };
  }
}

const IS_PREVIEW = false;

const config: UserConfig = {
  resolve: {
    alias: [{ find: "@/", replacement: "/src/" }, ...(IS_PREVIEW ? [new CdnReplace()] : [])],
  },

  build: {
    copyPublicDir: true,
    outDir: "../../dist/server_pack/public",
    chunkSizeWarningLimit: 1024 * 4,
    emptyOutDir: true,
    target: IS_PREVIEW ? "esnext" : "es2017",
    minify: !IS_PREVIEW,
  },
  preview: {
    proxy: {
      "/api": {
        target: "http://81.68.137.32/",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://81.68.137.32/",
        changeOrigin: true,
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
};
export default config;
