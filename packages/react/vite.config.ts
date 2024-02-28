import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';

export default defineConfig({
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
    dts({
      outDir: resolve(__dirname, 'dist'),
      entryRoot: resolve(__dirname, 'lib'),
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true,
    }),
    react({
      babel: {
        plugins: ['effector/babel-plugin'],
        babelrc: true,
        configFile: true,
      },
    }),
  ],
});
