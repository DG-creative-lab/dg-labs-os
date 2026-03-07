// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';

const isVercelDeploy =
  process.env.DEPLOY_TARGET === 'vercel' ||
  process.env.VERCEL === '1' ||
  process.env.VERCEL === 'true';

export default defineConfig({
  // Replace with your website URL (required for sitemap generation)
  site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',

  // URL configuration
  trailingSlash: 'never', // Removes trailing slashes from URLs

  // Vite configuration
  vite: {
    plugins: [tailwindcss()],
  },

  // Required integrations
  integrations: [
    react(), // Enables React components
    sitemap({
      // Generates sitemap
      serialize: (item) => {
        const url = item.url.endsWith('/') ? item.url.slice(0, -1) : item.url;
        return { ...item, url };
      },
    }),
  ],

  // Deployment configuration
  output: 'server', // Server-side rendering for API routes
  adapter: isVercelDeploy
    ? vercel({})
    : node({
        mode: 'standalone',
      }),
  devToolbar: {
    enabled: false,
  },
});
