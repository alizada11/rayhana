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
  vitePluginManusRuntime(),
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
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          editor: [
            "@tiptap/react",
            "@tiptap/starter-kit",
            "@tiptap/extension-link",
            "@tiptap/extension-placeholder",
            "@tiptap/extension-image",
          ],
          charts: ["recharts"],
          motion: ["framer-motion"],
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
