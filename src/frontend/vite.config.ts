/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "^/(Users|Dogs|Owners|connect|openapi)": {
        target: "https://api.dogappa.local:8443",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
    legacy(),
  ],
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "./src/app"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@widgets": path.resolve(__dirname, "./src/widgets"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@entities": path.resolve(__dirname, "./src/entities"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@hooks": path.resolve(__dirname, "./src/shared/hooks"),
      "@ui": path.resolve(__dirname, "./src/shared/ui"),
      "@utils": path.resolve(__dirname, "./src/shared/utils"),
      "@types": path.resolve(__dirname, "./src/shared/types"),
      "@api": path.resolve(__dirname, "./src/shared/api"),
      "@config": path.resolve(__dirname, "./src/shared/config"),
      "@store": path.resolve(__dirname, "./src/shared/store"),
      "@i18n": path.resolve(__dirname, "./src/i18n"),
    },
  },

  css: {
    postcss: "./postcss.config.js",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
