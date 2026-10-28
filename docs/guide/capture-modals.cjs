// Captures the create/edit dialogs used in the "How do I...?" chapter. Nothing is submitted.
//   AXON_USER=... AXON_PASS=... node capture-modals.cjs
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const fs = require('fs');
const path = require('path');
const BASE = process.env.AXON_BASE || 'http://localhost:3000';
const OUT = path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 })).newPage();
  const settle = async (ms = 2500) => {
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForFunction(() => !document.querySelector('[aria-busy="true"], .animate-pulse'), null, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(ms);
  };
  await page.goto(BASE + '/signin', { waitUntil: 'load', timeout: 90000 });
  await page.getByPlaceholder(/email or username/i).fill(process.env.AXON_USER);
  await page.locator('input[type="password"]').fill(process.env.AXON_PASS);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL((u) => !u.pathname.includes('signin'), { timeout: 30000 });

  const jobs = [
    ['institutions', 'New Institution', '50-new-institution'],
    ['users', 'New User', '51-new-user'],
    ['languages', 'New Language', '52-new-language'],
    ['faqs', 'Add FAQ', '53-add-faq'],
    ['master-data', 'Add Bank', '54-add-bank'],
    ['configurations', 'Edit', '55-edit-configurations'],
  ];
  for (const [route, button, name] of jobs) {
    await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
    await settle(3500);
    try {
      await page.getByRole('button', { name: button, exact: true }).first().click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUT, name + '.png') });
      console.log('saved', name);
    } catch (e) {
      console.log('skipped', name, e.message.split('\n')[0]);
    }
    await page.keyboard.press('Escape');
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
