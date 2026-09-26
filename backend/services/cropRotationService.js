'use strict';
/**
 * Multi-Season Crop Rotation & Soil Nitrogen Health Simulator
 * Simulates soil nutrient depletion/fixation, disease break effectiveness,
 * and multi-year financial ROI across Kharif, Rabi, and Zaid seasons.
 */

// Crop agronomic characteristics: Nitrogen impact (kg/ha), Soil Carbon, Pest Break efficacy, Net Return (₹/ha)
const ROTATION_CROP_METRICS = {
  // Cereals (High N consumers)
  "Paddy / Rice": { type: "cereal", nitrogenDeltaKg: -95, phosphorusDeltaKg: -35, potassiumDeltaKg: -90, diseaseBreakBonus: -10, avgCostPerHa: 38000, avgYieldQuintalPerHa: 45, avgPricePerQtl: 2183 },
  "Wheat": { type: "cereal", nitrogenDeltaKg: -85, phosphorusDeltaKg: -30, potassiumDeltaKg: -75, diseaseBreakBonus: 5, avgCostPerHa: 32000, avgYieldQuintalPerHa: 42, avgPricePerQtl: 2350 },
  "Maize": { type: "cereal", nitrogenDeltaKg: -105, phosphorusDeltaKg: -40, potassiumDeltaKg: -100, diseaseBreakBonus: 10, avgCostPerHa: 28000, avgYieldQuintalPerHa: 50, avgPricePerQtl: 2090 },

  // Legumes & Pulses (Biological Nitrogen Fixers)
  "Chickpea / Bengal Gram": { type: "legume", nitrogenDeltaKg: +48, phosphorusDeltaKg: -20, potassiumDeltaKg: -35, diseaseBreakBonus: 30, avgCostPerHa: 22000, avgYieldQuintalPerHa: 18, avgPricePerQtl: 5440 },
  "Pigeon Pea / Tur": { type: "legume", nitrogenDeltaKg: +55, phosphorusDeltaKg: -22, potassiumDeltaKg: -40, diseaseBreakBonus: 35, avgCostPerHa: 24000, avgYieldQuintalPerHa: 16, avgPricePerQtl: 7000 },
  "Green Gram / Moong": { type: "legume", nitrogenDeltaKg: +38, phosphorusDeltaKg: -15, potassiumDeltaKg: -25, diseaseBreakBonus: 25, avgCostPerHa: 16000, avgYieldQuintalPerHa: 12, avgPricePerQtl: 8558 },
  "Soybean": { type: "legume", nitrogenDeltaKg: +42, phosphorusDeltaKg: -25, potassiumDeltaKg: -45, diseaseBreakBonus: 20, avgCostPerHa: 26000, avgYieldQuintalPerHa: 22, avgPricePerQtl: 4600 },

  // Cash & Oilseeds
  "Cotton": { type: "cash", nitrogenDeltaKg: -70, phosphorusDeltaKg: -28, potassiumDeltaKg: -80, diseaseBreakBonus: 0, avgCostPerHa: 45000, avgYieldQuintalPerHa: 20, avgPricePerQtl: 7200 },
  "Mustard": { type: "oilseed", nitrogenDeltaKg: -60, phosphorusDeltaKg: -25, potassiumDeltaKg: -50, diseaseBreakBonus: 25, avgCostPerHa: 20000, avgYieldQuintalPerHa: 19, avgPricePerQtl: 5650 },
  "Groundnut": { type: "legume", nitrogenDeltaKg: +40, phosphorusDeltaKg: -20, potassiumDeltaKg: -40, diseaseBreakBonus: 20, avgCostPerHa: 30000, avgYieldQuintalPerHa: 24, avgPricePerQtl: 6377 },

  // Green Manure / Cover Crops
  "Dhaincha (Green Manure)": { type: "cover", nitrogenDeltaKg: +75, phosphorusDeltaKg: +5, potassiumDeltaKg: +20, diseaseBreakBonus: 40, avgCostPerHa: 8000, avgYieldQuintalPerHa: 0, avgPricePerQtl: 0 },
};

// Agronomy Recommended Rotation Templates
const RECOMMENDED_TEMPLATES = [
  {
    id: "sustainable_cereal_pulse",
    name: "ICAR Pulse-Cereal Nitrogen Restorative Rotation (Highest Soil Health)",
    targetSoil: "Black & Loamy Soils",
    seasons: [
      { season: "Kharif (Year 1)", crop: "Paddy / Rice" },
      { season: "Rabi (Year 1)", crop: "Chickpea / Bengal Gram" },
      { season: "Zaid (Year 1)", crop: "Green Gram / Moong" },
      { season: "Kharif (Year 2)", crop: "Cotton" },
      { season: "Rabi (Year 2)", crop: "Wheat" },
      { season: "Zaid (Year 2)", crop: "Dhaincha (Green Manure)" },
    ],
  },
  {
    id: "high_cash_oilseed",
    name: "High Value Oilseed & Cotton Cycle",
    targetSoil: "Red & Alluvial Soils",
    seasons: [
      { season: "Kharif (Year 1)", crop: "Cotton" },
      { season: "Rabi (Year 1)", crop: "Mustard" },
      { season: "Zaid (Year 1)", crop: "Green Gram / Moong" },
      { season: "Kharif (Year 2)", crop: "Soybean" },
      { season: "Rabi (Year 2)", crop: "Wheat" },
      { season: "Zaid (Year 2)", crop: "Groundnut" },
    ],
  },
];

/**
 * Simulate Multi-Season Rotation Sequence
 */
function simulateCropRotation(seasonsList = [], landHectares = 1.0) {
  if (!Array.isArray(seasonsList) || seasonsList.length === 0) {
    seasonsList = RECOMMENDED_TEMPLATES[0].seasons;
  }

  let baselineNitrogen = 240; // Medium available N (kg/ha)
  let baselinePhosphorus = 45;
  let baselinePotassium = 180;
  let cumulativeGrossRevenue = 0;
  let cumulativeCultivationCost = 0;
  let cumulativeNetProfit = 0;
  let consecutiveMonocultureStreak = 0;
  let lastCropType = null;

  const timeline = [];

  seasonsList.forEach((step, idx) => {
    const crop = ROTATION_CROP_METRICS[step.crop] || ROTATION_CROP_METRICS["Wheat"];
    const isMonoculture = lastCropType && lastCropType === crop.type && crop.type !== "cover";

    if (isMonoculture) {
      consecutiveMonocultureStreak++;
    } else {
      consecutiveMonocultureStreak = 0;
    }
    lastCropType = crop.type;

    // Nutrient dynamics
    const nDelta = crop.nitrogenDeltaKg;
    const pDelta = crop.phosphorusDeltaKg;
    const kDelta = crop.potassiumDeltaKg;

    baselineNitrogen = Math.max(baselineNitrogen + nDelta, 50);
    baselinePhosphorus = Math.max(baselinePhosphorus + pDelta, 10);
    baselinePotassium = Math.max(baselinePotassium + kDelta, 40);

    // Disease risk reduction score (0 - 100%)
    let diseaseSuppressionScore = 65 + crop.diseaseBreakBonus - consecutiveMonocultureStreak * 15;
    diseaseSuppressionScore = Math.min(Math.max(diseaseSuppressionScore, 20), 98);

    // Financials
    const stepGross = crop.avgYieldQuintalPerHa * crop.avgPricePerQtl * landHectares;
    const stepCost = crop.avgCostPerHa * landHectares;
    const stepNet = stepGross - stepCost;

    cumulativeGrossRevenue += stepGross;
    cumulativeCultivationCost += stepCost;
    cumulativeNetProfit += stepNet;

    timeline.push({
      stepNumber: idx + 1,
      season: step.season,
      crop: step.crop,
      cropType: crop.type,
      nitrogenChangeKg: nDelta,
      currentSoilNitrogenKgHa: Math.round(baselineNitrogen),
      currentSoilPhosphorusKgHa: Math.round(baselinePhosphorus),
      currentSoilPotassiumKgHa: Math.round(baselinePotassium),
      diseaseSuppressionScore,
      grossRevenueRs: Math.round(stepGross),
      costRs: Math.round(stepCost),
      netProfitRs: Math.round(stepNet),
      isNFixing: nDelta > 0,
    });
  });

  const netNitrogenDelta = timeline.reduce((acc, t) => acc + t.nitrogenChangeKg, 0);
  const soilHealthRating = netNitrogenDelta >= -30 ? "Excellent (Soil Restorative 🌿)" : netNitrogenDelta >= -100 ? "Balanced 🌾" : "Depleting (Requires Legume/Organic Intervention ⚠️)";

  return {
    landHectares,
    totalSeasons: timeline.length,
    cumulativeGrossRevenue: Math.round(cumulativeGrossRevenue),
    cumulativeCultivationCost: Math.round(cumulativeCultivationCost),
    cumulativeNetProfit: Math.round(cumulativeNetProfit),
    netNitrogenBalanceKgHa: netNitrogenDelta,
    soilHealthRating,
    recommendedChemicalFertilizerReductionPercent: netNitrogenDelta >= 0 ? 30 : netNitrogenDelta >= -50 ? 15 : 0,
    timeline,
  };
}

module.exports = {
  simulateCropRotation,
  ROTATION_CROP_METRICS,
  RECOMMENDED_TEMPLATES,
};
