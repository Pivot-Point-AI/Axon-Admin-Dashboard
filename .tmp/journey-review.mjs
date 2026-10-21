import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/zuhoor/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const started = [20,32,38,40,39,37,36,36,39,39,36,40,46,53,57,60,55,60,68,60,57];
const abandoned = [12,15,17,19,17,16,15,18,21,20,19,22,26,29,28,33,31,36,42,35,33];
const fixture = {
  total_initialized_flows: 283, total_completed_flows: 20, total_cancelled_flows: 16,
  total_failed_flows: 49, total_abandoned_flows: 198, abandoned_flows_count: 198,
  flow_completion_rate_pct: 7.1, flow_abandonment_rate_pct: 70,
  flow_breakdown_by_type: Object.fromEntries([
    ['bank_fund_transfer',37,13,87],['show_list',33,8,92],['raast_fund_transfer',31,10,90],
    ['add_beneficiary',31,16,84],['chat',24,8,92],['others',127,5,80],
  ].map(([key,total,completion_rate_pct,abandonment_rate_pct]) => [key,{total,completion_rate_pct,abandonment_rate_pct}])),
  journey_trends: started.map((value,index) => ({date:`2026-10-${String(index+1).padStart(2,'0')}`,started:value,abandoned:abandoned[index],completed:[2,2,2,3,3,3,3,4,4,4,5,5,6,7,6,6,5,4,4,4,3][index]})),
  journey_steps: [283,261,198,102,20].map((count,index) => ({key:['started','step_1','step_2','step_3','completed'][index],count})),
};
const browser = await chromium.launch({headless:true});
try {
  const context = await browser.newContext({viewport:{width:1536,height:1100}});
  await context.addInitScript(() => {
    localStorage.setItem('admin.auth',JSON.stringify({accessToken:'review-only',refreshToken:'review-only',userId:'review-only',username:'Review Admin',role:'SUPER_ADMIN',accessExpiresAt:Date.now()+3600000}));
    localStorage.setItem('theme-mode','light');
  });
  let payload = fixture;
  const methods = [];
  await context.route('**/backend/**',route => { methods.push(route.request().method()); return route.fulfill({json:payload}); });
  const page = await context.newPage();
  const errors = []; page.on('pageerror',error => errors.push(error.message));
  await page.goto('http://localhost:3000/analytics?section=flows',{waitUntil:'networkidle',timeout:120000});
  const card = name => page.getByRole('heading',{name,exact:true}).locator('xpath=ancestor::section[1]');
  const trend = card('Journey trends'), category = card('Journeys by category');
  const completion = card('Completion vs Abandonment Rate'), dropoff = card('User drop-off at each step');
  const grid = trend.locator('..');
  await grid.screenshot({path:'.tmp/journeys-desktop.png'});
  assert.match(await category.innerText(),/283/);
  assert.equal(await category.locator('dl > div').count(),6);
  assert.equal(await completion.getByRole('img').count(),5);
  assert.equal(await dropoff.getByRole('img').count(),5);
  await trend.locator('canvas').focus();
  await page.keyboard.press('End');
  assert.match(await trend.getByRole('status').innerText(),/Oct 21/);
  await trend.getByRole('combobox').selectOption('last7Days');
  await trend.locator('canvas').focus();
  await page.keyboard.press('Home');
  assert.match(await trend.getByRole('status').innerText(),/Oct 15/);
  await trend.getByRole('combobox').selectOption('last21Days');
  for (const width of [1280,1024,768,640,390,320]) {
    await page.setViewportSize({width,height:1100});
    await page.waitForTimeout(450);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false,`overflow at ${width}`);
    const canvases = await grid.locator('canvas').evaluateAll(items => items.map(canvas => ({width:canvas.width,expected:Math.round(canvas.getBoundingClientRect().width*devicePixelRatio)})));
    assert.ok(canvases.every(canvas => canvas.width === canvas.expected),`canvas resize at ${width}`);
    if(width === 390) await grid.screenshot({path:'.tmp/journeys-mobile.png'});
  }
  await page.setViewportSize({width:1536,height:1100});
  await page.evaluate(() => { document.documentElement.classList.add('dark');document.documentElement.dir='rtl'; });
  await page.waitForTimeout(100);
  await grid.screenshot({path:'.tmp/journeys-dark-rtl.png'});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false,'RTL overflow');
  payload = {...fixture, journey_trends:undefined,journey_steps:undefined,flow_breakdown_by_type:{bank_fund_transfer:{total:10,completed:2,abandoned:3}}};
  await page.getByRole('button',{name:'Refresh',exact:true}).click();
  await trend.getByText('Daily journey history is not available for this period.').waitFor();
  assert.match(await dropoff.innerText(),/Journey step counts are not available/);
  assert.match(await completion.getByRole('img').getAttribute('aria-label'),/20%.*30%/);
  payload = {total_initialized_flows:0,total_completed_flows:0,flow_breakdown_by_type:{bank_fund_transfer:{total:0,completed:0,abandoned:0}}};
  await page.getByRole('button',{name:'Refresh',exact:true}).click();
  await completion.getByText('No data available', {exact:false}).waitFor({timeout:5000}).catch(()=>{});
  assert.equal(await category.locator('dl > div').count(),1);
  assert.doesNotMatch(await grid.innerText(),/NaN|Infinity|283/);
  assert.deepEqual(errors,[]);
  assert.ok(methods.every(method => method === 'GET'));
  console.log('Passed: screenshot fixtures, real rate calculations, keyboard navigation, actual date filtering, responsive canvas sizing, 320–1536px, dark RTL, missing history/steps, zero counts, and no runtime errors. Backend requests were mocked and GET only.');
} finally { await browser.close(); }
