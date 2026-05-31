// @ts-check
import { defineConfig } from 'astro/config';

// Static marketing site → Cloudflare Pages. The waitlist endpoint is a Pages
// Function under functions/ (not an Astro route), so output stays static.
export default defineConfig({
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
