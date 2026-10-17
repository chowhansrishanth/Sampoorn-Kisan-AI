'use strict';

const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/schemeController');

// GET /api/schemes - list schemes with state, category, irrigation, and search filters
router.get('/', (req, res) => schemeController.getSchemes(req, res));

// GET /api/schemes/:id - single scheme detail
router.get('/:id', (req, res) => schemeController.getSchemeById(req, res));

module.exports = router;
