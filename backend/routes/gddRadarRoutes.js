'use strict';
const express = require('express');
const { computePestRadar, PEST_PHENOLOGY_MODELS } = require('../services/gddRadarService');
const router = express.Router();

router.get('/pests', (req, res) => {
  const summary = Object.entries(PEST_PHENOLOGY_MODELS).map(([id, p]) => ({
    id, name: p.name, crop: p.crop, tBase: p.tBase, gddToFirstGen: p.gddToFirstGeneration,
  }));
  res.json({ pests: summary });
});

router.post('/radar', (req, res) => {
  try {
    const { crop, weatherHistory, bioxfixDate } = req.body;
    if (!crop) return res.status(400).json({ error: 'crop is required' });
    res.json(computePestRadar({ crop, weatherHistory: weatherHistory || [], bioxfixDate }));
  } catch (err) {
    res.status(err.status||500).json({error:err.status===400?err.message:'Pest timing calculation unavailable.'});
  }
});

module.exports = router;
