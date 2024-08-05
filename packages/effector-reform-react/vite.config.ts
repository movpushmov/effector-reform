import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import babel from 'vite-plugin-babel';

export default defineConfig(({ mode }) => ({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'EffectorReformReact',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'effector',
        'effector-react',
        'react',
        '@effector-reform/core',
      ],
      output: {
        globals: {
          react: 'react',
          effector: 'effector',
          'effector-react': 'effector-react',
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
          '@babel/preset-react',
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
  test: {
    environment: 'jsdom',
  },
}));
