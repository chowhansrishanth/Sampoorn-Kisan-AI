'use strict';

const assert = require('assert');
const express = require('express');
const http = require('http');
const livestockRoutes = require('../routes/livestockRoutes');

function runTest(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(`  ✓ ${name}`);
      return true;
    })
    .catch((err) => {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err.message}`);
      return false;
    });
}

function makeRequest(server, options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runLivestockTests() {
  console.log('\n🐾 Running Livestock & Dairy Advisor Test Suite');
  const app = express();
  app.use(express.json());
  app.use('/api/livestock', livestockRoutes);

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const { port } = server.address();
  let allPassed = true;

  try {
    // Test 1: Triage detects Foot and Mouth Disease
    const test1 = await runTest('POST /api/livestock/triage identifies FMD blisters and drooling', async () => {
      const res = await makeRequest(server, {
        hostname: '127.0.0.1',
        port,
        path: '/api/livestock/triage',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        species: 'Cattle',
        symptoms: ['high fever', 'blisters on tongue and hoof', 'excessive drooling salivation']
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.primaryDiagnosis.id, 'fmd');
      assert.ok(res.data.primaryDiagnosis.matchConfidence >= 50);
      assert.ok(res.data.primaryDiagnosis.firstAid.length > 0);
    });
    if (!test1) allPassed = false;

    // Test 2: Triage detects Bovine Mastitis
    const test2 = await runTest('POST /api/livestock/triage identifies Mastitis udder infection', async () => {
      const res = await makeRequest(server, {
        hostname: '127.0.0.1',
        port,
        path: '/api/livestock/triage',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        species: 'Cattle',
        symptoms: ['swollen udder', 'blood in milk', 'painful teat']
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.primaryDiagnosis.id, 'mastitis');
      assert.strictEqual(res.data.primaryDiagnosis.urgency, 'URGENT_VET_EXAM');
    });
    if (!test2) allPassed = false;

    // Test 3: Triage handles empty input gracefully
    const test3 = await runTest('POST /api/livestock/triage rejects empty symptom query', async () => {
      const res = await makeRequest(server, {
        hostname: '127.0.0.1',
        port,
        path: '/api/livestock/triage',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        species: 'Cattle',
        symptoms: []
      });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    });
    if (!test3) allPassed = false;

    // Test 4: ICAR Balanced Dairy Ration Calculator
    const test4 = await runTest('POST /api/livestock/ration calculates DM, green fodder, and concentrate', async () => {
      const res = await makeRequest(server, {
        hostname: '127.0.0.1',
        port,
        path: '/api/livestock/ration',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        species: 'Cow',
        bodyWeightKg: 400,
        milkYieldLiters: 12,
        fatPercentage: 4.2
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      const diet = res.data.dailyDietRecommendations;
      assert.ok(diet.totalDryMatterKg > 10 && diet.totalDryMatterKg < 18);
      assert.ok(diet.feedIngredientsFreshWeight.greenFodderKg > 15);
      assert.ok(diet.feedIngredientsFreshWeight.dryStrawKg > 3);
      assert.ok(diet.feedIngredientsFreshWeight.concentratePelletKg > 3);
      assert.ok(diet.feedIngredientsFreshWeight.mineralMixtureGrams >= 50);
    });
    if (!test4) allPassed = false;

    // Test 5: National Vaccination & Deworming Schedule
    const test5 = await runTest('GET /api/livestock/vaccination returns immunization timeline', async () => {
      const res = await makeRequest(server, {
        hostname: '127.0.0.1',
        port,
        path: '/api/livestock/vaccination',
        method: 'GET'
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(Array.isArray(res.data.vaccinationSchedule));
      assert.ok(res.data.vaccinationSchedule.length >= 4);
      assert.ok(Array.isArray(res.data.dewormingSchedule));
    });
    if (!test5) allPassed = false;

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  return allPassed;
}

if (require.main === module) {
  runLivestockTests().then((passed) => {
    process.exit(passed ? 0 : 1);
  });
}

module.exports = runLivestockTests;
