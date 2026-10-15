import { expect, test } from '@playwright/test';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const pages = ['index', 'services', 'products', 'work', 'about', 'contact', '404'];

for (const name of pages) {
  test(`${name}: content, local links, assets and layout`, async ({ page, request, baseURL }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('requestfailed', (req) => errors.push(`${req.url()}: ${req.failure()?.errorText}`));
    page.on('response', (response) => {
      if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`);
    });
    await page.goto(`/${name}.html`);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('.site-header')).toBeVisible();
    await expect(page.locator('.site-footer a', { hasText: 'AgentWorkstation' }))
      .toHaveAttribute('href', 'https://github.com/edgeetech/agentworkstation');
    expect(await page.content()).not.toContain('<!-- @include');
    expect(await page.locator('html').getAttribute('data-theme')).toMatch(/^(dark|light)$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);

    // Scroll through the whole page so lazy assets and reveal observers run.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) {
        scrollTo({ top: y, behavior: 'instant' });
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
      }
    });
    expect(await page.locator('img').evaluateAll((images) => images.every((img) => img.complete && img.naturalWidth > 0))).toBe(true);
    for (const item of await page.locator('[data-reveal]').all()) {
      await item.scrollIntoViewIfNeeded();
      await expect(item).toHaveClass(/is-in/);
    }
    expect(errors).toEqual([]);

    const targets = await page.locator('[href], [src]').evaluateAll((elements) => [...new Set(
      elements.map((el) => el.getAttribute('href') || el.getAttribute('src')).filter(Boolean),
    )]);
    for (const target of targets) {
      const url = new URL(target, `${baseURL}/${name}.html`);
      if (url.origin !== baseURL) continue;
      const file = resolve('dist', `.${decodeURIComponent(url.pathname).replace(/\/$/, '/index.html')}`);
      // Preview servers can return index.html for a missing path; check disk too.
      expect((await stat(file)).isFile(), `Missing built file: ${url}`).toBe(true);
      const response = await request.get(url.href);
      expect(response.ok(), `Missing local target: ${url}`).toBe(true);
      if (url.hash) {
        const html = await response.text();
        const found = await page.evaluate(({ html, hash }) => {
          return new DOMParser().parseFromString(html, 'text/html').getElementById(decodeURIComponent(hash.slice(1))) !== null;
        }, { html, hash: url.hash });
        expect(found, `Missing anchor: ${url}`).toBe(true);
      }
    }
    if (!['index', '404'].includes(name)) {
      await expect(page.locator('#site-nav a[aria-current="page"]')).toHaveAttribute('href', `/${name}.html`);
    }
  });
}

test('theme choice persists across navigation and reload', async ({ page }) => {
  await page.goto('/');
  const original = await page.locator('html').getAttribute('data-theme');
  const next = original === 'dark' ? 'light' : 'dark';
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', next);
  await page.goto('/products.html');
  await expect(page.locator('html')).toHaveAttribute('data-theme', next);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', next);
});

test('normal motion still reveals content and runs the marquee', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('main h1')).toHaveCSS('opacity', '1');
  const track = page.locator('.marquee-track').first();
  await track.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(track).toHaveCSS('animation-name', 'marquee');
  expect(await track.evaluate((el) => el.getAnimations().some((animation) => animation.playState === 'running'))).toBe(true);
});

test('mobile menu supports Escape and navigation', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile navigation only');
  await page.goto('/');
  const button = page.locator('.menu-toggle');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#site-nav')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await button.click();
  await page.locator('#site-nav').getByRole('link', { name: 'Services', exact: true }).click();
  await expect(page).toHaveURL(/\/services.html$/);
  await expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('contact topic and form validation work without sending data', async ({ page }) => {
  await page.goto('/contact.html?topic=taksim');
  await expect(page.getByRole('radio', { name: 'Taksim', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Compose email' }).click();
  expect(await page.locator('#name').evaluate((input) => input.validity.valueMissing)).toBe(true);
  await expect(page.locator('.form-status')).toBeEmpty();
  await page.getByLabel('Your name').fill('Maintenance Test');
  await page.getByRole('textbox', { name: 'Company (optional)', exact: true }).fill('EdgeeTech');
  await page.getByLabel('Message', { exact: true }).fill('Local browser verification.');
  await expect(page.locator('#contact-form')).toHaveJSProperty('noValidate', true);
  expect(await page.locator('#contact-form').evaluate((form) => form.checkValidity())).toBe(true);
  // The only outbound action is a mailto navigation in the visitor's mail app.
  // Block that navigation in this test; no message is sent.
  await page.route('mailto:**', (route) => route.abort());
  await page.getByRole('button', { name: 'Compose email' }).click();
  await expect(page.getByRole('status')).toHaveText('Your email app should open with the message ready to send.');
});

test('email address can be copied', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Clipboard permissions use Chromium');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/contact.html');
  await page.getByRole('button', { name: 'Copy email address' }).click();
  await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('info@edgee.tech');
});

test('legacy portfolio URL redirects to the work page', async ({ page }) => {
  await page.goto('/portfolio.html');
  await expect(page).toHaveURL(/\/work.html$/);
  await expect(page.locator('main h1')).toBeVisible();
});

test('nested 404 keeps absolute assets and displays the requested path', async ({ page }) => {
  // GitHub Pages serves this exact file with status 404 for a missing URL.
  await page.route('**/missing/nested-page', async (route) => {
    await route.fulfill({ status: 404, contentType: 'text/html', body: await readFile('dist/404.html', 'utf8') });
  });
  await page.goto('/missing/nested-page');
  await expect(page.locator('.requested-path')).toHaveText('missing/nested-page');
  await expect(page.locator('main h1')).toBeVisible();
  expect(await page.locator('main h1').evaluate((el) => getComputedStyle(el).fontFamily)).toContain('Geist');
});

test('publishing metadata and public entry points are present', async ({ request }) => {
  for (const path of ['/robots.txt', '/sitemap.xml', '/llms.txt', '/favicon.svg', '/favicon.ico', '/apple-touch-icon.png', '/android-chrome-512x512.png', '/og-image.png', '/doc/edgeetech-ico-registration-certificate.pdf']) {
    expect((await request.get(path)).ok(), path).toBe(true);
  }
  expect((await readFile('dist/CNAME', 'utf8')).trim()).toBe('www.edgee.tech');
});
