import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import babel from 'vite-plugin-babel';

export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'dist'),
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: '@effector-reform/core',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['effector', 'patronum', '@effector-reform/core'],
      output: {
        globals: {
          effector: 'effector',
          patronum: 'patronum',
          '@effector-reform/core': '@effector-reform/core',
        },
      },
    },
  },
  plugins: [
    babel({ filter: /.[jt]sx?/ }),
    dts({
      outDir: resolve(__dirname, 'dist'),
      entryRoot: resolve(__dirname, 'lib'),
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  test: {},
});
