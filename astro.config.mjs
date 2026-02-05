import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true },
    speedInsights: { enabled: true },
    imagesConfig: {
      checkOrigin: false,
      sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      domains: ["res.cloudinary.com"],
    },
  }),
  integrations: [react()],

  vite: {
    plugins: [tailwind()],
    server: {
      proxy: {
        '/api/v1': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/api/email': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      }
    }
  },
});