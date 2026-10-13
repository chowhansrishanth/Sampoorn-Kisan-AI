'use strict';
/**
 * ============================================================================
 * CROP CYCLE ROUTES — AUTHENTICATED FARMER CROP LIFECYCLE API
 * ============================================================================
 */
const express = require('express');
const router = express.Router();
const {
  createCropCycle,
  getCropCycles,
  getActiveCropCycle,
  getCropCycleById,
  updateCropCycle,
  toggleCycleTask,
  deleteCropCycle
} = require('../controllers/cropCycleController');
const { requireAuth } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

// All crop cycle endpoints require authenticated farmer identity
router.use(requireAuth);

router.post('/', asyncHandler(createCropCycle));
router.get('/', asyncHandler(getCropCycles));
router.get('/active', asyncHandler(getActiveCropCycle));
router.get('/:id', asyncHandler(getCropCycleById));
router.put('/:id', asyncHandler(updateCropCycle));
router.post('/:id/tasks/:taskId/toggle', asyncHandler(toggleCycleTask));
router.delete('/:id', asyncHandler(deleteCropCycle));

module.exports = router;
