// Logs page in both modes: Real-Time (live stream) and History.
//   AXON_USER=... AXON_PASS=... node capture-logs.cjs
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = process.env.AXON_BASE || 'http://localhost:3000';
const OUT = path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 })).newPage();
  const redact = () =>
    page.evaluate(() => {
      const sensitive = /[\w.+-]+@[\w-]+\.[\w.-]+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|AXON-[\w-]{6,}|[0-9a-f]{24,}|(user_id|raw_text|original|normalized|query|reason|text|message|phone|name)=/i;
      for (const el of document.querySelectorAll('td, span, p, div, code, button, li')) {
        if (el.children.length === 0 && sensitive.test(el.textContent || '')) el.style.filter = 'blur(6px)';
      }
    });
  const settle = async (extra = 3000) => {
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForFunction(() => !document.querySelector('[aria-busy="true"], .animate-pulse'), null, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(extra);
  };

  // ILLUSTRATIVE ONLY: the live stream is empty when nobody is chatting, and history
  // holds real customer messages. For the guide, both are replaced in the browser
  // with invented sample events; the dashboard code and the API are untouched.
  const sample = (offsetSec) => {
    const at = (n) => new Date(Date.now() - (offsetSec - n) * 1000).toISOString();
    const base = { session_id: 'demo-session-7f3a', user_id: 'demo-user-001', request_id: 'req-demo' };
    return [
      { timestamp: at(0), level: 'info', event: 'session_started', ...base, channel: 'voice', language: 'en' },
      { timestamp: at(1), level: 'info', event: 'stage_1_parsing', ...base, step_latency_ms: 3.1 },
      { timestamp: at(2), level: 'info', event: 'intent_classified', ...base, intent: 'check_balance', confidence: 0.94, step_latency_ms: 41.7 },
      { timestamp: at(3), level: 'info', event: 'flow_started', ...base, flow_id: 'check_balance', step: 1 },
      { timestamp: at(4), level: 'info', event: 'flow_step_completed', ...base, flow_id: 'check_balance', step: 2, step_latency_ms: 118.4 },
      { timestamp: at(5), level: 'warning', event: 'slow_response', ...base, total_latency_ms: 1820.5, threshold_ms: 1500 },
      { timestamp: at(6), level: 'info', event: 'routing_to_llm_fallback', ...base, reason: 'low_confidence', original_conf: 0.31 },
      { timestamp: at(7), level: 'error', event: 'upstream_timeout', ...base, service: 'core-banking', timeout_ms: 5000 },
      { timestamp: at(8), level: 'info', event: 'response_sent', ...base, total_latency_ms: 412.3, tokens: 186 },
      { timestamp: at(9), level: 'info', event: 'session_ended', ...base, turns: 4, outcome: 'completed' },
    ];
  };
  await page.addInitScript((events) => {
    const NativeWS = window.WebSocket;
    window.WebSocket = class FakeLogSocket extends EventTarget {
      constructor(url) {
        if (!String(url).includes('/logs/ws')) return new NativeWS(url);
        super();
        this.url = url; this.readyState = 0; this.onopen = this.onmessage = this.onclose = this.onerror = null;
        setTimeout(() => { this.readyState = 1; const e = new Event('open'); this.onopen?.(e); this.dispatchEvent(e); }, 300);
        events.forEach((ev, i) => setTimeout(() => {
          const m = new MessageEvent('message', { data: JSON.stringify({ ...ev, timestamp: new Date().toISOString() }) });
          this.onmessage?.(m); this.dispatchEvent(m);
        }, 900 + i * 350));
      }
      send() {} close() { this.readyState = 3; }
    };
    Object.assign(window.WebSocket, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 });
  }, sample(10));
  await page.route('**/logs/history*', (route) =>
    route.fulfill({ json: { lines: sample(3600).map((e) => JSON.stringify(e)) } }));

  await page.goto(BASE + '/signin', { waitUntil: 'load' });
  await page.getByPlaceholder(/email or username/i).fill(process.env.AXON_USER);
  await page.locator('input[type="password"]').fill(process.env.AXON_PASS);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes('signin'), { timeout: 30000 });

  await page.goto(BASE + '/logs', { waitUntil: 'networkidle' });
  await settle(6000);
  await redact();
  await page.screenshot({ path: path.join(OUT, '62-logs-realtime.png') });
  console.log('saved 62-logs-realtime');

  await page.getByText('History', { exact: true }).first().click();
  await settle(3000);
  // Choose the first recorded session so the history list shows real events.
  await page.locator('aside, div').filter({ hasText: /^All Sessions/ }).last().locator('xpath=following::*[self::button or self::li or @role="button"][1]').click({ timeout: 5000 }).catch(() => {});
  await settle(6000);
  await redact();
  await page.screenshot({ path: path.join(OUT, '63-logs-history.png') });
  console.log('saved 63-logs-history');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
