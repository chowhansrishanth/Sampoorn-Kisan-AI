'use strict';
/**
 * ============================================================================
 * CROP CYCLE MODEL — INDEPENDENT FARMER CROP LIFE CYCLE
 * ============================================================================
 * Stores independent crop-cycle records for authenticated farmers.
 * Every crop cycle tracks:
 *  - Authenticated farmer unique ID (userId)
 *  - Crop name and key (e.g. "Cotton", "Wheat", "Paddy")
 *  - Planting / Sowing date (ISO Date)
 *  - Status: 'planned' (future planting date) | 'active' (planted, Day 0+) | 'completed'
 *  - Whether planting is planned or actual (isPlanned)
 *  - Cycle start date
 *  - Field acres, variety, soil, season, and irrigation
 *  - Stage-specific ICAR agronomic tasks and completion states per farmer
 * ============================================================================
 */
const mongoose = require('mongoose');

const taskProgressSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  taskName: { type: String, required: true },
  taskType: { 
    type: String, 
    enum: ['sowing', 'irrigation', 'fertilizer', 'pest', 'harvest', 'general'],
    default: 'general' 
  },
  stage: { type: String, default: 'General' },
  targetDay: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  notes: { type: String, default: '' }
}, { _id: false });

const cropCycleSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: [true, 'Farmer ID is required'], 
    index: true 
  },
  cropName: { 
    type: String, 
    required: [true, 'Crop name is required'],
    trim: true 
  },
  cropKey: { 
    type: String, 
    required: [true, 'Crop key is required'],
    trim: true,
    lowercase: true 
  },
  variety: { 
    type: String, 
    default: '', 
    trim: true 
  },
  landAcres: { 
    type: Number, 
    default: 2.0, 
    min: [0.01, 'Land acres must be positive'] 
  },
  plantingDate: { 
    type: Date, 
    required: [true, 'Planting date is required'] 
  },
  isPlanned: { 
    type: Boolean, 
    default: false 
  },
  status: { 
    type: String, 
    enum: ['planned', 'active', 'completed'], 
    default: 'active' 
  },
  cycleStartDate: { 
    type: Date, 
    default: Date.now 
  },
  durationDays: { 
    type: Number, 
    default: 120,
    min: 30,
    max: 365 
  },
  soilType: { 
    type: String, 
    default: 'black' 
  },
  season: { 
    type: String, 
    default: 'kharif' 
  },
  irrigationType: { 
    type: String, 
    default: 'drip' 
  },
  stage: { 
    type: String, 
    default: 'Sowing & Emergence' 
  },
  tasks: [taskProgressSchema],
  notes: { 
    type: String, 
    default: '' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index to quickly fetch a farmer's crop cycles ordered by date
cropCycleSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CropCycle', cropCycleSchema);
