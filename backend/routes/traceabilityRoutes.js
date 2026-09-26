'use strict';
const express = require('express');
const { createBatch, addCheckpoint, getBatch, getSampleBatches } = require('../services/traceabilityService');
const router = express.Router();
router.use(require('../middleware/authMiddleware').requireAuth);
router.param('batchId', (req, res, next, id) => {
  const batch = getBatch(id);
  if (!batch || String(batch.farmerId) !== String(req.userId)) return res.status(404).json({ error: 'Batch not found' });
  next();
});

router.get('/batches', (req, res) => {
  const farmerId = req.userId;
  const batches = getSampleBatches(farmerId);
  res.json({ batches, total: batches.length });
});

router.get('/batch/:batchId', (req, res) => {
  const batch = getBatch(req.params.batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });
  res.json(batch);
});

router.post('/batch', (req, res) => {
  try {
    const batch = createBatch({ ...req.body, farmerId: req.userId });
    res.status(201).json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/batch/:batchId/checkpoint', (req, res) => {
  try {
    const updated = addCheckpoint(req.params.batchId, req.body);
    res.json(updated);
  } catch (err) {
    res.status(err.message.includes('not found') ? 404 : 500).json({ error: err.message });
  }
});

module.exports = router;
