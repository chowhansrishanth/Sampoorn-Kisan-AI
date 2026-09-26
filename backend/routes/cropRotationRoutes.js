'use strict';
const express = require('express');
const router = express.Router();
const { simulateCropRotation, ROTATION_CROP_METRICS, RECOMMENDED_TEMPLATES } = require('../services/cropRotationService');

// POST /api/crop/simulate-rotation — simulate multi-season rotation
router.post('/simulate-rotation', (req, res) => {
  try {
    const { seasons = [], landHectares = 1.0 } = req.body || {};
    const result = simulateCropRotation(seasons, Number(landHectares) || 1.0);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to simulate rotation', details: err.message });
  }
});

// GET /api/crop/rotation-templates — get recommended succession templates
router.get('/rotation-templates', (req, res) => {
  res.json({
    success: true,
    availableCrops: Object.keys(ROTATION_CROP_METRICS),
    templates: RECOMMENDED_TEMPLATES,
  });
});

module.exports = router;
