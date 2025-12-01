/// <reference types="vite/client" />

// SVG imports
declare module "*.svg" {
  const content: string;
  export default content;
}

// Environment variables
interface ImportMetaEnv {
  readonly VITE_HANKO_URL?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global window extensions
interface Window {
  HANKO_URL?: string;
}
