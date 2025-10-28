import { paraglideVitePlugin } from "@inlang/paraglide-js";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  console.log("VITE_API_URL:", env.VITE_API_URL);

  return {
    plugins: [
      react(),
      paraglideVitePlugin({
        project: "./project.inlang",
        outdir: "./src/paraglide",
      }),
    ],
    server: {
      host: "0.0.0.0", // Listen on all interfaces
      port: 5173,
      cors: {
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        credentials: true,
      },
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:8000",
          changeOrigin: true,
        },
        // Proxy Hanko API endpoints only (not React Router routes)
        "/.well-known": {
          target: "http://hanko:8000",
          changeOrigin: true,
        },
        "/passcode": {
          target: "http://hanko:8000",
          changeOrigin: true,
        },
        "/webauthn": {
          target: "http://hanko:8000",
          changeOrigin: true,
        },
        "/token": {
          target: "http://hanko:8000",
          changeOrigin: true,
        },
        "/login": {
          target: "http://hanko:8000",
          changeOrigin: true,
          bypass: (req) => {
            // Only proxy POST/PUT/DELETE (API calls), let GET through to React Router
            if (req.method === "GET") {
              return req.url;
            }
          },
        },
        "/logout": {
          target: "http://hanko:8000",
          changeOrigin: true,
        },
        "/registration": {
          target: "http://hanko:8000",
          changeOrigin: true,
        },
        "/me": {
          target: "http://hanko:8000",
          changeOrigin: true,
        },
        "/users": {
          target: "http://hanko:8000",
          changeOrigin: true,
        },
        "/sessions": {
          target: "http://hanko:8000",
          changeOrigin: true,
        },
      },
    },
    build: {
      target: "esnext", // Support top-level await
    },
    test: {
      globals: true,
      environment: "jsdom",
      passWithNoTests: true,
    },
  };
});
