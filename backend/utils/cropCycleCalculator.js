'use strict';
/**
 * ============================================================================
 * CROP CYCLE CALCULATOR — TIMEZONE-SAFE CROP DAY & STAGE AGGREGATOR
 * ============================================================================
 * 
 * Rules:
 *  1. Day 0 is strictly the planting / sowing date.
 *  2. Timezone-Safe: Compares calendar dates at UTC midnight to avoid DST or
 *     time-of-day offsets shifting day count.
 *  3. Future planting dates: Clearly marked as planned (isStarted: false, cropDay: 0).
 *  4. Past planting dates: Calculate current crop day as (currentDate - plantingDate).
 *  5. Does not reset crop cycle on login or refresh.
 * ============================================================================
 */
const path = require('path');
const fs = require('fs');

/**
 * Normalizes any date into a UTC midnight timestamp integer.
 * Ensures that 23:59 and 00:01 on the same date resolve to the same calendar day.
 */
function toUtcMidnight(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Calculates current crop day and status in a timezone-safe manner.
 * 
 * @param {Date|string} plantingDate - The actual or planned planting date.
 * @param {Date|string} [refDate] - Reference date (defaults to now).
 * @param {boolean} [forcedPlanned] - Whether farmer explicitly selected planned status.
 * @returns {object} Crop day details
 */
function calculateCropDay(plantingDate, refDate = new Date(), forcedPlanned = false) {
  const pUtc = toUtcMidnight(plantingDate);
  const rUtc = toUtcMidnight(refDate);

  if (pUtc === null || rUtc === null) {
    return {
      cropDay: 0,
      daysSincePlanting: 0,
      daysUntilPlanting: 0,
      status: 'planned',
      isStarted: false,
      message: 'Planting date is pending. Starts at Day 0 upon sowing.'
    };
  }

  // Exact whole day difference between calendar days
  const diffDays = Math.round((rUtc - pUtc) / (1000 * 60 * 60 * 24));

  if (diffDays < 0 || forcedPlanned) {
    // Planting date is in the future
    const daysUntil = Math.max(0, -diffDays);
    return {
      cropDay: 0,
      daysSincePlanting: 0,
      daysUntilPlanting: daysUntil,
      status: 'planned',
      isStarted: false,
      message: daysUntil === 0
        ? 'Planned planting date is today. Day 0 begins upon sowing.'
        : `Crop cycle not started in real life. Planned planting in ${daysUntil} day(s) (Day 0 begins on planting date).`
    };
  }

  if (diffDays === 0) {
    // Exactly planting day!
    return {
      cropDay: 0,
      daysSincePlanting: 0,
      daysUntilPlanting: 0,
      status: 'active',
      isStarted: true,
      message: 'Day 0: Sowing / Planting Day! Execute basal nutrition and seedbed preparation.'
    };
  }

  // Planting was in the past (diffDays >= 1)
  return {
    cropDay: diffDays,
    daysSincePlanting: diffDays,
    daysUntilPlanting: 0,
    status: 'active',
    isStarted: true,
    message: `Active crop cycle: Day ${diffDays} since planting.`
  };
}

/**
 * Resolves current agronomic growth stage based on current crop day and crop duration.
 */
function getStageForCropDay(cropDay, durationDays = 120) {
  const safeDay = Math.max(0, Number(cropDay) || 0);
  const safeDuration = Math.max(30, Number(durationDays) || 120);
  const progressRatio = safeDay / safeDuration;

  if (safeDay === 0) {
    return {
      key: 'sowing',
      name: 'Day 0: Sowing / Planting & Germination',
      shortName: 'Sowing (Day 0)',
      phase: 'Establishment'
    };
  }

  if (progressRatio <= 0.15) {
    return {
      key: 'emergence',
      name: 'Seedling Emergence & Early Stand (0–15% cycle)',
      shortName: 'Emergence',
      phase: 'Vegetative'
    };
  }

  if (progressRatio <= 0.35) {
    return {
      key: 'vegetative',
      name: 'Active Vegetative Growth & Root Development (16–35% cycle)',
      shortName: 'Vegetative Growth',
      phase: 'Vegetative'
    };
  }

  if (progressRatio <= 0.55) {
    return {
      key: 'branching',
      name: 'Branching, Tillering & Flower Bud Initiation (36–55% cycle)',
      shortName: 'Branching & Tillering',
      phase: 'Reproductive'
    };
  }

  if (progressRatio <= 0.80) {
    return {
      key: 'flowering',
      name: 'Peak Flowering & Grain/Pod/Boll Formation (56–80% cycle)',
      shortName: 'Flowering & Fruit Dev',
      phase: 'Reproductive'
    };
  }

  if (progressRatio < 1.0) {
    return {
      key: 'maturation',
      name: 'Grain Filling & Physiological Maturation (81–99% cycle)',
      shortName: 'Maturation',
      phase: 'Ripening'
    };
  }

  return {
    key: 'harvest',
    name: 'Maturity Reached — Harvest & Safe Storage (100%+ cycle)',
    shortName: 'Harvest Window',
    phase: 'Harvest'
  };
}

/**
 * Standard agronomic task templates for popular crops, aligned with ICAR package of practices.
 */
const BASE_CROP_TASK_TEMPLATES = {
  cotton: [
    { targetDay: 0, taskType: 'sowing', stage: 'Sowing & Emergence', taskName: 'Day 0: Soil preparation, basal NPK 25% + FYM, and ridge sowing with seed treatment.' },
    { targetDay: 2, taskType: 'pest', stage: 'Sowing & Emergence', taskName: 'Pre-emergence weed control with Pendimethalin within 48 hours of sowing.' },
    { targetDay: 8, taskType: 'sowing', stage: 'Sowing & Emergence', taskName: 'Germination inspection and gap filling (dibbling) with pre-soaked seed.' },
    { targetDay: 18, taskType: 'general', stage: 'Vegetative Growth', taskName: 'Thinning to retain single vigorous seedling per hill; first inter-cultivation hoeing.' },
    { targetDay: 25, taskType: 'fertilizer', stage: 'Vegetative Growth', taskName: 'First nitrogen top-dressing (Urea 35 kg/acre) followed by light irrigation.' },
    { targetDay: 35, taskType: 'pest', stage: 'Vegetative Growth', taskName: 'Install 5 yellow sticky traps per acre for sucking pest monitoring (whitefly/aphids).' },
    { targetDay: 45, taskType: 'fertilizer', stage: 'Branching & Squaring', taskName: 'Terminal nipping if over 1m; spray 1% micronutrient formulation for square retention.' },
    { targetDay: 50, taskType: 'pest', stage: 'Branching & Squaring', taskName: 'Install 5 Gossyplure pheromone traps per acre for Pink Bollworm surveillance.' },
    { targetDay: 65, taskType: 'irrigation', stage: 'Flowering & Boll Dev', taskName: 'Critical flowering irrigation; spray 2% DAP or 13-0-45 to prevent boll shedding.' },
    { targetDay: 80, taskType: 'fertilizer', stage: 'Flowering & Boll Dev', taskName: 'Apply remaining 50% Potash (MOP 25 kg/acre) + light nitrogen top dress.' },
    { targetDay: 110, taskType: 'irrigation', stage: 'Boll Maturation', taskName: 'Withhold irrigation 10–12 days prior to first picking to allow uniform boll burst.' },
    { targetDay: 135, taskType: 'harvest', stage: 'Harvest', taskName: 'First picking of clean, dry seed-cotton in dry morning hours; store in ventilated shed.' }
  ],
  wheat: [
    { targetDay: 0, taskType: 'sowing', stage: 'Sowing & Emergence', taskName: 'Day 0: Sowing in moist soil with seed drill (4-5 cm depth); full P & K + 50% N basal.' },
    { targetDay: 21, taskType: 'irrigation', stage: 'Vegetative Growth', taskName: 'First and most critical irrigation at Crown Root Initiation (CRI) stage (21 DAS).' },
    { targetDay: 25, taskType: 'fertilizer', stage: 'Vegetative Growth', taskName: 'First top-dressing of Urea (25% N) right after CRI irrigation.' },
    { targetDay: 35, taskType: 'general', stage: 'Tillering', taskName: 'Post-emergence broadleaf & grassy weed management with recommended herbicide.' },
    { targetDay: 45, taskType: 'irrigation', stage: 'Tillering', taskName: 'Second irrigation at active tillering stage; second split of Urea top-dressing.' },
    { targetDay: 65, taskType: 'irrigation', stage: 'Jointing', taskName: 'Third irrigation at late jointing stage; scout for yellow rust pustules on leaves.' },
    { targetDay: 85, taskType: 'irrigation', stage: 'Flowering', taskName: 'Fourth critical irrigation at flowering stage; prevent water stress during anthesis.' },
    { targetDay: 105, taskType: 'irrigation', stage: 'Milking & Dough', taskName: 'Fifth irrigation at milking stage; stop irrigation when grain reaches soft dough.' },
    { targetDay: 125, taskType: 'harvest', stage: 'Harvest', taskName: 'Harvest when straw turns golden yellow and moisture drops below 14%.' }
  ],
  paddy: [
    { targetDay: 0, taskType: 'sowing', stage: 'Nursery & Sowing', taskName: 'Day 0: Wet bed nursery sowing with pre-germinated seed treated with Trichoderma.' },
    { targetDay: 10, taskType: 'irrigation', stage: 'Nursery', taskName: 'Maintain shallow water layer (1-2 cm) in nursery bed; scout for thrips.' },
    { targetDay: 25, taskType: 'sowing', stage: 'Transplanting', taskName: 'Transplant 25-day seedlings @ 2-3 per hill at 20x15 cm spacing; apply basal NPK.' },
    { targetDay: 45, taskType: 'fertilizer', stage: 'Active Tillering', taskName: 'First top dressing: Nitrogen @ 30 kg/ha; weed with cono-weeder to aerate roots.' },
    { targetDay: 65, taskType: 'fertilizer', stage: 'Panicle Initiation', taskName: 'Second top dressing: Nitrogen + Potash; maintain 5 cm standing water.' },
    { targetDay: 85, taskType: 'pest', stage: 'Flowering & Booting', taskName: 'Scout for stem borer and blast; apply protective biopesticide if needed.' },
    { targetDay: 110, taskType: 'irrigation', stage: 'Grain Filling', taskName: 'Alternate wetting & drying (AWD); drain water completely 10 days before harvest.' },
    { targetDay: 125, taskType: 'harvest', stage: 'Harvest', taskName: 'Harvest when 85% grains turn golden; dry to 12-14% moisture for storage.' }
  ],
  maize: [
    { targetDay: 0, taskType: 'sowing', stage: 'Sowing & Emergence', taskName: 'Day 0: Dibble seeds at 60x20 cm on ridges; apply 25% N + 100% P + 50% K basal.' },
    { targetDay: 2, taskType: 'pest', stage: 'Sowing & Emergence', taskName: 'Pre-emergence Atrazine spray within 48 hours to control early seasonal weeds.' },
    { targetDay: 15, taskType: 'general', stage: 'Seedling', taskName: 'Thinning to single seedling per hill; scout leaf whorls for Fall Armyworm.' },
    { targetDay: 30, taskType: 'fertilizer', stage: 'Knee-High Stage', taskName: 'First top dressing of Urea (50% N) at knee-high stage followed by earthing up.' },
    { targetDay: 55, taskType: 'irrigation', stage: 'Tasseling & Silking', taskName: 'Critical irrigation at tasseling; remaining 25% N top dressing.' },
    { targetDay: 75, taskType: 'irrigation', stage: 'Grain Filling', taskName: 'Maintain soil moisture during milk to dough stage; inspect cobs.' },
    { targetDay: 100, taskType: 'harvest', stage: 'Harvest', taskName: 'Harvest when husk leaves dry completely and black layer forms at grain base.' }
  ]
};

/**
 * Generates an initial list of stage-specific agronomic tasks for a new crop cycle.
 */
function generateInitialTasksForCrop(cropKey, cropName = '', durationDays = 120) {
  const normKey = String(cropKey || '').toLowerCase().trim();
  const matchedKey = Object.keys(BASE_CROP_TASK_TEMPLATES).find(k => normKey.includes(k) || k.includes(normKey)) || 'cotton';
  const baseList = BASE_CROP_TASK_TEMPLATES[matchedKey] || BASE_CROP_TASK_TEMPLATES.cotton;

  return baseList.map((item, index) => {
    // Scale targetDay if duration is significantly different from 120 days
    const scaledDay = Math.round((item.targetDay / 120) * durationDays);
    const taskId = `task_${normKey}_${index}_${scaledDay}`;

    return {
      taskId,
      taskName: item.taskName.replace(/^Day \d+:/, `Day ${scaledDay}:`),
      taskType: item.taskType || 'general',
      stage: item.stage || 'Agronomic Stage',
      targetDay: scaledDay,
      completed: false,
      completedAt: null,
      notes: ''
    };
  });
}

module.exports = {
  calculateCropDay,
  getStageForCropDay,
  generateInitialTasksForCrop,
  toUtcMidnight
};
