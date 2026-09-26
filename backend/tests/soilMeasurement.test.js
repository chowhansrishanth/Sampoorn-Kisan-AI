'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { saveMeasurement, latestMeasurement } = require('../services/soilMeasurementService');

test('soil measurements validate and persist in the intentional development store', async () => {
  const userId = `soil-test-${Date.now()}`;
  const saved = await saveMeasurement(userId, {
    nitrogen: 380, phosphorus: 8, potassium: 220, ph: 6.8,
    source: 'soil_test', unit: 'kg/ha and pH', measuredAt: '2026-09-21T00:00:00.000Z'
  });
  assert.equal(saved.userId, userId);
  const latest = await latestMeasurement(userId);
  assert.equal(latest.ph, 6.8);
  assert.equal(latest.source, 'soil_test');
});

test('soil measurements reject impossible ranges', async () => {
  await assert.rejects(() => saveMeasurement(`soil-invalid-${Date.now()}`, { ph: 19, source: 'soil_test' }), /Invalid ph/);
});
