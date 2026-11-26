import { existsSync } from "fs";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, searchForWorkspaceRoot } from "vite";

// Local auth-libs development: use mounted source if available (Docker dev)
const localAuthLib = "/auth-libs-src/dist/hanko-auth.esm.js";
const useLocalAuth = existsSync(localAuthLib);

// Local @hotosm/permissions (not published yet): mounted by hot-dev-env
const localPermissionsLib = "/permissions-wc-src/dist/hotosm-share-dialog.js";
const useLocalPermissions = existsSync(localPermissionsLib);

// Drone-TM frontend URL for CORS configuration (integration testing)
const DRONE_TM_FRONTEND_URL = process.env.VITE_DRONE_TM_FRONTEND_URL || 'http://127.0.0.1:3040'

// Extract host/port for CORS configuration
const droneTmFrontendHost = DRONE_TM_FRONTEND_URL.replace(/^https?:\/\//, '')
const droneTmLocalhostVariant = droneTmFrontendHost.includes('127.0.0.1')
  ? `http://localhost:${droneTmFrontendHost.split(':')[1] || '3040'}`
  : `http://127.0.0.1:${droneTmFrontendHost.split(':')[1] || '3040'}`

// https://vite.dev/config/

export default defineConfig({
  plugins: [
    react(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
    }),
  ],
  resolve: {
    alias: {
      ...(useLocalAuth && { '@hotosm/hanko-auth': localAuthLib }),
      ...(useLocalPermissions && { '@hotosm/permissions': localPermissionsLib }),
    },
    // One copy of Lit and Web Awesome for Portal and @hotosm/permissions
    dedupe: ['lit', '@awesome.me/webawesome'],
  },
  optimizeDeps: {
    exclude: ['@hotosm/hanko-auth', '@hotosm/permissions'],  // Don't pre-bundle symlinked libs
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    ...(useLocalPermissions && {
      fs: { allow: [searchForWorkspaceRoot(process.cwd()), '/permissions-wc-src'] },
    }),
    origin: 'https://portal.hotosm.test',
    allowedHosts: ['portal.hotosm.test', 'localhost', '127.0.0.1'],
    hmr: {
      clientPort: 443,
      host: 'portal.hotosm.test',
      protocol: 'wss',
    },
    cors: {
      origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        DRONE_TM_FRONTEND_URL,  // Drone-TM frontend (from env)
        droneTmLocalhostVariant,  // Drone-TM frontend (alternate)
      ],
      credentials: true,
    },
    // NOTE: All API routing is handled by Traefik reverse proxy, not Vite
    // - /api → portal-backend (via Traefik)
    // - /api/drone-tm → dronetm-backend (via Traefik with stripprefix middleware)
    // - Hanko endpoints at login.hotosm.test → hanko service (via Traefik)
    // This configuration keeps development closer to production architecture
  },
  build: {
    target: 'esnext', // Support top-level await
  },
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
  },
});
