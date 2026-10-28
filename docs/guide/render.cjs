const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined });
  const page = await browser.newPage();
  await page.goto('file:///' + path.join(__dirname, 'guide.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await page.waitForTimeout(800);
  await page.pdf({
    path: path.join(__dirname, 'Axon-Admin-Dashboard-User-Guide.pdf'),
    format: 'A4', printBackground: true, preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;font-family:Segoe UI,Arial,sans-serif;font-size:8px;color:#667085;padding:0 16mm;display:flex;justify-content:space-between"><span>Axon Admin Dashboard — User Guide</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
  });
  await browser.close();
  console.log('pdf done');
})().catch((e) => { console.error(e); process.exit(1); });
