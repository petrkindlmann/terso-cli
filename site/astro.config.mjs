import { defineConfig } from 'astro/config';

// terso.dev is served from petrkindlmann/terso-cli via GitHub Pages.
// CNAME in site/public/CNAME maps Pages → terso.dev.
export default defineConfig({
  site: 'https://terso.dev',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
