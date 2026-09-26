'use strict';
const express = require('express');
const router = express.Router();
const { predictMandiPrices, calculateArbitrageMatrix, COMMODITY_BASE_PRICES, REGIONAL_MANDI_NETWORK } = require('../services/mandiForecastService');

// GET /api/market/forecast — 7-day predicted price trajectory
router.get('/forecast', async (req, res) => {
  try {
    const { commodity = 'Tomato', state, market } = req.query;
    const forecastData = await predictMandiPrices(commodity, state, market);
    return res.json({ success: true, ...forecastData });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to forecast prices', status: 'UNAVAILABLE' });
  }
});

// POST /api/market/arbitrage — Multi-APMC net profit comparison
router.post('/arbitrage', (req, res) => {
  try {
    const {
      commodity = 'Tomato',
      state = 'Telangana',
      quantityQuintals = 20,
      transportCostPerKm = 18,
    } = req.body || {};

    const arbitrageData = calculateArbitrageMatrix({ ...req.body, commodity, state, quantityQuintals: Number(quantityQuintals), transportCostPerKm: Number(transportCostPerKm) });

    return res.json({ success: true, ...arbitrageData });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to calculate arbitrage', details: err.message });
  }
});

// GET /api/market/commodities — list of commodities & states
router.get('/commodities', (req, res) => {
  res.json({
    success: true,
    commodities: Object.keys(COMMODITY_BASE_PRICES),
    states: Object.keys(REGIONAL_MANDI_NETWORK),
  });
});

module.exports = router;
