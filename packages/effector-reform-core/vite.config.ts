import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import babel from 'vite-plugin-babel';

export default defineConfig(({ mode }) => ({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'EffectorReformCore',
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
        plugins: [
          [
            'effector/babel-plugin',
            {
              factories: [
                'lib/fields/primitive-field/field',
                'lib/fields/array-field/field',
                'lib/form/form',
              ],
              addNames: true,
            },
          ],
        ],
      },
      filter: /.[jt]sx?/,
    }),
    dts({
      outDir: resolve(__dirname, 'dist'),
      entryRoot: resolve(__dirname, 'lib'),
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  test: {},
}));
