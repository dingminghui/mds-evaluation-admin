import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const emasTarget = env.VITE_EMAS_HTTP_ENDPOINT || "";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: emasTarget
        ? {
            "/api/emas": {
              target: emasTarget,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api\/emas/, ""),
            },
          }
        : undefined,
    },
    test: {
    bail: 1,
    clearMocks: true,
    coverage: {
      enabled: true,
      exclude: ["src/main.tsx"],
      include: ["src/**/*"],
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
    },
    css: false,
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.test.ts?(x)"],
    setupFiles: "src/test-setup.ts",
    },
  };
});
