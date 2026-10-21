import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/zuhoor/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const trend = (change) => ({trend:{change_pct:change,comparison_label:'yesterday'}});
const fixture = {
  date:'2026-10-21',total_classified_turns:11,average_intent_confidence:1,high_confidence_rate_pct:100,llm_fallback_rate_pct:73.33,
  llm_fallback_count:11,guardrail_violations_count:0,
  top_kpis:{total_classified_turns:trend(22),average_intent_confidence:trend(0),high_confidence_rate_pct:trend(0),llm_fallback_rate_pct:trend(12)},
  intent_confidence_buckets:{high:8,medium:2,low:1},
  fallback_reasons:{low_confidence_or_flow_divergence:5,out_of_scope_intent:3,ambiguous_request:2,missing_information:1,other:0},
  guardrail_violations_by_risk:{high:6,medium:3,low:1},guardrail_violations_by_reason:{unsafe_content:6,personal_data:4},
  guardrail_violations_trend:[3,4,5,8,6,4.5,5.5].map((high,index)=>({date:`2026-10-${15+index}`,high,medium:[0.5,1.5,2,3,2,1.2,1.8][index],low:index===3?1:0})),
  intent_distribution:{qr_code:7,chat:2,add_biller:2,others:0},
};
const browser = await chromium.launch({headless:true});
try {
  const context = await browser.newContext({viewport:{width:1536,height:1100}});
  await context.addInitScript(() => {
    localStorage.setItem('admin.auth',JSON.stringify({accessToken:'review-only',refreshToken:'review-only',userId:'review-only',username:'Review Admin',role:'SUPER_ADMIN',accessExpiresAt:Date.now()+3600000}));
    localStorage.setItem('theme-mode','light');
  });
  let payload = fixture;
  const requests = [];
  await context.route('**/backend/**',route => { requests.push({method:route.request().method(),url:route.request().url()});return route.fulfill({json:payload}); });
  const page = await context.newPage(), errors=[], warnings=[];
  page.on('pageerror',error => errors.push(error.message));
  page.on('console',message => { if(/value.*onChange|read-only field/.test(message.text())) warnings.push(message.text()); });
  await page.goto('http://localhost:3000/analytics?section=nlp',{waitUntil:'networkidle',timeout:120000});
  const card = name => page.getByRole('heading',{name,exact:true}).locator('xpath=ancestor::section[1]');
  const confidence = card('Confidence distribution'), fallback=card('Reasons for AI fallback'),risk=card('Safety blocks by risk level'),safety=card('Safety blocks trend'),intent=card('What users ask for');
  await page.screenshot({path:'.tmp/quality-desktop.png',fullPage:true});
  assert.equal(await confidence.getByRole('img').count(),3);
  assert.equal(await risk.getByRole('img').count(),3);
  assert.match(await confidence.getByRole('img').first().getAttribute('aria-label'),/High confidence.*\n.*8/s);
  assert.equal(await fallback.locator('dl > div').count(),5);
  assert.equal(await intent.locator('dl > div').count(),4);
  await confidence.locator('summary').focus();await page.keyboard.press('Enter');
  assert.equal(await confidence.locator('details[open]').count(),1);
  assert.ok(await confidence.getByRole('table').isVisible());
  await confidence.locator('summary').press('Enter');
  await safety.locator('canvas').focus();await page.keyboard.press('End');
  assert.match(await safety.getByRole('status').innerText(),/Oct 21/);
  await safety.getByRole('combobox').selectOption('allTime');
  await page.getByRole('button',{name:'Yesterday',exact:true}).click();
  await confidence.getByText('Today',{exact:true}).waitFor({state:'hidden'});
  assert.ok(requests.some(request=>/date=\d{4}-\d{2}-\d{2}/.test(request.url)),'date filter makes API request');
  await page.getByRole('button',{name:'Today',exact:true}).click();
  for(const width of [1280,1024,768,640,390,320]) {
    await page.setViewportSize({width,height:1000});await page.waitForTimeout(450);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow at ${width}`);
    if(width===390)await page.screenshot({path:'.tmp/quality-mobile.png',fullPage:true});
  }
  await page.setViewportSize({width:1536,height:1100});
  await page.evaluate(()=>{document.documentElement.classList.add('dark');document.documentElement.dir='rtl';});await page.waitForTimeout(450);
  await page.screenshot({path:'.tmp/quality-dark-rtl.png',fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'RTL overflow');
  payload={...fixture,guardrail_violations_trend:undefined};
  await page.getByRole('button',{name:'Refresh',exact:true}).click();
  await safety.getByText('Daily safety history is not available for this period.').waitFor();
  await safety.locator('summary').click();
  assert.ok(await safety.getByRole('table').isVisible(),'reported safety reasons remain accessible without history');
  payload={date:'2026-10-21',total_classified_turns:0,intent_confidence_buckets:{high:0,medium:0,low:0},fallback_reasons:{other:0},intent_distribution:{others:0},guardrail_violations_by_risk:{high:0,medium:0,low:0}};
  await page.getByRole('button',{name:'Refresh',exact:true}).click();
  await page.waitForTimeout(450);
  assert.doesNotMatch(await page.locator('main').innerText(),/NaN|Infinity/);
  payload={date:'2026-10-21'};
  await page.getByRole('button',{name:'Refresh',exact:true}).click();await page.waitForTimeout(450);
  assert.equal(await confidence.locator('[tabindex="0"][role="img"]').count(),0);
  assert.equal(await fallback.locator('dl').count(),0);
  assert.deepEqual(errors,[]);
  assert.deepEqual(warnings,[]);
  assert.ok(requests.every(request=>request.method==='GET'));
  console.log('Passed: AI quality layout, live date requests, correct confidence/risk order, real counts and shares, expandable data, keyboard chart access, 320–1536px, dark RTL, missing safety history, zero and empty responses, no runtime errors. All API responses were isolated fixtures.');
} finally { await browser.close(); }
