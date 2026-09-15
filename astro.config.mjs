// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://yukaz0.github.io',
  output: 'static',
  base: '/portfolio-2026',
  i18n: {
    locales: ['en', 'id', 'zh', 'ja'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
