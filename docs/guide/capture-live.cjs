// Captures the guide's screenshots from a running dashboard using LIVE data.
//   AXON_USER=... AXON_PASS=... node capture-live.cjs
// Optional: AXON_BASE (default http://localhost:3000), PLAYWRIGHT_CORE, CHROME_PATH.
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = process.env.AXON_BASE || 'http://localhost:3000';
const USER = process.env.AXON_USER;
const PASS = process.env.AXON_PASS;
if (!USER || !PASS) {
  console.error('Set AXON_USER and AXON_PASS (a read-only account is enough).');
  process.exit(1);
}
const OUT = path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 })).newPage();

  // Wait for the page's data, not just the network: loading skeletons and busy
  // cards must be gone, then give charts a moment to animate in.
  const settle = async (extra = 2500) => {
    await page.waitForLoadState('networkidle').catch(() => {});
    await page
      .waitForFunction(() => !document.querySelector('[aria-busy="true"], .animate-pulse'), null, { timeout: 30000 })
      .catch(() => {});
    await page.waitForTimeout(extra);
  };
  // Personal data (emails, IDs, license keys) is blurred so the guide is safe to share.
  const redact = () =>
    page.evaluate(() => {
      const sensitive = /[\w.+-]+@[\w-]+\.[\w.-]+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|AXON-[\w-]{6,}/i;
      for (const el of document.querySelectorAll('td, span, p, div, code')) {
        if (el.children.length === 0 && sensitive.test(el.textContent || '')) el.style.filter = 'blur(6px)';
      }
    });
  const shot = async (name, { full = false } = {}) => {
    await settle();
    await redact();
    if (full) {
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      const size = page.viewportSize();
      await page.setViewportSize({ width: size.width, height });
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(OUT, name + '.png') });
      await page.setViewportSize(size);
    } else {
      await page.screenshot({ path: path.join(OUT, name + '.png') });
    }
    console.log('saved', name);
  };

  await page.goto(BASE + '/signin', { waitUntil: 'networkidle' });
  await shot('01-signin');
  await page.getByPlaceholder(/email or username/i).fill(USER);
  await page.locator('input[type="password"]').fill(PASS);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes('signin'), { timeout: 30000 });

  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await shot('02-dashboard', { full: true });

  const sections = ['users', 'chats', 'flows', 'nlp', 'performance', 'logs'];
  for (const [i, section] of sections.entries()) {
    await page.goto(`${BASE}/analytics?section=${section}`, { waitUntil: 'networkidle' });
    await shot(`1${i}-analytics-${section}`, { full: true });
  }

  await page.goto(`${BASE}/analytics?section=users`, { waitUntil: 'networkidle' });
  await settle();
  await page.getByRole('button', { name: 'More information' }).first().hover();
  await shot('20-info-tooltip');
  await page.mouse.move(700, 600);
  await page.getByRole('button', { name: /Last 7 days/ }).first().click();
  await shot('21-period-filter');
  await page.keyboard.press('Escape');

  await page.goto(`${BASE}/analytics?section=users`, { waitUntil: 'networkidle' });
  await settle();
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await shot('22-dark-mode');
  await page.evaluate(() => document.documentElement.classList.remove('dark'));

  // Administration modules: load, wait for the rows to arrive, then capture.
  for (const p of ['institutions', 'users', 'logs', 'chat-history', 'configurations', 'master-data', 'messages', 'flows', 'languages', 'faqs', 'profile']) {
    await page.goto(`${BASE}/${p}`, { waitUntil: 'networkidle' }).catch(() => {});
    await settle(4000);
    await shot(`3-${p}`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await shot('40-mobile-dashboard');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
