const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
process.env.NODE_ENV = 'test';
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'kisan-hardening-'));
process.env.MONGO_URI = 'mongodb://127.0.0.1:1/kisan_test';
process.env.JWT_SECRET ||= crypto.randomBytes(48).toString('hex');
const app = require('../server');
let server, base;
test.before(async () => {
  server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await require('mongoose').disconnect(); });
async function request(route, body, token, method = body ? 'POST' : 'GET') {
  const response = await fetch(base + route, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: response.status, data: await response.json(), headers: response.headers };
}
async function account() {
  const email = crypto.randomUUID() + '@example.test';
  const password = 'SecurePass123!';
  const result = await request('/api/auth/register', { name: 'Test Farmer', email, password, confirmPassword: password });
  assert.equal(result.status, 201);
  assert.equal(result.data.token, undefined);
  assert.equal(result.headers.get('set-cookie'), null);
  const login = await request('/api/auth/login', { email, password });
  assert.equal(login.status, 200);
  return { ...login.data, email, password };
}
test('removed authentication routes return 404', async () => {
  for (const route of ['social', 'send-otp', 'verify-otp', 'check-user']) {
    assert.equal((await request('/api/auth/' + route, {})).status, 404);
  }
  assert.equal((await request('/api/auth/methods')).status, 404);
});
test('mobile signup and login require password credentials', async () => {
  const phone = '9876543210', password = 'SecurePass123!';
  const signup = await request('/api/auth/register', { name: 'Mobile Farmer', phone, password });
  assert.equal(signup.status, 201);
  assert.equal(signup.data.token, undefined);
  assert.equal((await request('/api/auth/login', { phone, password })).status, 200);
  for (const body of [{phone}, {password}, {phone, password:'wrong'}]) {
    assert.equal((await request('/api/auth/login', body)).status, body.password === 'wrong' ? 401 : 400);
  }
});
test('email reset stores a digest and rejects expired links', async () => {
  const a = await account();
  const reset = await request('/api/auth/forgot-password', {email:a.email});
  assert.equal(reset.status, 200);
  const raw = reset.data.testResetToken;
  assert.match(raw, /^[a-f0-9]{64}$/);
  const controller = require('../controllers/authController');
  const stored = controller.memFindById(a.user.id);
  assert.equal(stored.resetPasswordToken, crypto.createHash('sha256').update(raw).digest('hex'));
  await controller.updateUserById(a.user.id, {resetPasswordExpires: Date.now()-1});
  assert.equal((await request('/api/auth/reset-password', {token:raw,newPassword:'NextPass123!'})).status,400);
  assert.equal((await request('/api/auth/forgot-password', {email:'9876543210'})).status,400);
});
test('reset email transport sends link without exposing token and cleans up failures', async () => {
  const a = await account();
  const mailer = require('nodemailer');
  const originalTransport = mailer.createTransport;
  const saved = { NODE_ENV: process.env.NODE_ENV, EMAIL_USER: process.env.EMAIL_USER, EMAIL_PASS: process.env.EMAIL_PASS };
  let message;
  try {
    process.env.NODE_ENV = 'development';
    process.env.EMAIL_USER = 'sender@example.test';
    process.env.EMAIL_PASS = 'test-only';
    mailer.createTransport = () => ({ sendMail: async value => { message = value; } });
    const sent = await request('/api/auth/forgot-password', {email:a.email});
    assert.equal(sent.status,200);
    assert.equal(sent.data.testResetToken,undefined);
    assert.equal(message.to,a.email);
    const raw = message.html.match(/reset-password\/([a-f0-9]{64})/)[1];
    const controller = require('../controllers/authController');
    assert.equal(controller.memFindById(a.user.id).resetPasswordToken,crypto.createHash('sha256').update(raw).digest('hex'));
    mailer.createTransport = () => ({sendMail: async () => { throw new Error('Simulated SMTP failure'); }});
    assert.equal((await request('/api/auth/forgot-password',{email:a.email})).status,503);
    assert.equal(controller.memFindById(a.user.id).resetPasswordToken,undefined);
    delete process.env.EMAIL_PASS;
    assert.equal((await request('/api/auth/forgot-password',{email:'unknown@example.test'})).status,503);
  } finally {
    mailer.createTransport = originalTransport;
    for (const [key,value] of Object.entries(saved)) {
      if(value === undefined) delete process.env[key]; else process.env[key]=value;
    }
  }
});
test('rate limit ignores forged forwarding and test keys outside test mode', () => {
  const { createRateLimiter } = require('../middleware/rateLimit');
  const limiter = createRateLimiter({ max: 1 });
  const old = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';
  try {
    let status = 200, nextCount = 0;
    const res = { setHeader() {}, status(value) { status = value; return this; }, json() {} };
    for (let i=0; i<2; i++) limiter({ ip: '127.0.0.1', headers: { 'x-forwarded-for': `10.0.0.${i}`, 'x-test-rate-limit-key': String(i) } }, res, () => nextCount++);
    assert.equal(status, 429); assert.equal(nextCount, 1);
  } finally { process.env.NODE_ENV = old; }
});
test('ledger requires authentication and isolates owners', async () => {
  assert.equal((await request('/api/ledger/victim')).status, 401);
  const a = await account();
  assert.equal((await request('/api/ledger/victim', null, a.token)).status, 403);
  const own = await request('/api/ledger/' + a.user.id, null, a.token);
  assert.equal(own.status, 200); assert.deepEqual(own.data.transactions, []);
  const invalid = await request('/api/ledger/' + a.user.id, { amount: 'Infinity', type: 'income', category: 'Sale' }, a.token);
  assert.equal(invalid.status, 400);
});
test('logout revokes bearer token', async () => {
  const a = await account();
  assert.equal((await request('/api/auth/me', null, a.token)).status, 200);
  assert.equal((await request('/api/auth/logout', {}, a.token)).status, 200);
  assert.equal((await request('/api/auth/me', null, a.token)).status, 401);
});
test('same-second password reset revokes sessions and is single use', async () => {
  const a = await account();
  const raw = crypto.randomBytes(32).toString('hex');
  await require('../controllers/authController').updateUserById(a.user.id, { resetPasswordToken: crypto.createHash('sha256').update(raw).digest('hex'), resetPasswordExpires: Date.now() + 60000 });
  const payload = { token: raw, newPassword: 'NewSecurePass456!' };
  const responses = await Promise.all([request('/api/auth/reset-password', payload), request('/api/auth/reset-password', payload)]);
  assert.deepEqual(responses.map(r=>r.status).sort(), [200,400]);
  assert.equal((await request('/api/auth/me', null, a.token)).status, 401);
  const login = await request('/api/auth/login', { email: a.email, password: payload.newPassword });
  assert.equal(login.status, 200);
  assert.equal((await request('/api/auth/me', null, login.data.token)).status, 200);
});
test('chat memory and benchmark operations require authorization', async () => {
  assert.equal((await request('/api/ai/memory/victim')).status, 401);
  const a = await account();
  assert.equal((await request('/api/benchmark/run', { splitName: '../../secret' }, a.token)).status, 403);
  assert.equal((await request('/api/ai/chat', { message: {} }, a.token)).status, 400);
});
test('missing or spoofed disease images fail without diagnosis', async () => {
  assert.equal((await request('/api/disease/diagnose', { cropType: 'Tomato' })).status, 400);
  const form = new FormData();
  form.append('image', new Blob(['<svg onload="alert(1)"></svg>'], { type: 'image/png' }), 'leaf.png');
  const response = await fetch(base + '/api/disease/diagnose', { method:'POST', body:form });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).success, false);
});
test('unavailable ML service cannot fabricate diagnosis', async () => {
  const service = require('../services/diseaseService');
  const old = process.env.PYTHON_ML_SERVICE;
  process.env.PYTHON_ML_SERVICE = 'http://127.0.0.1:1';
  try {
    const result = await service.analyzeCropImageDetailed({ fileBuffer: Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0]) });
    assert.equal(result.success, false); assert.equal(result.statusCode, 503); assert.equal(result.disease_name, undefined);
  } finally { if (old) process.env.PYTHON_ML_SERVICE=old; else delete process.env.PYTHON_ML_SERVICE; }
});
test('database outage produces non-ready status', async () => { assert.equal((await request('/ready')).status, 503); });
test('production rejects weak or absent signing secrets', () => {
  const { spawnSync } = require('node:child_process');
  const result = spawnSync(process.execPath, ['-e', "require('./config/security')"], { cwd: path.join(__dirname,'..'), env: { ...process.env, NODE_ENV:'production', JWT_SECRET:'', FRONTEND_ORIGINS:'https://example.test' }, encoding:'utf8' });
  assert.notEqual(result.status, 0);
});
