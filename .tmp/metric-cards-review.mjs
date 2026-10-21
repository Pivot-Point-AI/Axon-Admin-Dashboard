import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const {chromium}=require('C:/Users/zuhoor/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const institutions=Array.from({length:11},(_,i)=>({institution_id:`review-${i}`,institution_name:`Institution ${i+1}`,is_active:true,license_expires_at:i<2?'2026-10-30T00:00:00Z':'2027-10-30T00:00:00Z'}));
const users=['SUPER_ADMIN','SUPER_ADMIN','MANAGER','VIEWER','VIEWER'].map((role,i)=>({user_id:`review-${i}`,username:`Admin ${i+1}`,email:`admin${i+1}@example.test`,role,is_active:true,created_at:'2026-10-01T00:00:00Z'}));
const configs=Array.from({length:6},(_,i)=>({config_key:`setting_${i}`,config_value:i===5?'true':'30',data_type:i===5?'boolean':'integer',description:'System setting',updated_at:'2026-10-05T00:00:00Z'}));
const banks=Array.from({length:59},(_,i)=>({bank_id:i+1,bank_name:`Bank ${i+1}`,abbreviation:`B${i+1}`,is_active:i<58}));
const trend=(change=40.6,comparison='last_month',sparkline=[4,3,2,2,5,6,7,6])=>({trend:{change_pct:change,comparison_label:comparison},sparkline});
const audience={total_users:45,daily_active_users:7,total_sessions:3453,retention_rate_pct:77.78,active_sessions:0,returning_users:35,one_time_users:10,average_sessions_per_user:76.7,weekly_active_users:15,monthly_active_users:21,language_breakdown:{en:30,ur:15},new_users_today:1,new_users_this_week:3,new_users_this_month:8,top_kpis:{total_users:trend(),daily_active_users:trend(-22.2,'yesterday'),total_sessions:trend(),retention_rate_pct:trend(0,'last_month',[77.78,77.78,77.78])}};
const browser=await chromium.launch({headless:true});
try{
const context=await browser.newContext({viewport:{width:1536,height:1000}});
await context.addInitScript(()=>{localStorage.setItem('admin.auth',JSON.stringify({accessToken:'review-only',refreshToken:'review-only',userId:'review-only',username:'Review Admin',role:'SUPER_ADMIN',accessExpiresAt:Date.now()+3600000}));localStorage.setItem('theme-mode','light');});
const requests=[];
await context.route('**/backend/**',route=>{requests.push(route.request().method());const path=new URL(route.request().url()).pathname.replace(/\/$/,'');const json=path.endsWith('/institutions')?institutions:path.endsWith('/management')?users:path.endsWith('/configurations')?configs:path.endsWith('/banks')?banks:path.endsWith('/user-summary')?audience:[];return route.fulfill({json});});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const route of ['institutions','users','configurations','master-data','analytics']){
await page.goto(`http://localhost:3000/${route}`,{waitUntil:'networkidle',timeout:120000});const cards=page.locator('.axon-metric');await cards.first().waitFor();const grid=cards.first().locator('..');await grid.screenshot({path:`.tmp/cards-${route}.png`});
console.log(route,JSON.stringify(await cards.evaluateAll(items=>items.slice(0,4).map(el=>({height:Math.round(el.getBoundingClientRect().height),value:el.innerText,svgColors:[...el.querySelectorAll('svg')].map(svg=>getComputedStyle(svg).color),canvases:[...el.querySelectorAll('canvas')].map(canvas=>({label:canvas.getAttribute('aria-label'),width:canvas.width,height:canvas.height,pixels:canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data.some((v,i)=>i%4===3&&v>0)}))})))));
for(const width of [1280,768,390]){await page.setViewportSize({width,height:1000});await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} overflow at ${width}`);if(width===390)await grid.screenshot({path:`.tmp/cards-${route}-mobile.png`});}
await page.evaluate(()=>{document.documentElement.classList.add('dark');document.documentElement.dir='rtl';});await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} dark RTL overflow`);if(route==='institutions')await grid.screenshot({path:'.tmp/cards-dark-rtl.png'});await page.setViewportSize({width:1536,height:1000});}
assert.deepEqual(errors,[]);assert.ok(requests.every(method=>method==='GET'));console.log('Passed: five metric rows, desktop/tablet/mobile widths, dark RTL, no overflow or runtime errors. Browser data was isolated test fixtures.');
}finally{await browser.close();}
