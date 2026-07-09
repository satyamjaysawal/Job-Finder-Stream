import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Vite config — base URL, dev server, and /api → backend proxy (incl. WebSocket).
 *
 * Env (frontend/.env):
 *   VITE_PORT              frontend port (default 5173)
 *   VITE_BASE_URL          public frontend origin
 *   VITE_BACKEND_URL       backend origin (alias of proxy target)
 *   VITE_API_PROXY_TARGET  backend origin for proxy (default http://127.0.0.1:5000)
 *   VITE_API_BASE          browser API base ("/api" or full URL)
 *   VITE_PREVIEW_PORT      preview server port
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const frontendHost = env.VITE_HOST || "127.0.0.1";
  const frontendPort = Number(env.VITE_PORT || 5173);
  const previewPort = Number(env.VITE_PREVIEW_PORT || 4173);

  const backendUrl = (
    env.VITE_BACKEND_URL ||
    env.VITE_API_PROXY_TARGET ||
    "http://127.0.0.1:5000"
  ).replace(/\/+$/, "");

  const frontendBaseUrl = (
    env.VITE_BASE_URL || `http://${frontendHost}:${frontendPort}`
  ).replace(/\/+$/, "");

  const apiProxy = {
    target: backendUrl,
    changeOrigin: true,
    secure: false,
    ws: true,
  };

  return {
    // App is served from site root
    base: "/",

    plugins: [react(), tailwindcss()],

    define: {
      // Expose resolved defaults for debugging (optional)
      __APP_BASE_URL__: JSON.stringify(frontendBaseUrl),
      __BACKEND_URL__: JSON.stringify(backendUrl),
    },

    server: {
      host: frontendHost,
      port: frontendPort,
      strictPort: true,
      open: true,
      // CORS is not needed browser→Vite same origin; proxy handles API.
      // Allow LAN tools to hit the dev server if needed:
      cors: true,
      proxy: {
        // REST + WebSocket: /api/* → backend BASE_URL
        "/api": apiProxy,
      },
    },

    preview: {
      host: frontendHost,
      port: previewPort,
      strictPort: true,
      cors: true,
      proxy: {
        "/api": apiProxy,
      },
    },

    build: {
      outDir: "dist",
      sourcemap: true,
    },
  };
});
