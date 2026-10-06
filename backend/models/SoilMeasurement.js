'use strict';
const mongoose = require('mongoose');

const soilMeasurementSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  nitrogen: { type: Number, min: 0, max: 10000 },
  phosphorus: { type: Number, min: 0, max: 5000 },
  potassium: { type: Number, min: 0, max: 10000 },
  ph: { type: Number, min: 0, max: 14 },
  moisture: { type: Number, min: 0, max: 100 },
  temperature: { type: Number, min: -50, max: 80 },
  source: { type: String, enum: ['soil_test', 'field_measurement', 'laboratory_import'], required: true },
  unit: { type: String, default: 'reported soil-test units' },
  measuredAt: { type: Date, required: true },
}, { timestamps: true, bufferCommands: false });

soilMeasurementSchema.index({ userId: 1, measuredAt: -1 });

module.exports = mongoose.model('SoilMeasurement', soilMeasurementSchema);
