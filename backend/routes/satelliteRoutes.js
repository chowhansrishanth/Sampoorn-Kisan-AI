'use strict';
const express = require('express');
const router = express.Router();
const { generateNdviGrid } = require('../services/satelliteService');

// GET /api/satellite/ndvi — multispectral NDVI grid & diagnosis
router.get('/ndvi', (req, res) => {
  return res.status(503).json({success:false,status:'NOT_CONFIGURED',error:'No satellite imagery provider is connected. No NDVI observation was generated.'});
  /* Legacy simulation is retained in satelliteService as a research utility only. */
  /* try {
    const { crop = 'Cotton', stage = 'vegetative', lat = 17.38, lon = 78.48 } = req.query;
    const result = generateNdviGrid(crop, stage, Number(lat) || 17.38, Number(lon) || 78.48);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate satellite NDVI data', details: err.message });
  }
  */
});

module.exports = router;
