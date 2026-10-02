import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";
import { copyFileSync, existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const rootDir = dirname(fileURLToPath(import.meta.url));

function copyPdfWorkerPlugin() {
  const copy = () => {
    const src = resolve(rootDir, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
    const dest = resolve(rootDir, "public/pdf.worker.min.js");
    if (!existsSync(src)) return;
    copyFileSync(src, dest);
  };
  return {
    name: "copy-pdf-worker",
    buildStart: copy,
    configureServer: copy,
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    copyPdfWorkerPlugin(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        // Off during dev — enabled SW precaches bundles and you often see stale UI after edits.
        enabled: false,
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
        cleanupOutdatedCaches: true,
        // Don't let the SW intercept PDF.js module workers / brochure assets wrongly
        globIgnores: ["**/pdf.worker*.mjs", "**/pdf.worker*.js"],
        navigateFallbackDenylist: [/^\/api/, /^\/uploads/, /\.mjs$/],
      },
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "Vihiga LIMS eDAMS Admin Portal",
        short_name: "Vihiga LIMS Admin",
        description:
          "Vihiga County - Electronic Development Application Management System Admin Portal",
        theme_color: "#ffffff",
        icons: [
          {
            src: "favicon.ico",
            sizes: "any",
            type: "image/x-icon",
          },
        ],
      },
    }),
    svgr(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: true,
    reporters: ["verbose"],
    coverage: {
      reporter: ["text", "json", "html"],
      include: ["src/**/*"],
      exclude: [],
    },
  },
  server: {
    port: 3000,
    host: true,
    open: true,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/uploads": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
