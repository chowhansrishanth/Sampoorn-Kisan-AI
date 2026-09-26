'use strict';
const express = require('express');
const router = express.Router();
router.use(require('../middleware/authMiddleware').requireAuth);
router.param('farmerId', (req, res, next, farmerId) => {
  if (farmerId !== String(req.userId)) return res.status(403).json({ success: false, error: 'Access denied.' });
  next();
});
const {
  getTransactions,
  addTransaction,
  deleteTransaction,
  generateKccStatement,
} = require('../services/ledgerService');

// GET /api/ledger/:farmerId — fetch ledger records
router.get('/:farmerId', (req, res) => {
  const { farmerId } = req.params;
  const transactions = getTransactions(farmerId);
  res.json({ success: true, count: transactions.length, transactions });
});

// POST /api/ledger/:farmerId — add an expense or income entry
router.post('/:farmerId', (req, res) => {
  const { farmerId } = req.params;
  const { type, category, amount, date, notes } = req.body || {};

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0 || Number(amount) > 1e9 || !['income','expense'].includes(type) || typeof category !== 'string' || category.length > 100 || (notes != null && (typeof notes !== 'string' || notes.length > 2000)) || (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
    return res.status(400).json({ success: false, error: 'Valid transaction amount required' });
  }

  const tx = addTransaction(farmerId, { type, category, amount, date, notes });
  res.json({ success: true, transaction: tx, message: 'Transaction recorded successfully' });
});

// DELETE /api/ledger/:farmerId/:txId — remove entry
router.delete('/:farmerId/:txId', (req, res) => {
  const { farmerId, txId } = req.params;
  const deleted = deleteTransaction(farmerId, txId);
  res.json({ success: deleted, message: deleted ? 'Transaction removed' : 'Transaction not found' });
});

// GET /api/ledger/:farmerId/kcc-statement — generate loan-ready financial statement
router.get('/:farmerId/kcc-statement', (req, res) => {
  const { farmerId } = req.params;
  const { farmSizeAcres = 2.5, cropType = 'Cotton & Pulses', farmerName = 'Farmer' } = req.query;

  const statement = generateKccStatement(farmerId, {
    farmSizeAcres: Number(farmSizeAcres) || 2.5,
    cropType,
    farmerName,
  });

  res.json({ success: true, statement });
});

module.exports = router;
