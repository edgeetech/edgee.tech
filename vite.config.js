import { defineConfig } from 'vite';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const root = import.meta.dirname;
const pages = readdirSync(root).filter((f) => f.endsWith('.html'));

// Shared header/footer live in partials/ and are stitched into every page at
// build (and dev) time, so the site stays plain static HTML with no runtime.
function partials() {
  return {
    name: 'edgeetech-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const page = basename(ctx.filename);
        return html.replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, name) =>
          readFileSync(resolve(root, 'partials', `${name}.html`), 'utf8')
            .replaceAll(`href="/${page}"`, `href="/${page}" aria-current="page"`)
            .replaceAll('{{year}}', String(new Date().getFullYear())),
        );
      },
    },
  };
}

export default defineConfig({
  // The site is served from the root of the edgee.tech custom domain; absolute
  // asset paths keep 404.html working for any missing nested URL.
  base: '/',
  plugins: [partials()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(pages.map((f) => [f.replace('.html', ''), resolve(root, f)])),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
