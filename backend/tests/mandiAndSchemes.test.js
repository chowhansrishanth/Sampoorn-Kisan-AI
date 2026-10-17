'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const app = require('../server');

function makeRequest(server, method, path, body = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {}
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ statusCode: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

test('Mandi Prices and Government Schemes Verification Suite', async (t) => {
  let server;

  await t.test('Setup test HTTP server', async () => {
    server = await new Promise((resolve) => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    assert.ok(server.address().port > 0);
  });

  await t.test('GET /api/schemes returns verified Central and State schemes', async () => {
    const res = await makeRequest(server, 'GET', '/api/schemes');
    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.count >= 8, `Expected at least 8 schemes, got ${res.data.count}`);
    assert.ok(Array.isArray(res.data.schemes));
    assert.ok(res.data.dataSource);
    assert.ok(res.data.lastVerifiedDate);
  });

  await t.test('GET /api/schemes?state=Telangana includes Rythu Bandhu and Rythu Bima', async () => {
    const res = await makeRequest(server, 'GET', '/api/schemes?state=Telangana');
    assert.equal(res.statusCode, 200);
    const ids = res.data.schemes.map(s => s.id);
    assert.ok(ids.includes('rythu_bandhu'), 'Expected rythu_bandhu scheme for Telangana');
    assert.ok(ids.includes('rythu_bima'), 'Expected rythu_bima scheme for Telangana');
    assert.ok(ids.includes('kcc'), 'Expected pan-India KCC scheme');
  });

  await t.test('GET /api/schemes?category=loan returns KCC scheme', async () => {
    const res = await makeRequest(server, 'GET', '/api/schemes?category=loan');
    assert.equal(res.statusCode, 200);
    const ids = res.data.schemes.map(s => s.id);
    assert.ok(ids.includes('kcc'), 'Expected KCC loan scheme');
  });

  await t.test('GET /api/schemes?irrigation=canal returns canal-eligible schemes', async () => {
    const res = await makeRequest(server, 'GET', '/api/schemes?irrigation=canal');
    assert.equal(res.statusCode, 200);
    assert.ok(res.data.count > 0);
    const ids = res.data.schemes.map(s => s.id);
    assert.ok(ids.includes('kcc'));
    assert.ok(ids.includes('pmkisan'));
  });

  await t.test('GET /api/schemes/:id returns single scheme details', async () => {
    const res = await makeRequest(server, 'GET', '/api/schemes/kcc');
    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.scheme.id, 'kcc');
    assert.ok(res.data.scheme.process);
    assert.ok(res.data.scheme.officialSource);
  });

  await t.test('GET /api/market/mandi?crop=Tomato returns valid mandi data structure', async () => {
    const res = await makeRequest(server, 'GET', '/api/market/mandi?crop=Tomato&state=Telangana');
    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
    assert.ok(typeof res.data.modal_price === 'number');
    assert.ok(typeof res.data.min_price === 'number');
    assert.ok(typeof res.data.max_price === 'number');
    assert.ok(res.data.price_date);
    assert.ok(res.data.source);
  });

  await t.test('GET /api/market/mandi without crop returns fallback regional overview', async () => {
    const res = await makeRequest(server, 'GET', '/api/market/mandi?state=Telangana');
    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.prices) && res.data.prices.length > 0);
  });

  await t.test('POST /api/market-forecast/arbitrage returns calculated multi-APMC matrix', async () => {
    const res = await makeRequest(server, 'POST', '/api/market-forecast/arbitrage', {
      commodity: 'Tomato',
      state: 'Telangana',
      quantityQuintals: 25,
      transportCostPerKm: 18
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.status, 'CALCULATED');
    assert.ok(res.data.comparison.length >= 2);
    assert.ok(res.data.bestMandi);
    assert.ok(res.data.comparison[0].netProfit > 0);
  });

  await t.test('Teardown test server', async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    assert.ok(true);
  });
});
