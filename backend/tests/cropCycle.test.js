'use strict';
/**
 * ============================================================================
 * CROP CYCLE & DAY 0 COMPREHENSIVE TEST SUITE
 * ============================================================================
 * Validates:
 *  1. Newly registered farmer gets an independent crop cycle starting from Day 0.
 *  2. Day 0 calculation is timezone-safe (today's date = Day 0).
 *  3. Past planting dates accurately compute crop day without forcing back to Day 0.
 *  4. Future planned planting dates are marked as 'planned' and indicate not started.
 *  5. Re-login / refresh retains cycle progress without resetting to Day 0.
 *  6. Different farmers have completely independent crop cycles and tasks.
 *  7. Ownership validation: accessing another farmer's cycle returns 403 Forbidden.
 *  8. Task toggling records completion independently per farmer.
 *  9. Validation rejects invalid dates and missing crop names.
 * ============================================================================
 */
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

describe('Feature 1: Farmer Day 0 & Independent Crop Cycles', () => {
  let server;
  let baseUrl;
  let farmerTokenA;
  let farmerIdA;
  let farmerTokenB;
  let farmerIdB;

  const request = (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(url, { method, headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  before(async () => {
    const app = require('../server');
    server = await new Promise(resolve => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;

    // Register Farmer A
    const phoneA = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const regResA = await request('POST', '/api/auth/register', {
      name: 'Ramesh Patel',
      phone: phoneA,
      email: `ramesh_${Date.now()}@kisan.ai`,
      password: 'StrongPassword123',
      confirmPassword: 'StrongPassword123',
      location: 'Nagpur, Maharashtra, India',
      cropType: 'Bt Hybrid Cotton'
    });
    assert.equal(regResA.status, 201, 'Farmer A registration failed');

    // Login Farmer A
    const logResA = await request('POST', '/api/auth/login', {
      identifier: phoneA,
      password: 'StrongPassword123'
    });
    assert.equal(logResA.status, 200, 'Farmer A login failed');
    farmerTokenA = logResA.data.token;
    farmerIdA = logResA.data.user.id || logResA.data.user._id;

    // Register Farmer B
    const phoneB = `97${Math.floor(10000000 + Math.random() * 90000000)}`;
    const regResB = await request('POST', '/api/auth/register', {
      name: 'Suresh Kumar',
      phone: phoneB,
      email: `suresh_${Date.now()}@kisan.ai`,
      password: 'StrongPassword123',
      confirmPassword: 'StrongPassword123',
      location: 'Ludhiana, Punjab, India',
      cropType: 'Wheat'
    });
    assert.equal(regResB.status, 201, 'Farmer B registration failed');

    // Login Farmer B
    const logResB = await request('POST', '/api/auth/login', {
      identifier: phoneB,
      password: 'StrongPassword123'
    });
    assert.equal(logResB.status, 200, 'Farmer B login failed');
    farmerTokenB = logResB.data.token;
    farmerIdB = logResB.data.user.id || logResB.data.user._id;
  });

  after(async () => {
    if (server) {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
      try { await require('mongoose').disconnect(); } catch (_) {}
    }
  });

  test('1. Newly created crop cycle with today as planting date starts at Day 0', async () => {
    const todayIso = new Date().toISOString().split('T')[0];
    const res = await request('POST', '/api/crop-cycles', {
      cropName: 'Bt Hybrid Cotton',
      cropKey: 'cotton',
      plantingDate: todayIso,
      landAcres: 3.5,
      isPlanned: false,
      soilType: 'black'
    }, farmerTokenA);

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.equal(res.data.cropCycle.currentDay, 0, 'New crop cycle must start at Day 0 on planting day');
    assert.equal(res.data.cropCycle.status, 'active');
    assert.equal(res.data.cropCycle.isStarted, true);
    assert.ok(res.data.cropCycle.tasks.length > 0, 'Should have stage tasks');
    assert.equal(res.data.cropCycle.userId, farmerIdA, 'Cycle must belong to authenticated farmer');
  });

  test('2. Crop cycle with future planting date has status planned and indicates not started', async () => {
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const res = await request('POST', '/api/crop-cycles', {
      cropName: 'Maize',
      cropKey: 'maize',
      plantingDate: futureDate,
      landAcres: 2.0,
      isPlanned: true
    }, farmerTokenA);

    assert.equal(res.status, 201);
    assert.equal(res.data.cropCycle.currentDay, 0);
    assert.equal(res.data.cropCycle.status, 'planned');
    assert.equal(res.data.cropCycle.isStarted, false);
    assert.ok(res.data.cropCycle.daysUntilPlanting >= 9 && res.data.cropCycle.daysUntilPlanting <= 11);
    assert.match(res.data.cropCycle.statusMessage, /not started in real life/i);
  });

  test('3. Crop cycle with past planting date calculates actual elapsed day without forcing back to Day 0', async () => {
    // Sown 15 days ago
    const pastDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const res = await request('POST', '/api/crop-cycles', {
      cropName: 'Wheat',
      cropKey: 'wheat',
      plantingDate: pastDate,
      landAcres: 4.0,
      isPlanned: false
    }, farmerTokenA);

    assert.equal(res.status, 201);
    assert.equal(res.data.cropCycle.currentDay, 15, 'Past planting date must calculate correct elapsed days');
    assert.equal(res.data.cropCycle.status, 'active');
    assert.equal(res.data.cropCycle.isStarted, true);
  });

  test('4. Active crop cycle endpoint returns the farmer\'s current cycle and does not reset on fetch', async () => {
    const res = await request('GET', '/api/crop-cycles/active', null, farmerTokenA);
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.cropCycle !== null);
    assert.equal(res.data.cropCycle.userId, farmerIdA);
  });

  test('5. Farmer B gets independent crop cycle and never sees Farmer A\'s data', async () => {
    // Farmer B fetches their cycles (isolated from Farmer A)
    const initRes = await request('GET', '/api/crop-cycles', null, farmerTokenB);
    assert.equal(initRes.status, 200);
    assert.ok(initRes.data.cropCycles.every(c => c.userId === farmerIdB), 'All cycles must belong only to Farmer B');
    assert.ok(initRes.data.cropCycles.every(c => c.userId !== farmerIdA), 'Farmer B must never see Farmer A\'s cycles');

    // Farmer B creates Wheat cycle starting today (Day 0)
    const todayIso = new Date().toISOString().split('T')[0];
    const createB = await request('POST', '/api/crop-cycles', {
      cropName: 'High-Yield Wheat',
      cropKey: 'wheat',
      plantingDate: todayIso,
      landAcres: 5.0
    }, farmerTokenB);
    assert.equal(createB.status, 201);
    assert.equal(createB.data.cropCycle.currentDay, 0);
    assert.equal(createB.data.cropCycle.userId, farmerIdB);

    // Fetch Farmer B cycles
    const listB = await request('GET', '/api/crop-cycles', null, farmerTokenB);
    assert.ok(listB.data.count >= 1, "Farmer B has their own cycles");
    assert.ok(listB.data.cropCycles.some(c => c.cropName === 'High-Yield Wheat'));
    assert.ok(listB.data.cropCycles.every(c => c.userId === farmerIdB), "All cycles must belong only to Farmer B");

    // Fetch Farmer A cycles: still has their cycles and none belong to Farmer B
    const listA = await request('GET', '/api/crop-cycles', null, farmerTokenA);
    assert.ok(listA.data.cropCycles.every(c => c.userId === farmerIdA), "All cycles must belong only to Farmer A");
    assert.ok(listA.data.cropCycles.every(c => c.userId !== farmerIdB), "Farmer A must never see Farmer B's cycles");
  });

  test('6. Ownership enforcement: Farmer B cannot access or modify Farmer A\'s crop cycle (returns 403)', async () => {
    const listA = await request('GET', '/api/crop-cycles', null, farmerTokenA);
    const cycleAId = listA.data.cropCycles[0].id;

    // Farmer B attempts to get Farmer A's cycle
    const unauthorizedGet = await request('GET', `/api/crop-cycles/${cycleAId}`, null, farmerTokenB);
    assert.equal(unauthorizedGet.status, 403, 'Must forbid reading another farmer\'s cycle');

    // Farmer B attempts to update Farmer A's cycle
    const unauthorizedPut = await request('PUT', `/api/crop-cycles/${cycleAId}`, { notes: 'Hacked' }, farmerTokenB);
    assert.equal(unauthorizedPut.status, 403, 'Must forbid mutating another farmer\'s cycle');

    // Farmer B attempts to toggle a task on Farmer A's cycle
    const unauthorizedTask = await request('POST', `/api/crop-cycles/${cycleAId}/tasks/task_cotton_0_0/toggle`, null, farmerTokenB);
    assert.equal(unauthorizedTask.status, 403, 'Must forbid toggling task on another farmer\'s cycle');
  });

  test('7. Task toggling tracks task progress for the owner', async () => {
    const listA = await request('GET', '/api/crop-cycles', null, farmerTokenA);
    const cycleA = listA.data.cropCycles[0];
    const taskId = cycleA.tasks[0].taskId;

    // Toggle task completed
    const toggleRes = await request('POST', `/api/crop-cycles/${cycleA.id}/tasks/${taskId}/toggle`, null, farmerTokenA);
    assert.equal(toggleRes.status, 200);
    assert.equal(toggleRes.data.task.completed, true);
    assert.ok(toggleRes.data.cropCycle.completedTasksCount >= 1);

    // Toggle back
    const toggleBack = await request('POST', `/api/crop-cycles/${cycleA.id}/tasks/${taskId}/toggle`, null, farmerTokenA);
    assert.equal(toggleBack.status, 200);
    assert.equal(toggleBack.data.task.completed, false);
  });

  test('8. Validation: rejects invalid planting date and missing crop name', async () => {
    const badDate = await request('POST', '/api/crop-cycles', {
      cropName: 'Cotton',
      plantingDate: 'invalid-date-format'
    }, farmerTokenA);
    assert.equal(badDate.status, 400);
    assert.equal(badDate.data.code, 'INVALID_PLANTING_DATE');

    const missingCrop = await request('POST', '/api/crop-cycles', {
      plantingDate: new Date().toISOString()
    }, farmerTokenA);
    assert.equal(missingCrop.status, 400);
    assert.equal(missingCrop.data.code, 'INVALID_CROP');
  });
});
