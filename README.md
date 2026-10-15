# edgee.tech

Company website of EdgeeTech Limited — https://edgee.tech

Static multi-page site built with Vite and deployed to GitHub Pages. No framework and no runtime dependencies: plain HTML, one stylesheet and a small vanilla JS module for theme switching, the mobile menu and scroll animations.

## Development

```bash
nvm use           # Node.js 24 (or select Node 24 with your preferred version manager)
npm ci
npm run dev       # http://localhost:5173
npm run lint      # JavaScript and HTML, including shared partials
npm run build     # outputs dist/
npm run preview   # serves dist/
npx playwright install chromium # once, before running browser tests
npm test          # tests the built site in desktop and mobile Chromium
npm run check     # lint, build, browser tests and dependency audit
```

## Structure

```
├── *.html              # one file per page (Vite inputs are picked up automatically)
├── partials/           # head, header and footer, stitched into every page at build time
├── src/main.js         # fonts, styles and page behaviour
├── src/styles/main.css # design tokens (dark/light), components, animations
├── public/             # copied as-is: CNAME, favicons, robots.txt, sitemap.xml, llms.txt, docs
├── tests/              # page/asset/link checks and browser interaction smoke tests
└── .github/workflows/  # build on PRs, deploy main to GitHub Pages
```

Pages include shared markup with `<!-- @include header -->`; the matching nav link gets `aria-current="page"` automatically (see `vite.config.js`).

## Notes

- Fonts (Geist, Geist Mono, Instrument Serif) are self-hosted via Fontsource.
- All motion respects `prefers-reduced-motion`.
- The contact form has no backend; it composes an email in the visitor's mail client.
- `public/portfolio.html` redirects the old portfolio URL to `/work.html`.
- Keep `android-chrome-512x512.png`: the home page's Organization structured data uses it as the logo.
- CI runs lint, build, desktop/mobile browser tests and `npm audit` on PRs. Only `main` deploys.
- Dependabot checks npm packages and GitHub Actions monthly; updates still go through PR review.

All rights reserved — EdgeeTech Limited.
