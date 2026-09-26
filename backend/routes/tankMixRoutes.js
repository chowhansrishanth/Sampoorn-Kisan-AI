'use strict';
const express = require('express');
const { checkTankMixCompatibility, getProductCatalog } = require('../services/tankMixService');
const router = express.Router();

router.get('/products', (req, res) => {
  const { category } = req.query;
  const categories = ['insecticide', 'fungicide', 'herbicide', 'foliar_fertilizer'];
  res.json({ products: getProductCatalog(category), categories });
});

router.post('/check', (req, res) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds)) return res.status(400).json({ error: 'productIds must be an array of product IDs' });
    res.json(checkTankMixCompatibility(productIds));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
