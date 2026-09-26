'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { saveMeasurement, latestMeasurement } = require('../services/soilMeasurementService');
const router = express.Router();
router.use(requireAuth);

router.get('/latest', async (req, res) => {
  try { return res.json({ success: true, measurement: await latestMeasurement(req.userId) }); }
  catch (error) { return res.status(error.status || 503).json({ success: false, error: error.status === 503 ? error.message : 'Soil measurements could not be loaded.' }); }
});

router.post('/', async (req, res) => {
  try { return res.status(201).json({ success: true, measurement: await saveMeasurement(req.userId, req.body || {}) }); }
  catch (error) { return res.status(error.status || 500).json({ success: false, error: error.status ? error.message : 'Soil measurement could not be saved.' }); }
});

module.exports = router;
