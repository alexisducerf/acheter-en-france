// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  },

  // No netlify/edge-functions in this project: skip the Deno-based edge emulation in `astro dev`
  adapter: netlify({ devFeatures: { edgeFunctions: false } })
});