'use strict';
const express = require('express');
const { analyzeSoilHealthCard, ICAR_BENCHMARKS, CROP_NPK_REQUIREMENTS } = require('../services/soilHealthService');
const router = express.Router();

router.get('/crops', (req, res) => {
  res.json({ crops: Object.keys(CROP_NPK_REQUIREMENTS), nutrients: Object.keys(ICAR_BENCHMARKS) });
});

router.post('/analyze', (req, res) => {
  try {
    const { shcData, crop, landHectares } = req.body;
    if (!shcData || !crop) return res.status(400).json({ error: 'shcData and crop are required' });
    const result = analyzeSoilHealthCard(shcData, crop, Number(landHectares) || 1);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
