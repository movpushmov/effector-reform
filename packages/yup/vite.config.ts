import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'EffectorReformReact',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {},
  },
  plugins: [
    dts({
      outDir: resolve(__dirname, 'dist'),
      entryRoot: resolve(__dirname, 'lib'),
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true,
    }),
    react(),
  ],
});
