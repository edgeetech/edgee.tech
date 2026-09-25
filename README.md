# edgee.tech

Company website of EdgeeTech Limited — https://edgee.tech

Static multi-page site built with Vite and deployed to GitHub Pages. No framework and no runtime dependencies: plain HTML, one stylesheet and a small vanilla JS module for theme switching, the mobile menu and scroll animations.

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # outputs dist/
npm run preview   # serves dist/
```

## Structure

```
├── *.html              # one file per page (Vite inputs are picked up automatically)
├── partials/           # head, header and footer, stitched into every page at build time
├── src/main.js         # fonts, styles and page behaviour
├── src/styles/main.css # design tokens (dark/light), components, animations
├── public/             # copied as-is: CNAME, favicons, robots.txt, sitemap.xml, llms.txt, docs
└── .github/workflows/  # build on PRs, deploy main to GitHub Pages
```

Pages include shared markup with `<!-- @include header -->`; the matching nav link gets `aria-current="page"` automatically (see `vite.config.js`).

## Notes

- Fonts (Geist, Geist Mono, Instrument Serif) are self-hosted via Fontsource.
- All motion respects `prefers-reduced-motion`.
- The contact form has no backend; it composes an email in the visitor's mail client.
- `public/portfolio.html` redirects the old portfolio URL to `/work.html`.

All rights reserved — EdgeeTech Limited.
