'use strict';

const assert = require('assert');
const express = require('express');
const http = require('http');

const organicRoutes = require('../routes/organicRoutes');
const solarPumpRoutes = require('../routes/solarPumpRoutes');
const insuranceRoutes = require('../routes/insuranceRoutes');
const carbonRoutes = require('../routes/carbonRoutes');

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

async function runMaxAgriSuite() {
  console.log('\n🌟 Running MAX Agricultural Intelligence Test Suite');
  const app = express();
  app.use(express.json());
  app.use('/api/organic', organicRoutes);
  app.use('/api/solar-pump', solarPumpRoutes);
  app.use('/api/insurance', insuranceRoutes);
  app.use('/api/carbon', carbonRoutes);

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const { port } = server.address();
  let allPassed = true;

  try {
    // 1. Organic Farming
    const t1 = await runTest('GET /api/organic/formulations returns ICAR bio-input catalogue', async () => {
      const res = await makeRequest(server, { hostname: '127.0.0.1', port, path: '/api/organic/formulations', method: 'GET' });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(Array.isArray(res.data.formulations));
      assert.ok(res.data.formulations.length >= 4);
    });
    if (!t1) allPassed = false;

    const t2 = await runTest('POST /api/organic/calculate-acreage scales Jeevamrutha for 3 acres', async () => {
      const res = await makeRequest(server, {
        hostname: '127.0.0.1', port, path: '/api/organic/calculate-acreage', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { formulationId: 'jeevamrutha', acres: 3 });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.totalSolutionLiters, 600);
      assert.strictEqual(res.data.scaledIngredients.freshDesiCowDungKg, 30);
      assert.ok(res.data.chemicalFertilizerSavingsINR > 5000);
    });
    if (!t2) allPassed = false;

    // 2. Solar Pump & PM-KUSUM
    const t3 = await runTest('POST /api/solar-pump/calculate sizes 5HP pump for 180ft borewell with 60% subsidy', async () => {
      const res = await makeRequest(server, {
        hostname: '127.0.0.1', port, path: '/api/solar-pump/calculate', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { depthFeet: 180, irrigationAcres: 4 });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.sizing.recommendedHP, 5);
      assert.strictEqual(res.data.financials.subsidyPercentage, 60);
      assert.ok(res.data.financials.annualDieselSavingsINR > 20000);
      assert.ok(res.data.environmentalImpact.co2MitigatedTonnesPerYear > 0);
    });
    if (!t3) allPassed = false;

    // 3. PMFBY Crop Insurance
    const t4 = await runTest('POST /api/insurance/calculate-premium computes 2% farmer share for Kharif Paddy', async () => {
      const res = await makeRequest(server, {
        hostname: '127.0.0.1', port, path: '/api/insurance/calculate-premium', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { crop: 'Paddy', acres: 4 });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.farmerPremiumRatePercent, 2.0);
      assert.strictEqual(res.data.sumInsuredTotalINR, 128000);
      assert.strictEqual(res.data.farmerPremiumPayableINR, 2560);
      assert.ok(res.data.govtSubsidyINR > res.data.farmerPremiumPayableINR);
    });
    if (!t4) allPassed = false;

    const t5 = await runTest('GET /api/insurance/claim-guide returns 72-hour intimation rules', async () => {
      const res = await makeRequest(server, { hostname: '127.0.0.1', port, path: '/api/insurance/claim-guide', method: 'GET' });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.claimCategories.POST_HARVEST_LOSS);
      assert.strictEqual(res.data.helpline, '14447');
    });
    if (!t5) allPassed = false;

    // 4. Carbon Credits & Regenerative Agriculture
    const t6 = await runTest('POST /api/carbon/estimate calculates tCO2e and voluntary market revenue', async () => {
      const res = await makeRequest(server, {
        hostname: '127.0.0.1', port, path: '/api/carbon/estimate', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { acres: 10, activePractices: ['noTill', 'residueRetention', 'coverCropping'], carbonCreditPriceINR: 2000 });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.totalTCO2SequesteredAnnual > 15);
      assert.ok(res.data.netFarmerCarbonIncomeINR > 20000);
      assert.ok(res.data.practiceBreakdown.length === 3);
    });
    if (!t6) allPassed = false;

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  return allPassed;
}

if (require.main === module) {
  runMaxAgriSuite().then((passed) => {
    process.exit(passed ? 0 : 1);
  });
}

module.exports = runMaxAgriSuite;
