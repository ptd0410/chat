import path from "node:path";
import { defineConfig } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const workspaceRoot = path.resolve(import.meta.dirname, "../..");

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3001,
    fs: {
      allow: [workspaceRoot],
    },
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    viteReact(),
    tailwindcss(),
  ],
});
