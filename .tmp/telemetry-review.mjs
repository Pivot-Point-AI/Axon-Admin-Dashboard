import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/zuhoor/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const slow=Array.from({length:11},(_,i)=>({request_id:`review-request-${i}`,latency_ms:5887.64-i*200,intent:i%2?'chat':'qr_code',timestamp:`2026-10-21T08:${String(i).padStart(2,'0')}:00Z`}));
const trend=(change)=>({trend:{change_pct:change,comparison_label:'yesterday'},sparkline:[2,3,2,4,6,4,5]});
const perf={date:'2026-10-21',total_measured_turns:15,slow_turns_count_above_1500ms:11,
  response_time_percentiles:{avg:2973.84,min:6.21,max:5887.64,p50:3516.25,p95:5142.48},
  speech_recognition_percentiles:{avg:120.36,p95:280.41},ai_generation_percentiles:{avg:9.64,p95:28.17},
  total_processing_percentiles:{avg:3104.72,p95:5450.28},
  average_time_by_stage:{intent_classification:3044.35,llm_generation:9.64,stage_1_parsing:2.15,flow_execution:0},
  slowest_interactions:slow.slice(0,5),
  response_time_distribution:[{label:'0–500',count:0},{label:'500–1K',count:1},{label:'1K–2K',count:2},{label:'2K–3K',count:6},{label:'3K–4K',count:3},{label:'4K–5K',count:2},{label:'>5K',count:1}],
  response_time_trend:[3500,3100,3000,2800,2700,2600,2500].map((average,i)=>({date:`2026-10-${15+i}`,average,p95:[6500,5800,6200,5900,5000,4600,4200][i]})),
  top_kpis:{total_measured_turns:trend(36),average_response_time:trend(-36.4),p95_response_time:trend(-28.1),slow_turns_count_above_1500ms:trend(12)},
};
const logs={date:'2026-10-21',found:true,turn_success_count:15,turn_failed_count:0,
  conversation_channels:{voice:10,text:5},speech_recognition_events:{transcribed:8,empty:4,failed:2,garbage_dropped:1},
  token_usage_breakdown:{total:3200,prompt:1800,completion:320,extractions:70},
  actions_delivered:[{action:'generate_qr_code',count:8},{action:'add_biller',count:2}],slow_interactions:slow,recognized_errors:[],
  interaction_outcomes_trend:[10,7,10,17,10,9,5].map((successful,i)=>({date:`2026-10-${15+i}`,successful,failed:i===1?2:1})),
  actions_delivered_trend:[6,9,7,13,10,7,8].map((generate_qr_code,i)=>({date:`2026-10-${15+i}`,generate_qr_code,add_biller:[3,4,3,4,3,2,3][i]})),
  error_trend:[0,2,0,2,1,0,2].map((total,i)=>({date:`2026-10-${15+i}`,total,api:0,validation:0,timeout:0})),
  top_kpis:{turn_success_count:trend(-84.8),turn_failed_count:trend(0),total_tokens:trend(12.4),recorded_errors:trend(-100)},
};
const browser=await chromium.launch({headless:true});
try {
 const context=await browser.newContext({viewport:{width:1536,height:1100}});
 await context.addInitScript(()=>{localStorage.setItem('admin.auth',JSON.stringify({accessToken:'review-only',refreshToken:'review-only',userId:'review-only',username:'Review Admin',role:'SUPER_ADMIN',accessExpiresAt:Date.now()+3600000}));localStorage.setItem('theme-mode','light');});
 let payload=perf;const methods=[];
 await context.route('**/backend/**',route=>{methods.push(route.request().method());return route.fulfill({json:payload});});
 const page=await context.newPage(),errors=[],warnings=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(/value.*onChange|read-only field|MISSING_MESSAGE/.test(message.text()))warnings.push(message.text());});
 const card=name=>page.getByRole('heading',{name,exact:true}).locator('xpath=ancestor::section[1]');
 for(const section of ['performance','logs']) {
  payload=section==='performance'?perf:logs;
  await page.goto(`http://localhost:3000/analytics?section=${section}`,{waitUntil:'networkidle',timeout:120000});
  await page.screenshot({path:`.tmp/${section}-reference-desktop.png`,fullPage:true});
  if(section==='performance') {
   assert.equal(await card('Processing performance').locator('[role="img"][tabindex="0"]').count(),8);
   assert.match(await card('Average time by stage').innerText(),/3,044\.35/);
   assert.match(await card('Average time by stage').innerText(),/Flow Execution/);
   assert.equal(await card('Slowest interactions').getByRole('row').count(),6);
   await card('Processing performance').getByText('View all timing statistics').click();
   assert.equal(await card('Processing performance').locator('details[open]').count(),1);
   await card('Processing performance').getByText('View all timing statistics').click();
  } else {
   assert.match(await card('Conversation channels').innerText(),/66\.7%/);
   assert.match(await card('Token usage').innerText(),/3,200/);
   assert.match(await card('Actions delivered').innerText(),/Generate QR Code/);
   assert.equal(await card('Slowest interactions').getByRole('row').count(),6);
   await card('Slowest interactions').getByRole('button',{name:'Show all'}).click();
   assert.equal(await card('Slowest interactions').getByRole('row').count(),12);
   await card('Slowest interactions').getByRole('button',{name:'Show less'}).click();
  }
  for(const width of [1280,1024,768,640,390,320]) {
   await page.setViewportSize({width,height:1000});await page.waitForTimeout(450);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${section} overflow at ${width}`);
   if(width===390)await page.screenshot({path:`.tmp/${section}-reference-mobile.png`,fullPage:true});
  }
  await page.setViewportSize({width:1536,height:1100});
  await page.evaluate(()=>{document.documentElement.classList.add('dark');document.documentElement.dir='rtl';});await page.waitForTimeout(450);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${section} RTL overflow`);
  await page.screenshot({path:`.tmp/${section}-reference-dark-rtl.png`,fullPage:true});
  await page.evaluate(()=>{document.documentElement.classList.remove('dark');document.documentElement.dir='ltr';});
 }
 payload={...logs,interaction_outcomes_trend:undefined,actions_delivered_trend:undefined,error_trend:undefined};
 await page.getByRole('button',{name:'Refresh',exact:true}).click();
 await card('Recorded errors').getByText('No recorded errors for this period.').waitFor();
 assert.equal(await card('Interaction outcomes').locator('[role="img"][tabindex="0"]').count(),2);
 payload={...perf,response_time_distribution:undefined,response_time_trend:undefined,total_processing_percentiles:undefined};
 await page.goto('http://localhost:3000/analytics?section=performance',{waitUntil:'networkidle'});
 assert.match(await card('Response time distribution').innerText(),/Response time buckets are not provided/);
 assert.match(await card('Response time trend').innerText(),/Daily history is not provided/);
 assert.equal(await card('Processing performance').locator('[role="img"][tabindex="0"]').count(),6);
 assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);assert.ok(methods.every(method=>method==='GET'));
 console.log('Passed: Performance and Activity logs references, current API field aliases, real zero values, timing details, 11-row expansion, 320–1536px, dark RTL, missing histories/distribution, and no console warnings or runtime errors. Browser responses were mocked fixtures.');
} finally {await browser.close();}
