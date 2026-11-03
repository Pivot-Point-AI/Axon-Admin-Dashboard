// Close-ups of the Conversations "Activity" card in both views (hour / weekday).
//   AXON_USER=... AXON_PASS=... node capture-activity.cjs
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = process.env.AXON_BASE || 'http://localhost:3000';
const OUT = path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })).newPage();
  await page.goto(BASE + '/signin', { waitUntil: 'load' });
  await page.getByPlaceholder(/email or username/i).fill(process.env.AXON_USER);
  await page.locator('input[type="password"]').fill(process.env.AXON_PASS);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes('signin'), { timeout: 30000 });
  await page.goto(`${BASE}/analytics?section=chats`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Activity By Weekday' }).waitFor({ timeout: 60000 });
  await page.waitForFunction(() => !document.querySelector('[aria-busy="true"], .animate-pulse'), null, { timeout: 30000 }).catch(() => {});

  const card = page.getByRole('button', { name: 'Activity By Weekday' }).locator('xpath=ancestor::*[contains(@class,"axon-panel")][1]');
  for (const [name, label] of [['60-activity-hour', 'Activity By Hour'], ['61-activity-weekday', 'Activity By Weekday']]) {
    await page.getByRole('button', { name: label }).click();
    await page.mouse.move(5, 5);
    await page.waitForTimeout(2500);
    await card.screenshot({ path: path.join(OUT, name + '.png') });
    console.log('saved', name);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
