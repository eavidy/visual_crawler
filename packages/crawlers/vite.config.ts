import { defineConfig } from "vite";

const node = [/^node:.+$/];
const asnc = [/^@asnc\/.+/];
const dp = ["mongodb", "playwright"];
export default defineConfig({
    build: {
        target: "",
        outDir: "./dist/pack",
        lib: {
            entry: "./src/crawl/crawler/crawler_liepin.spec.ts",
            name: "crawler",
            fileName: "index",
            formats: ["cjs"],
        },
        rollupOptions: {
            external: [...node, ...dp],
        },
        reportCompressedSize: false,
    },
});
