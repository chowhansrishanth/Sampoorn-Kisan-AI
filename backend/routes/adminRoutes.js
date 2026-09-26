'use strict';
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { listUsers, toggleUserStatus, getStats } = require('../controllers/adminController');

router.use(requireAuth);
router.use(requireAdmin);

router.get('/users', listUsers);
router.put('/users/:id/status', toggleUserStatus);
router.get('/stats', getStats);

module.exports = router;
