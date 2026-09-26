'use strict';
const express = require('express');
const { getMachineryCatalog, estimateJobCost, getCategories } = require('../services/hireCenterService');
const router = express.Router();

router.get('/categories', (req, res) => {
  res.json({ categories: ['All', ...getCategories()] });
});

router.get('/machinery', (req, res) => {
  const { category } = req.query;
  res.json({ machinery: getMachineryCatalog(category), total: getMachineryCatalog(category).length });
});

router.post('/estimate', (req, res) => {
  try {
    const { machineId, acres, hours } = req.body;
    if (!machineId) return res.status(400).json({ error: 'machineId is required' });
    res.json(estimateJobCost({ machineId, acres: Number(acres) || 1, hours: Number(hours) || 0 }));
  } catch (err) {
    res.status(err.message.includes('not found') ? 404 : 500).json({ error: err.message });
  }
});

module.exports = router;
