const express = require('express');
const router = express.Router();
const engine = require('../services/profitabilityEngine');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);
router.post('/calculate', (req, res) => {
  try { return res.json({ success: true, data: engine.calculateProfitability(req.body || {}) }); }
  catch (error) { return res.status(400).json({ success: false, error: error.message }); }
});
router.post('/sensitivity', (req, res) => {
  try { return res.json({ success: true, data: engine.sensitivity(req.body || {}) }); }
  catch (error) { return res.status(400).json({ success: false, error: error.message }); }
});
router.post('/compare', (req, res) => {
  try {
    if (!Array.isArray(req.body?.crops) || req.body.crops.length < 2 || req.body.crops.length > 8) return res.status(400).json({ success: false, error: 'Provide between 2 and 8 crop scenarios.' });
    return res.json({ success: true, data: engine.compare(req.body.crops), methodology: 'Sorted by calculated gross margin using supplied assumptions.' });
  } catch (error) { return res.status(400).json({ success: false, error: error.message }); }
});
module.exports = router;
