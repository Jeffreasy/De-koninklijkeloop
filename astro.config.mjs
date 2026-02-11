import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://dekoninklijkeloop.nl',
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true },
    speedInsights: { enabled: true },
    imagesConfig: {
      checkOrigin: false,
      sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      domains: ["ik.imagekit.io"],
    },
  }),
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/admin/') &&
        !page.includes('/auth/') &&
        !page.includes('/login') &&
        !page.includes('/dashboard') &&
        !page.includes('/profiel') &&
        !page.includes('/registratie-succes'),
    }),
  ],

  vite: {
    plugins: [tailwind()],
    server: {
      proxy: {
        '/api/v1': {
          target: process.env.API_TARGET || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/api/email': {
          target: process.env.API_TARGET || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      }
    }
  },
});
