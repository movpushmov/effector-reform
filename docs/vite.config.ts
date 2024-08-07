import { defineConfig } from 'vite';
import Unocss from 'unocss/vite';
import { presetAttributify, presetIcons, presetUno } from 'unocss';

export default defineConfig({
  optimizeDeps: {
    exclude: ['@vueuse/core', 'vitepress'],
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    Unocss({
      presets: [
        presetUno({
          dark: 'media',
        }),
        presetAttributify(),
        presetIcons({
          scale: 1.2,
        }),
      ],
    }),
  ],
});
