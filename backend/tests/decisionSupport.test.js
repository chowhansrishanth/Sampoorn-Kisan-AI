const test = require('node:test');
const assert = require('node:assert/strict');
const profitability = require('../services/profitabilityEngine');
const fertilizer = require('../services/fertilizerPlanner');
const irrigation = require('../services/irrigationService');
const agents = require('../services/agentRegistry');

const costs = { seed: 1000, fertilizer: 2000, pesticides: 500, irrigation: 500, labor: 1500, machinery: 500, transport: 300, miscellaneous: 200 };
test('profitability calculates revenue, break-even, ROI, and provenance', () => {
  const result = profitability.calculateProfitability({ cropName: 'Wheat', landSizeAcres: 2, expectedYieldQuintalsPerAcre: 10, expectedPricePerQuintal: 2000, customInputCosts: costs });
  assert.equal(result.totalYieldQuintals, 20); assert.equal(result.estimatedGrossRevenue, 40000); assert.equal(result.breakEvenPricePerQuintal, 650); assert.equal(result.provenance.calculations, 'CALCULATED');
});
test('profitability rejects invented missing assumptions and supports sensitivity', () => {
  assert.throws(() => profitability.calculateProfitability({ cropName: 'Wheat' }));
  const result = profitability.sensitivity({ cropName: 'Wheat', landSizeAcres: 1, expectedYieldQuintalsPerAcre: 10, expectedPricePerQuintal: 2000, customInputCosts: costs });
  assert.ok(result.low && result.expected && result.high); assert.ok(result.low.estimatedGrossRevenue < result.high.estimatedGrossRevenue);
});
test('fertilizer planner transparently calculates area-scaled quantities', () => {
  const result = fertilizer.plan({ crop: 'Wheat', areaAcres: 2, nutrientTargets: {N:60,P:30,K:20}, rateSource:'TEST FIXTURE prescription, not field advice' });
  assert.equal(result.mode, 'GENERAL_PLAN'); assert.equal(result.nutrientRequirementKg.N, 120); assert.equal(result.provenance.soilTest, 'NOT_PROVIDED');
});
test('irrigation requires real forecast input', () => {
  assert.throws(() => irrigation.calculateIrrigationSchedule({ crop: 'Wheat', landAcres: 1, weatherForecast: null }));
});
test('agent registry selects specialized capabilities', () => {
  const selected = agents.select('market', 'will tomato be profitable with current mandi price?');
  assert.ok(selected.some(agent => agent.name === 'Market Agent')); assert.ok(selected.some(agent => agent.name === 'Profitability Agent'));
});
