import { VitePluginNode } from "vite-plugin-node";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [
        ...VitePluginNode({
            adapter: "nest",
            appPath: "./src/main.ts",
            tsCompiler: "swc",
            swcOptions: {
                sourceMaps: true,
            },
        }),
    ],
    optimizeDeps: {
        // Vite does not work well with optionnal dependencies,
        // mark them as ignored for now
        // exclude: [
        //     "@nestjs/microservices",
        //     "@nestjs/websockets",
        //     "cache-manager",
        //     "class-transformer",
        //     "class-validator",
        //     "fastify-swagger",
        // ],
    },
    test: {
        watch: true,
    },
});
