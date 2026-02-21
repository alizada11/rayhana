import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";

const isProd = process.env.NODE_ENV === "production";
const plugins = [
  react(),
  tailwindcss(),
  !isProd && jsxLocPlugin(),
  // Manus runtime is useful in preview/builder, but adds weight in production bundles.
  !isProd && vitePluginManusRuntime(),
].filter(Boolean);

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: !isProd, // keep maps in dev, strip them from production bundles
    chunkSizeWarningLimit: 1200,
    minify: "terser",
    rollupOptions: {
      treeshake: {
        preset: "recommended",
        moduleSideEffects: false,
      },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const inPkg = (pkg: string) =>
              id.includes(`/node_modules/${pkg}/`) ||
              id.includes(`\\node_modules\\${pkg}\\`);

            if (inPkg("react-dom")) return "react-dom";
            if (inPkg("react")) return "react";
            if (inPkg("framer-motion")) return "framer-motion";
            if (
              id.includes("@tiptap") ||
              id.includes("prosemirror") ||
              id.includes("monaco-editor")
            ) {
              return "editor";
            }
            if (id.includes("@radix-ui")) return "radix";
            if (id.includes("i18next")) return "i18n";
            if (inPkg("@tanstack/react-query")) return "react-query";
            if (inPkg("recharts") || inPkg("d3")) return "charts";
            if (inPkg("axios")) return "axios";
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: false, // Will find next available port if 3000 is busy
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/robots.txt": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/sitemap.xml": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
