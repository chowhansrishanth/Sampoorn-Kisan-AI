const express = require('express');
const router = express.Router();
const { getKnowledgeBase, getHistoricalYield } = require('../controllers/knowledgeController');

router.get('/articles', getKnowledgeBase);
router.get('/yield-history', getHistoricalYield);

module.exports = router;
