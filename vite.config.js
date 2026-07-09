import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_PROXY_TARGET || "http://127.0.0.1:5000";
  const frontendPort = Number(env.VITE_PORT || 5173);

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: "127.0.0.1",
      port: frontendPort,
      strictPort: true,
      open: true,
      proxy: {
        // Browser calls /api → FastAPI on :5000
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    preview: {
      host: "127.0.0.1",
      port: Number(env.VITE_PREVIEW_PORT || 4173),
      strictPort: true,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
  };
});
