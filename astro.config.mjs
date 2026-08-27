import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://caudalfinanzas.com',
  integrations: [react()],
  vite: {
    envPrefix: ['VITE_', 'PUBLIC_'],
  },
});
