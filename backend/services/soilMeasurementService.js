'use strict';
const SoilMeasurement = require('../models/SoilMeasurement');
const { isDbOperational } = require('../config/db');

const devMeasurements = new Map();
const FIELDS = ['nitrogen', 'phosphorus', 'potassium', 'ph', 'moisture', 'temperature'];
const LIMITS = { nitrogen: [0, 10000], phosphorus: [0, 5000], potassium: [0, 10000], ph: [0, 14], moisture: [0, 100], temperature: [-50, 80] };

function normalize(input = {}) {
  const value = {};
  for (const field of FIELDS) {
    if (input[field] === null || input[field] === undefined || input[field] === '') continue;
    const number = Number(input[field]);
    const [min, max] = LIMITS[field];
    if (!Number.isFinite(number) || number < min || number > max) throw Object.assign(new Error(`Invalid ${field} measurement.`), { status: 400 });
    value[field] = number;
  }
  if (!Object.keys(value).length) throw Object.assign(new Error('At least one soil measurement is required.'), { status: 400 });
  return value;
}

function assertStorage() {
  if (process.env.NODE_ENV === 'production' && !isDbOperational()) throw Object.assign(new Error('Soil measurement storage is temporarily unavailable.'), { status: 503 });
}

async function saveMeasurement(userId, input) {
  assertStorage();
  const value = normalize(input);
  const source = ['soil_test', 'field_sensor', 'laboratory_import'].includes(input.source) ? input.source : 'soil_test';
  const measuredAt = input.measuredAt ? new Date(input.measuredAt) : new Date();
  if (Number.isNaN(measuredAt.getTime()) || measuredAt > new Date()) throw Object.assign(new Error('A valid past measurement date is required.'), { status: 400 });
  const record = { userId: String(userId), ...value, source, unit: typeof input.unit === 'string' && input.unit.trim() ? input.unit.trim().slice(0, 80) : 'reported soil-test units', measuredAt };
  if (isDbOperational()) return SoilMeasurement.create(record);
  const local = { ...record, _id: `dev-soil-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date(), updatedAt: new Date() };
  const existing = devMeasurements.get(String(userId)) || [];
  existing.unshift(local);
  devMeasurements.set(String(userId), existing.slice(0, 50));
  return local;
}

async function latestMeasurement(userId) {
  assertStorage();
  if (isDbOperational()) return SoilMeasurement.findOne({ userId: String(userId) }).sort({ measuredAt: -1 }).lean();
  return (devMeasurements.get(String(userId)) || [])[0] || null;
}

module.exports = { saveMeasurement, latestMeasurement, normalize };
