const { chromium } = require('C:/Users/zuhoor/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/zuhoor/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    const requests = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => localStorage.setItem('admin.auth', JSON.stringify({ accessToken: 'design-test', refreshToken: 'test', userId: 'test', username: 'Design Test', role: 'SUPER_ADMIN', accessExpiresAt: Date.now() + 3600000 })));
    const events = [
      { timestamp: '2026-10-26T10:20:01Z', level: 'info', event: 'turn_started', session_id: 'session-001', request_id: 'req-001' },
      { timestamp: '2026-10-26T10:20:02Z', level: 'info', event: 'inbound_message', text: 'Show my account balance', language_code: 'en', session_id: 'session-001' },
      { timestamp: '2026-10-26T10:20:03Z', level: 'debug', event: 'intent_classified', intent: 'balance', confidence: 0.98, latency_ms: 124 },
      { timestamp: '2026-10-26T10:20:04Z', level: 'warning', event: 'provider_retry', reason: 'Temporary delay', attempt: 1 },
      { timestamp: '2026-10-26T10:20:05Z', level: 'error', event: 'request_failed', error: '<script>window.injected=true</script>', session_id: 'session-002' },
    ];
    await page.route('**/backend/**', route => {
      const url = new URL(route.request().url());
      requests.push(url.pathname + url.search);
      const body = url.pathname.endsWith('/sessions') ? { sessions: ['session-001', 'session-002'] } : { lines: events.map(event => JSON.stringify(event)) };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
    await page.routeWebSocket('**/backend/logs/ws**', socket => {
      setTimeout(() => events.forEach(event => socket.send(JSON.stringify(event))), 250);
    });
    await page.goto('http://localhost:3000/logs');
    await page.getByText('inbound_message', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'session-001', exact: true }).waitFor();
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.waitForTimeout(250);
    await page.screenshot({ path: '.logs-light.png', fullPage: true });
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(250);
    await page.screenshot({ path: '.logs-dark.png', fullPage: true });
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.getByRole('button', { name: 'Resume', exact: true }).click();
    await page.getByRole('button', { name: 'session-001', exact: true }).click();
    await page.getByText('Session: session-001', { exact: true }).waitFor();
    await page.getByRole('tab', { name: 'History', exact: true }).click();
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByText('inbound_message', { exact: true }).waitFor();
    assert.ok(requests.some(url => url.includes('/history?') && url.includes('session_id=session-001')));
    assert.equal(await page.evaluate(() => window.injected), undefined);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await page.getByText('inbound_message', { exact: true }).waitFor();
    await page.screenshot({ path: '.logs-mobile.png', fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ stream: 'passed', pauseResume: 'passed', sessionSelection: 'passed', history: 'passed', mobileOverflow: false, errors }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
