import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  integrations: [
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Evergreen Workbench (web)',
        short_name: 'EG Workbench',
        description: 'Track the latest application versions via the Evergreen PowerShell module.',
        theme_color: '#009485',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/workbench/',
        start_url: '/workbench/',
        icons: [
          {
            src: '/workbench/assets/images/evergreenbulb.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/workbench/assets/images/evergreenbulb.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  output: 'static',
  site: 'https://eucpilots.com',
  base: '/workbench',
});
