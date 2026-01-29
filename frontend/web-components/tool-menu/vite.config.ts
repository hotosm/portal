import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/tool-menu.ts'),
      name: 'HotToolMenu',
      formats: ['es', 'umd'],
      fileName: (format) => `tool-menu.${format === 'es' ? 'esm' : format}.js`
    },
    rollupOptions: {
      // Bundle everything for standalone use
      external: ['lit', 'lit/decorators.js'],
      output: {
        inlineDynamicImports: true,
      }
    }
  }
});
