'use strict';
const express = require('express');
const { predictCropYield, CROP_YIELD_DATABASE, CLIMATE_RISK_FACTORS } = require('../services/yieldPredictorService');
const router = express.Router();

// GET /api/yield/crops — list supported crops and climate scenarios
router.get('/crops', (req, res) => {
  res.json({
    crops: Object.keys(CROP_YIELD_DATABASE),
    climateScenarios: Object.keys(CLIMATE_RISK_FACTORS),
    irrigationTypes: ['drip', 'sprinkler', 'canal', 'rainfed'],
    soilQualities: ['excellent', 'good', 'fair', 'poor'],
    cultivarTypes: ['hybrid', 'improved', 'local'],
  });
});

// POST /api/yield/predict — predict yield and PMFBY insurance
router.post('/predict', (req, res) => {
  try {
    const { crop, landHectares, irrigationType, soilQuality, climateScenario, cultivarType } = req.body;
    if (!crop || !landHectares) return res.status(400).json({ error: 'crop and landHectares are required' });
    const result = predictCropYield({ crop, landHectares: Number(landHectares), irrigationType, soilQuality, climateScenario, cultivarType });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
