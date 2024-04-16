import { defineConfig } from "vite";
import { Plugin as importToCDN, autoComplete } from "vite-plugin-cdn-import";

type CdnOption = Parameters<typeof importToCDN>[0]["modules"];
class CDN {
  static origin = "https://unpkg.com/";
  // static origin = "https://cdn.jsdelivr.net/npm/";
  static reactRouterDom(): CdnOption {
    return [
      {
        name: "@remix-run/router",
        path: this.origin + "@remix-run/router@1.6.1/dist/router.umd.min.js",
        var: "ReactRouter",
      },
      {
        name: "react-router",
        path: this.origin + "react-router@6.11.1/dist/umd/react-router.production.min.js",
        var: "ReactRouter",
      },
      {
        name: "react-router-dom",
        path: this.origin + "react-router-dom@6.11.1/dist/umd/react-router-dom.production.min.js",
        var: "ReactRouterDOM",
      },
    ];
  }
  static antd(): CdnOption {
    return [
      {
        name: "dayjs",
        path: this.origin + "dayjs@1.11.7/dayjs.min.js",
        var: "dayjs",
      },
      {
        name: "antd",
        path: this.origin + "antd@5.4.7/dist/antd.min.js",
        var: "antd",
      },
    ];
  }
}

export default defineConfig({
  resolve: {
    alias: {
      "@": "/src/",
    },
  },

  build: {
    copyPublicDir: true,
    outDir: "../../dist/server_pack/public",
    chunkSizeWarningLimit: 1024 * 4,
    emptyOutDir: true,
    rollupOptions: {
      external: ["react", "react-dom", "antd", "dayjs", "react-router", "react-router-dom"],
    },
  },
  plugins: [
    // importToCDN({
    //   modules: [
    //     {
    //       name: "react",
    //       path: CDN.origin + "react@18.2.0/umd/react.production.min.js",
    //       var: "React",
    //     },
    //     {
    //       name: "react-dom",
    //       path: CDN.origin + "react-dom@18.2.0/umd/react-dom.production.min.js",
    //       var: "ReactDOM",
    //     },
    //     {
    //       name: "axios",
    //       path: CDN.origin + "axios@1.4.0/dist/axios.min.js",
    //       var: "axios",
    //     },
    //     ...CDN.antd(),
    //     ...CDN.reactRouterDom(),
    //   ],
    //   prodUrl: "https://unpkg.com/",
    // }),
  ],
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
});
