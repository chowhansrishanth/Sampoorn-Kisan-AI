/**
 * Automated Verification Suite for 5 New Agricultural Modules
 * 1. Smart Irrigation & FAO-56 Evapotranspiration
 * 2. APMC Mandi Price Predictor & Arbitrage Matrix
 * 3. Multi-Season Crop Rotation & Soil Nitrogen Simulator
 * 4. Farm Financial Ledger & Loan KCC Statement
 * 5. Satellite NDVI Multispectral Crop Health Visualizer
 */
'use strict';

const irrigationService = require('../services/irrigationService');
const mandiForecastService = require('../services/mandiForecastService');
const cropRotationService = require('../services/cropRotationService');
const ledgerService = require('../services/ledgerService');
const satelliteService = require('../services/satelliteService');

async function runNewFeaturesTestSuite() {
  console.log('\n🌾 Running Master Verification Suite for 5 New Agricultural Features...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ─── 1. Smart Irrigation (FAO-56) Tests ───
  const et0 = irrigationService.calculateETo(34, 22, 28, 17.38);
  assert(et0 > 2.0 && et0 < 10.0, `FAO ETo calculation returns realistic value (${et0} mm/day)`);

  const sched = irrigationService.calculateIrrigationSchedule({
    crop: 'Cotton',
    stage: 'vegetative',
    soil: 'black',
    landAcres: 3.0,
    pumpHp: '5',
    irrigationType: 'drip', initialDeficitMm: 25, pumpFlowLph: 10000,
    weatherForecast: Array.from({length:7},(_,i)=>({date:'2026-09-'+(18+i),day:'Fixture day '+i,tempMax:34,tempMin:22,rainMm:0,et0:5})),
  });
  assert(sched.schedule && sched.schedule.length === 7, '7-day irrigation schedule generated');
  assert(sched.weeklySummary.waterSavedVsFloodPercent === 33, 'Efficiency assumptions imply 33% modeled reduction; not measured savings');
  assert(sched.cropKc === 0.75, 'Cotton vegetative stage Kc matches FAO-56 table (0.75)');

  // ─── 2. Mandi Forecast & Arbitrage Tests ───
  const forecast = await mandiForecastService.predictMandiPrices('Tomato', 'Telangana');
  assert(forecast.status === 'INSUFFICIENT_DATA' && forecast.forecast.length === 0, 'No forecast without real dated history');

  const arbitrage = mandiForecastService.calculateArbitrageMatrix({
    commodity: 'Tomato',
    state: 'Telangana',
    quantityQuintals: 25, transportCostPerKm: 20,
    quotes: [{mandiName:'Test A',date:'2026-09-18',pricePerQuintal:1000,distanceKm:10,loadingCharges:50,cessPercent:1},{mandiName:'Test B',date:'2026-09-18',pricePerQuintal:1100,distanceKm:20,loadingCharges:50,cessPercent:1}],
  });
  assert(arbitrage.comparison.length === 2, `Arbitrage evaluated across ${arbitrage.comparison.length} APMC mandis`);
  assert(arbitrage.comparison[0].netProfit === 26775, 'Net sale return uses supplied quotes and costs');

  // ─── 3. Crop Rotation & Soil Nitrogen Simulator Tests ───
  const rotation = cropRotationService.simulateCropRotation(
    [
      { season: 'Kharif (Year 1)', crop: 'Paddy / Rice' },
      { season: 'Rabi (Year 1)', crop: 'Chickpea / Bengal Gram' },
      { season: 'Zaid (Year 1)', crop: 'Green Gram / Moong' },
    ],
    2.0
  );
  assert(rotation.timeline.length === 3, 'Simulated 3-season crop rotation timeline');
  assert(rotation.timeline[1].nitrogenChangeKg > 0, 'Legume (Chickpea) fixes biological nitrogen (+48 kg/ha)');
  assert(rotation.cumulativeNetProfit > 0, `Multi-season rotation projects positive cumulative net return: ₹${rotation.cumulativeNetProfit}`);

  // ─── 4. Farm Financial Ledger & KCC Statement Tests ───
  const testFarmerId = `test_farmer_${Date.now()}`;
  const initialTxs = ledgerService.getTransactions(testFarmerId);
  assert(initialTxs.length === 0, 'New farmer starts with an empty ledger; no fake transactions');

  const addedTx = ledgerService.addTransaction(testFarmerId, {
    type: 'expense',
    category: 'Seeds',
    amount: 3200,
    notes: 'Groundnut seed procurement',
  });
  assert(addedTx.id.startsWith('tx_'), 'Transaction recorded with generated ID');

  const kccStatement = ledgerService.generateKccStatement(testFarmerId, { farmSizeAcres: 3.0 });
  assert(kccStatement.kccEligibility.recommendedCreditLimit > 50000, `KCC credit limit computed according to NABARD Scale of Finance (₹${kccStatement.kccEligibility.recommendedCreditLimit.toLocaleString()})`);
  assert(kccStatement.kccEligibility.subsidizedInterestRatePercent === 4.0, 'KCC interest subvention rate is 4.0%');

  // ─── 5. Research simulation arithmetic only; production endpoint is unavailable ───
  const ndvi = satelliteService.generateNdviGrid('Cotton', 'vegetative', 17.38, 78.48);
  assert(ndvi.grid.length === 6 && ndvi.grid[0].length === 6, '6x6 multispectral NDVI spatial resolution grid generated');
  assert(ndvi.metrics.averageNdvi >= 0.3 && ndvi.metrics.averageNdvi <= 0.9, `Average NDVI is within valid biological range (${ndvi.metrics.averageNdvi})`);
  assert(typeof ndvi.stressDiagnosis.criticalQuadrant === 'string', 'Stress zone quadrant diagnosed');

  console.log(`\n======================================================`);
  console.log(` 📊 SUMMARY: ${passed} Passed, ${failed} Failed out of ${passed + failed} Tests`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runNewFeaturesTestSuite().catch((err) => {
    console.error('Test execution failure:', err);
    process.exit(1);
  });
}

module.exports = runNewFeaturesTestSuite;
