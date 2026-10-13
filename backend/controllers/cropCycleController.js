'use strict';
/**
 * ============================================================================
 * CROP CYCLE CONTROLLER — INDEPENDENT FARMER CROP LIFE CYCLE
 * ============================================================================
 * 
 * Guarantees:
 *  - Every new farmer starts from Day 0 (when created with planting date = today)
 *  - Timezone-safe date arithmetic (UTC calendar days)
 *  - Planned planting dates clearly indicate the cycle has not started in real life
 *  - Past planting dates dynamically calculate crop day without forcing back to Day 0
 *  - Never resets crop cycle on login or refresh
 *  - Strict authentication & authorization: users can only view and mutate their own cycles
 *  - Both MongoDB and file-backed fallback support for seamless testing and persistence
 * ============================================================================
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const CropCycle = require('../models/CropCycle');
const User = require('../models/User');
const { isDbOperational } = require('../config/db');
const {
  calculateCropDay,
  getStageForCropDay,
  generateInitialTasksForCrop,
  toUtcMidnight
} = require('../utils/cropCycleCalculator');

// ── Persistent File-Backed Store Fallback (when Mongo unavailable or in test mode) ──
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');
const CYCLES_FILE = path.join(DATA_DIR, 'crop_cycles_store.json');

if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_) {}
}

const memCycles = new Map(); // id -> cycle object

const loadCyclesFromDisk = () => {
  try {
    if (fs.existsSync(CYCLES_FILE)) {
      const raw = fs.readFileSync(CYCLES_FILE, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        list.forEach(c => {
          if (c && (c.id || c._id)) {
            const id = (c.id || c._id).toString();
            memCycles.set(id, { ...c, id, _id: id });
          }
        });
      }
    }
  } catch (err) {
    console.warn('Failed to load crop cycles from disk:', err.message);
  }
};

const persistCyclesToDisk = () => {
  try {
    const list = Array.from(memCycles.values());
    const tmp = path.join(DATA_DIR, `crop_cycles.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);
    fs.writeFileSync(tmp, JSON.stringify(list, null, 2), 'utf8');
    try {
      fs.renameSync(tmp, CYCLES_FILE);
    } catch (_) {
      fs.copyFileSync(tmp, CYCLES_FILE);
      try { fs.unlinkSync(tmp); } catch (_) {}
    }
  } catch (err) {
    console.warn('Failed to save crop cycles to disk:', err.message);
  }
};

loadCyclesFromDisk();

const memSaveCycle = (cycle) => {
  const id = (cycle.id || cycle._id || crypto.randomBytes(12).toString('hex')).toString();
  const stored = { ...cycle, id, _id: id, updatedAt: new Date() };
  memCycles.set(id, stored);
  persistCyclesToDisk();
  return stored;
};

const memFindCyclesByUser = (userId) => {
  const out = [];
  for (const [, c] of memCycles) {
    if (c && String(c.userId) === String(userId)) {
      out.push(c);
    }
  }
  return out.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

const memFindCycleById = (id) => {
  if (!id) return null;
  return memCycles.get(String(id)) || null;
};

const memDeleteCycleById = (id) => {
  if (!id) return false;
  const deleted = memCycles.delete(String(id));
  if (deleted) persistCyclesToDisk();
  return deleted;
};

// ── Sanitizer & Dynamic Day Calculator ─────────────────────────────────────
const enrichCycleWithLiveProgress = (cycleDoc) => {
  if (!cycleDoc) return null;
  const cycle = cycleDoc.toObject ? cycleDoc.toObject() : { ...cycleDoc };
  const id = cycle._id ? cycle._id.toString() : (cycle.id ? cycle.id.toString() : '');

  // Calculate live dynamic day based on saved planting date and today's date
  const dayInfo = calculateCropDay(cycle.plantingDate, new Date(), cycle.isPlanned);
  const stageInfo = getStageForCropDay(dayInfo.cropDay, cycle.durationDays || 120);

  // Compute task statistics
  const tasks = Array.isArray(cycle.tasks) ? cycle.tasks : [];
  const completedCount = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const taskProgressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return {
    ...cycle,
    id,
    _id: id,
    currentDay: dayInfo.cropDay,
    daysSincePlanting: dayInfo.daysSincePlanting,
    daysUntilPlanting: dayInfo.daysUntilPlanting,
    status: dayInfo.status,
    isStarted: dayInfo.isStarted,
    statusMessage: dayInfo.message,
    currentStage: stageInfo.name,
    currentStageKey: stageInfo.key,
    currentPhase: stageInfo.phase,
    taskProgressPct,
    completedTasksCount: completedCount,
    totalTasksCount: totalTasks
  };
};

/**
 * POST /api/crop-cycles
 * Creates an independent crop cycle starting from Day 0 for the authenticated farmer.
 */
const createCropCycle = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const {
      cropName,
      cropKey,
      variety,
      landAcres,
      plantingDate,
      isPlanned,
      durationDays,
      soilType,
      season,
      irrigationType,
      notes
    } = req.body || {};

    // 1. Validate crop selection
    if (!cropName || typeof cropName !== 'string' || !cropName.trim()) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_CROP',
        error: 'Please select a valid crop name.'
      });
    }

    // 2. Validate planting date
    if (!plantingDate) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PLANTING_DATE',
        error: 'Please enter a valid planting or sowing date.'
      });
    }

    const parsedDate = new Date(plantingDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PLANTING_DATE',
        error: 'The planting date provided is not a valid date format.'
      });
    }

    // Check reasonable bounds on planting date (not older than 1 year or further than 1 year)
    const now = Date.now();
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    if (parsedDate.getTime() < now - oneYearMs || parsedDate.getTime() > now + oneYearMs) {
      return res.status(400).json({
        success: false,
        code: 'DATE_OUT_OF_BOUNDS',
        error: 'Planting date must be within 1 year of the current date.'
      });
    }

    const cleanCropName = cropName.trim();
    const cleanCropKey = (cropKey || cleanCropName).toLowerCase().replace(/[^a-z0-9]/g, '_');
    const safeAcres = Number(landAcres) > 0 ? Number(landAcres) : 2.0;
    const safeDuration = Number(durationDays) > 0 ? Math.min(365, Math.max(30, Number(durationDays))) : 120;

    // Determine planned status: if date is in future or isPlanned is true
    const dayInfo = calculateCropDay(parsedDate, new Date(), Boolean(isPlanned));
    const isActuallyPlanned = Boolean(isPlanned) || dayInfo.status === 'planned';
    const effectiveStatus = isActuallyPlanned ? 'planned' : 'active';

    // Generate stage-specific ICAR agronomic tasks for this farmer's crop
    const initialTasks = generateInitialTasksForCrop(cleanCropKey, cleanCropName, safeDuration);

    const stageInfo = getStageForCropDay(dayInfo.cropDay, safeDuration);

    const cyclePayload = {
      userId: String(userId),
      cropName: cleanCropName,
      cropKey: cleanCropKey,
      variety: typeof variety === 'string' ? variety.trim() : '',
      landAcres: safeAcres,
      plantingDate: parsedDate,
      isPlanned: isActuallyPlanned,
      status: effectiveStatus,
      cycleStartDate: new Date(),
      durationDays: safeDuration,
      soilType: typeof soilType === 'string' ? soilType : 'black',
      season: typeof season === 'string' ? season : 'kharif',
      irrigationType: typeof irrigationType === 'string' ? irrigationType : 'drip',
      stage: stageInfo.name,
      tasks: initialTasks,
      notes: typeof notes === 'string' ? notes.trim() : '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // ── Save to MongoDB if operational ──
    if (isDbOperational()) {
      try {
        const newDoc = new CropCycle(cyclePayload);
        await newDoc.save();

        // Also update memory store
        memSaveCycle(newDoc.toObject());

        return res.status(201).json({
          success: true,
          message: isActuallyPlanned
            ? `Planned crop cycle created for ${cleanCropName}. Day 0 will begin on your planting date.`
            : `New crop cycle initialized for ${cleanCropName} starting at Day ${dayInfo.cropDay}.`,
          cropCycle: enrichCycleWithLiveProgress(newDoc)
        });
      } catch (dbErr) {
        console.warn('⚠️ Mongo crop-cycle save failed, falling back to disk:', dbErr.message);
      }
    }

    // ── Save to disk fallback ──
    const memDoc = memSaveCycle(cyclePayload);
    return res.status(201).json({
      success: true,
      message: isActuallyPlanned
        ? `Planned crop cycle created for ${cleanCropName}. Day 0 will begin on your planting date.`
        : `New crop cycle initialized for ${cleanCropName} starting at Day ${dayInfo.cropDay}.`,
      cropCycle: enrichCycleWithLiveProgress(memDoc)
    });

  } catch (err) {
    console.error('Create crop cycle error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to create crop cycle',
      details: err.message
    });
  }
};

/**
 * GET /api/crop-cycles
 * Returns all crop cycles for the authenticated farmer with dynamically calculated Day count.
 */
const getCropCycles = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Authentication required' });

    let cycles = [];

    if (isDbOperational()) {
      try {
        const docs = await CropCycle.find({ userId: String(userId) }).sort({ createdAt: -1 });
        cycles = docs.map(d => enrichCycleWithLiveProgress(d));
      } catch (dbErr) {
        console.warn('⚠️ Mongo fetch crop-cycles failed, using disk:', dbErr.message);
      }
    }

    if (cycles.length === 0) {
      const memList = memFindCyclesByUser(userId);
      cycles = memList.map(c => enrichCycleWithLiveProgress(c));
    }

    return res.json({
      success: true,
      count: cycles.length,
      cropCycles: cycles
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve crop cycles' });
  }
};

/**
 * GET /api/crop-cycles/active
 * Returns the currently active (or most recent) crop cycle for the authenticated farmer.
 */
const getActiveCropCycle = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Authentication required' });

    let activeCycle = null;

    if (isDbOperational()) {
      try {
        // First try to find active or planned cycle
        activeCycle = await CropCycle.findOne({
          userId: String(userId),
          status: { $in: ['active', 'planned'] }
        }).sort({ createdAt: -1 });

        // If none found with active/planned, return the most recent one
        if (!activeCycle) {
          activeCycle = await CropCycle.findOne({ userId: String(userId) }).sort({ createdAt: -1 });
        }
      } catch (dbErr) {
        console.warn('⚠️ Mongo getActiveCycle failed, using disk:', dbErr.message);
      }
    }

    if (!activeCycle) {
      const userCycles = memFindCyclesByUser(userId);
      activeCycle = userCycles.find(c => c.status === 'active' || c.status === 'planned') || userCycles[0] || null;
    }

    if (!activeCycle) {
      return res.json({
        success: true,
        cropCycle: null,
        message: 'No active crop cycle found. Please initialize a new crop cycle to start from Day 0.'
      });
    }

    return res.json({
      success: true,
      cropCycle: enrichCycleWithLiveProgress(activeCycle)
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve active crop cycle' });
  }
};

/**
 * GET /api/crop-cycles/:id
 * Retrieves a specific crop cycle, enforcing ownership.
 */
const getCropCycleById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    let cycle = null;
    if (isDbOperational()) {
      try {
        cycle = await CropCycle.findById(id);
      } catch (_) {}
    }

    if (!cycle) {
      cycle = memFindCycleById(id);
    }

    if (!cycle) {
      return res.status(404).json({ success: false, error: 'Crop cycle not found' });
    }

    // Strict Authorization check: ownership enforcement
    if (String(cycle.userId) !== String(userId)) {
      return res.status(403).json({ success: false, error: 'Access denied. You do not own this crop cycle.' });
    }

    return res.json({
      success: true,
      cropCycle: enrichCycleWithLiveProgress(cycle)
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve crop cycle' });
  }
};

/**
 * PUT /api/crop-cycles/:id
 * Updates crop cycle details (e.g. planting date, notes, status), enforcing ownership.
 */
const updateCropCycle = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { plantingDate, isPlanned, status, variety, landAcres, notes } = req.body || {};

    let cycle = null;
    let isMongo = false;

    if (isDbOperational()) {
      try {
        cycle = await CropCycle.findById(id);
        if (cycle) isMongo = true;
      } catch (_) {}
    }

    if (!cycle) {
      cycle = memFindCycleById(id);
    }

    if (!cycle) {
      return res.status(404).json({ success: false, error: 'Crop cycle not found' });
    }

    // Ownership validation
    if (String(cycle.userId) !== String(userId)) {
      return res.status(403).json({ success: false, error: 'Access denied. You do not own this crop cycle.' });
    }

    if (plantingDate !== undefined) {
      const pDate = new Date(plantingDate);
      if (isNaN(pDate.getTime())) {
        return res.status(400).json({ success: false, error: 'Invalid planting date.' });
      }
      cycle.plantingDate = pDate;
    }

    if (isPlanned !== undefined) {
      cycle.isPlanned = Boolean(isPlanned);
    }

    if (status && ['planned', 'active', 'completed'].includes(status)) {
      cycle.status = status;
    }

    if (variety !== undefined) cycle.variety = String(variety).trim();
    if (landAcres !== undefined && Number(landAcres) > 0) cycle.landAcres = Number(landAcres);
    if (notes !== undefined) cycle.notes = String(notes);
    cycle.updatedAt = new Date();

    if (isMongo) {
      await cycle.save();
      memSaveCycle(cycle.toObject());
      return res.json({
        success: true,
        message: 'Crop cycle updated successfully.',
        cropCycle: enrichCycleWithLiveProgress(cycle)
      });
    }

    const savedMem = memSaveCycle(cycle);
    return res.json({
      success: true,
      message: 'Crop cycle updated successfully.',
      cropCycle: enrichCycleWithLiveProgress(savedMem)
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update crop cycle' });
  }
};

/**
 * POST /api/crop-cycles/:id/tasks/:taskId/toggle
 * Toggles a stage task completion for this farmer's crop cycle.
 */
const toggleCycleTask = async (req, res) => {
  try {
    const userId = req.userId;
    const { id, taskId } = req.params;

    let cycle = null;
    let isMongo = false;

    if (isDbOperational()) {
      try {
        cycle = await CropCycle.findById(id);
        if (cycle) isMongo = true;
      } catch (_) {}
    }

    if (!cycle) {
      cycle = memFindCycleById(id);
    }

    if (!cycle) {
      return res.status(404).json({ success: false, error: 'Crop cycle not found' });
    }

    // Ownership enforcement
    if (String(cycle.userId) !== String(userId)) {
      return res.status(403).json({ success: false, error: 'Access denied. You do not own this crop cycle.' });
    }

    const tasks = Array.isArray(cycle.tasks) ? (isMongo ? cycle.tasks : [...cycle.tasks]) : [];
    let task = tasks.find(t => t.taskId === taskId);

    if (!task) {
      // If task isn't in task list, add it
      task = {
        taskId,
        taskName: req.body?.taskName || `Task ${taskId}`,
        taskType: req.body?.taskType || 'general',
        stage: req.body?.stage || 'General',
        targetDay: req.body?.targetDay || 0,
        completed: true,
        completedAt: new Date()
      };
      tasks.push(task);
    } else {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date() : null;
    }

    cycle.tasks = tasks;
    cycle.updatedAt = new Date();

    if (isMongo) {
      await cycle.save();
      memSaveCycle(cycle.toObject());
      return res.json({
        success: true,
        message: task.completed ? 'Task marked as completed! 🌱' : 'Task marked as pending.',
        task,
        cropCycle: enrichCycleWithLiveProgress(cycle)
      });
    }

    const savedMem = memSaveCycle(cycle);
    return res.json({
      success: true,
      message: task.completed ? 'Task marked as completed! 🌱' : 'Task marked as pending.',
      task,
      cropCycle: enrichCycleWithLiveProgress(savedMem)
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to toggle task' });
  }
};

/**
 * DELETE /api/crop-cycles/:id
 * Deletes or archives a crop cycle, enforcing ownership.
 */
const deleteCropCycle = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    let cycle = null;
    let isMongo = false;

    if (isDbOperational()) {
      try {
        cycle = await CropCycle.findById(id);
        if (cycle) isMongo = true;
      } catch (_) {}
    }

    if (!cycle) {
      cycle = memFindCycleById(id);
    }

    if (!cycle) {
      return res.status(404).json({ success: false, error: 'Crop cycle not found' });
    }

    if (String(cycle.userId) !== String(userId)) {
      return res.status(403).json({ success: false, error: 'Access denied. You do not own this crop cycle.' });
    }

    if (isMongo) {
      await CropCycle.findByIdAndDelete(id);
    }
    memDeleteCycleById(id);

    return res.json({
      success: true,
      message: 'Crop cycle deleted successfully.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete crop cycle' });
  }
};

module.exports = {
  createCropCycle,
  getCropCycles,
  getActiveCropCycle,
  getCropCycleById,
  updateCropCycle,
  toggleCycleTask,
  deleteCropCycle,
  enrichCycleWithLiveProgress,
  memSaveCycle
};
