import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import babel from 'vite-plugin-babel';

export default defineConfig(({ mode }) => ({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'EffectorReformZod',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {},
  },
  plugins: [
    babel({
      babelConfig: {
        presets: [
          [
            '@babel/preset-env',
            {
              modules: mode === 'test' ? false : 'auto',
              targets: '> 0.25%, not dead',
            },
          ],
          '@babel/preset-typescript',
        ],
      },
    }),
    dts({
      outDir: resolve(__dirname, 'dist'),
      entryRoot: resolve(__dirname, 'lib'),
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
}));
