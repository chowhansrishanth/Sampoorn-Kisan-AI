const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
process.env.NODE_ENV = 'test';
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'kisan-browser-'));
process.env.MONGO_URI = 'mongodb://127.0.0.1:1/kisan_test';
process.env.JWT_SECRET = require('node:crypto').randomBytes(48).toString('hex');
const express = require('express');
const app = express();
app.use(express.static(path.resolve(__dirname, '../../frontend/dist')));
app.get('/reset-password/:token', (req,res)=>res.sendFile(path.resolve(__dirname, '../../frontend/dist/index.html')));
app.use(require('../server'));
async function main() {
 const server = await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
 const base = `http://127.0.0.1:${server.address().port}`;
 let browser;
 try {
  console.log('Launching browser smoke test');
  browser = await require('puppeteer-core').launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,pipe:true});
  console.log('Browser launched');
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  const consoleErrors=[];
  page.on('console', m=>{if(m.type()==='error')consoleErrors.push(m.text());});
  const layoutDir=path.resolve(__dirname,'../../.audit/panel-layout');
  fs.mkdirSync(layoutDir,{recursive:true});
  const checkLayouts = async state => {
   for (const [width,height] of [[1440,900],[768,1024],[390,844],[320,568],[844,390]]) {
    await page.setViewport({width,height});
    await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState !== 'running'));
    const layout=await page.evaluate(()=>{
     const panel=document.querySelector('.lg-form-panel');
     const card=document.querySelector('.lg-card');
     const overlay=document.querySelector('.lg-overlay');
     overlay.scrollTop=0;
     const rect=card.getBoundingClientRect();
     return {
      removed: !document.querySelector('.lg-brand-panel, .lg-split, .lg-bg-art, .lg-typewriter-cursor'),
      promotionalText: /Grow smarter|Smart Agriculture Platform|AES-256 encrypted privacy|Federated AI — data stays local|Personalized crop recommendations|Real-time IoT telemetry alerts/.test(document.body.innerText),
      fits: panel.scrollWidth<=panel.clientWidth && overlay.scrollWidth<=overlay.clientWidth && card.scrollWidth<=card.clientWidth,
      centered: Math.abs(rect.x+rect.width/2-innerWidth/2)<2,
      top: rect.top,
     };
    });
    assert.equal(layout.removed,true);
    assert.equal(layout.promotionalText,false);
    assert.equal(layout.fits,true, `${state} overflows at ${width}x${height}`);
    assert.equal(layout.centered,true, `${state} is not centered at ${width}x${height}`);
    assert.ok(layout.top>=0, `${state} top is clipped at ${width}x${height}`);
    await page.screenshot({path:path.join(layoutDir,`${state}-${width}x${height}.png`)});
   }
   await page.setViewport({width:390,height:844});
   console.log(`PASS ${state}: desktop, tablet, mobile and short landscape layout`);
  };
  const button = async text => {
   const handle=await page.evaluateHandle(text=>{
     const btns = Array.from(document.querySelectorAll('button')).filter(b=>b.textContent.trim()===text);
     return btns.find(b=>b.type==='submit') || btns[0];
   },text);
   assert.ok(handle.asElement(), `Missing button: ${text}`);
   await handle.asElement().click();
  };
  const waitText = text=>page.waitForFunction(text=>document.body.innerText.includes(text),{},text);
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#login-identifier');
  console.log('Login page loaded');
  await checkLayouts('login');
  assert.equal(await page.$eval('button[type="submit"]', b=>b.disabled),true);
  assert.doesNotMatch(await page.$eval('body',b=>b.innerText),/Continue with (Google|Apple)|verification code|\bOTP\b/i);
  await button('Create Free Account');
  await checkLayouts('signup');
  const email=`browser${Date.now()}@example.test`, password='SecurePass123!';
  await page.type('input[placeholder="Full Name"]','Browser Farmer');
  await page.type('input[type="email"]',email);
  await page.type('input[placeholder="Password (min 8 chars)"]',password);
  await page.type('input[placeholder="Confirm Password"]',password);
  await button('Continue');
  await waitText('Farm Profile & Location');
  await checkLayouts('farm-profile');
  assert.doesNotMatch(await page.$eval('body',b=>b.innerText),/verification code|\bOTP\b/i);
  for (let s = 1; s < 8; s++) {
    await page.evaluate(() => new Promise(r => setTimeout(r, 150)));
    await button('Continue');
  }
  const submitBtn = await page.waitForSelector('#btn-register-submit');
  await submitBtn.click();
  await waitText('Account created successfully. Please sign in.');
  await page.waitForSelector('#login-password');
  assert.equal((await page.cookies()).some(c=>c.name==='token'),false);
  await page.type('#login-password',password);
  await button('Sign In');
  await page.waitForFunction(()=>Boolean(localStorage.getItem('sampoorn_user_session')));
  assert.equal((await page.cookies()).some(c=>c.name==='token' && c.httpOnly),true);
  // Reset link is requested by the UI; inspect the isolated test response only in memory.
  await page.evaluate(()=>localStorage.clear());
  await page.deleteCookie(...await page.cookies());
  await page.goto(base,{waitUntil:'networkidle0'});
  await button('Forgot password?');
  await checkLayouts('forgot-password');
  await page.type('input[type="email"]',email);
  const response=page.waitForResponse(r=>r.url().endsWith('/api/auth/forgot-password'));
  await button('Send Reset Link');
  const reset=await (await response).json();
  assert.ok(reset.testResetToken);
  await page.goto(base+'/reset-password/'+reset.testResetToken,{waitUntil:'networkidle0'});
  const fields=await page.$$('input[type="password"]');
  assert.equal(fields.length,2);
  for(const field of fields)await field.type('NextSecurePass456!');
  await button('Update Password');
  await waitText('Password Reset Successfully!');
  await page.waitForSelector('#login-password');
  await page.type('#login-identifier',email);
  await page.type('#login-password','NextSecurePass456!');
  await button('Sign In');
  await page.waitForFunction(()=>Boolean(localStorage.getItem('sampoorn_user_session')));
  assert.deepEqual(errors,[]);
  assert.deepEqual(consoleErrors.filter(m=>!/^Failed to load resource: the server responded with a status of (401|404)/.test(m)),[]);
  console.log('Console checked: only expected signed-out 401 probes and existing missing-icon 404 resource messages.');
  console.log('PASS browser signup -> login, secure cookie, forgot -> reset link -> new password; no uncaught browser errors.');
 } finally {
  if(browser)await browser.close();
  server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
  await require('mongoose').disconnect();
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
