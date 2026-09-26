'use strict';
/**
 * Crop Yield & Harvest Revenue Predictor with PMFBY Climate Risk Simulator
 * Predicts expected yield using FAO crop response functions, weather anomaly
 * adjustments, and simulates PMFBY insurance premium / payout scenarios.
 */

// Crop yield baseline data (quintals/hectare) and response coefficients
const CROP_YIELD_DATABASE = {
  'Paddy / Rice':  { baseYield: 45, maxYield: 62, waterSensitivity: 0.85, heatSensitivity: 0.72, coldSensitivity: 0.30, mspPerQtl: 2183, pmfbyPremiumPct: 2.0 },
  Wheat:           { baseYield: 42, maxYield: 55, waterSensitivity: 0.65, heatSensitivity: 0.80, coldSensitivity: 0.15, mspPerQtl: 2350, pmfbyPremiumPct: 1.5 },
  Cotton:          { baseYield: 20, maxYield: 28, waterSensitivity: 0.55, heatSensitivity: 0.40, coldSensitivity: 0.60, mspPerQtl: 7121, pmfbyPremiumPct: 5.0 },
  Maize:           { baseYield: 50, maxYield: 70, waterSensitivity: 0.70, heatSensitivity: 0.65, coldSensitivity: 0.25, mspPerQtl: 2090, pmfbyPremiumPct: 2.0 },
  Soybean:         { baseYield: 22, maxYield: 32, waterSensitivity: 0.60, heatSensitivity: 0.55, coldSensitivity: 0.40, mspPerQtl: 4600, pmfbyPremiumPct: 2.0 },
  'Chili / Red Pepper': { baseYield: 18, maxYield: 28, waterSensitivity: 0.50, heatSensitivity: 0.35, coldSensitivity: 0.70, mspPerQtl: 16500, pmfbyPremiumPct: 5.0 },
  Tomato:          { baseYield: 250, maxYield: 400, waterSensitivity: 0.75, heatSensitivity: 0.60, coldSensitivity: 0.65, mspPerQtl: 2200, pmfbyPremiumPct: 5.0 },
  Groundnut:       { baseYield: 24, maxYield: 34, waterSensitivity: 0.55, heatSensitivity: 0.50, coldSensitivity: 0.35, mspPerQtl: 6377, pmfbyPremiumPct: 5.0 },
  Mustard:         { baseYield: 19, maxYield: 28, waterSensitivity: 0.50, heatSensitivity: 0.70, coldSensitivity: 0.20, mspPerQtl: 5650, pmfbyPremiumPct: 1.5 },
  Onion:           { baseYield: 200, maxYield: 350, waterSensitivity: 0.65, heatSensitivity: 0.55, coldSensitivity: 0.45, mspPerQtl: 2400, pmfbyPremiumPct: 5.0 },
};

// Climate risk categories and their yield impact multipliers
const CLIMATE_RISK_FACTORS = {
  'No Anomaly (Normal Season)': { yieldFactor: 1.00, riskLevel: 'low' },
  'Mild Drought (20-30% Rainfall Deficit)': { yieldFactor: 0.82, riskLevel: 'medium' },
  'Severe Drought (>40% Rainfall Deficit)': { yieldFactor: 0.58, riskLevel: 'high' },
  'Excess Rainfall / Flood Risk': { yieldFactor: 0.75, riskLevel: 'high' },
  'Heat Wave (>40°C for 5+ Days)': { yieldFactor: 0.70, riskLevel: 'high' },
  'Unseasonal Frost / Cold Spell': { yieldFactor: 0.65, riskLevel: 'high' },
  'High Humidity / Disease Pressure': { yieldFactor: 0.85, riskLevel: 'medium' },
};

function predictCropYield({ crop, landHectares, irrigationType, soilQuality, climateScenario, cultivarType }) {
  const cropData = CROP_YIELD_DATABASE[crop] || CROP_YIELD_DATABASE.Wheat;
  const climateRisk = CLIMATE_RISK_FACTORS[climateScenario] || CLIMATE_RISK_FACTORS['No Anomaly (Normal Season)'];

  // Soil quality multiplier
  const soilMultiplier = soilQuality === 'excellent' ? 1.12 : soilQuality === 'good' ? 1.00 : soilQuality === 'fair' ? 0.85 : 0.68;

  // Irrigation premium
  const irrigationMultiplier = irrigationType === 'drip' ? 1.15 : irrigationType === 'sprinkler' ? 1.08 : irrigationType === 'canal' ? 1.05 : 0.82;

  // Cultivar premium (hybrid vs local variety)
  const cultivarMultiplier = cultivarType === 'hybrid' ? 1.18 : cultivarType === 'improved' ? 1.08 : 1.00;

  // Calculate expected yield
  const baseYieldPerHa = cropData.baseYield;
  const adjustedYieldPerHa = baseYieldPerHa * soilMultiplier * irrigationMultiplier * cultivarMultiplier * climateRisk.yieldFactor;
  const totalYieldQuintals = adjustedYieldPerHa * landHectares;
  const grossRevenueRs = totalYieldQuintals * cropData.mspPerQtl;

  // PMFBY Insurance Calculation
  const sumInsuredPerHa = cropData.baseYield * cropData.mspPerQtl; // Value of expected harvest
  const totalSumInsured = sumInsuredPerHa * landHectares;
  const farmerPremiumRs = Math.round((totalSumInsured * cropData.pmfbyPremiumPct) / 100);
  const actualYieldFraction = adjustedYieldPerHa / cropData.baseYield;
  const shortfallFraction = Math.max(0, 1 - actualYieldFraction);
  const pmfbyPayoutRs = shortfallFraction > 0.1 ? Math.round(totalSumInsured * shortfallFraction) : 0;
  const netRevenueAfterInsurance = grossRevenueRs - farmerPremiumRs + pmfbyPayoutRs;

  // 3-scenario forecast
  const scenarios = [
    { label: 'Pessimistic (Adverse Weather)', yieldQtl: Math.round(totalYieldQuintals * 0.72), revenue: Math.round(grossRevenueRs * 0.72) },
    { label: 'Expected (Current Forecast)', yieldQtl: Math.round(totalYieldQuintals), revenue: Math.round(grossRevenueRs) },
    { label: 'Optimistic (Ideal Conditions)', yieldQtl: Math.round(cropData.maxYield * landHectares * cultivarMultiplier), revenue: Math.round(cropData.maxYield * landHectares * cultivarMultiplier * cropData.mspPerQtl) },
  ];

  return {
    crop,
    landHectares,
    climateScenario,
    riskLevel: climateRisk.riskLevel,
    yieldPrediction: {
      adjustedYieldPerHa: Number(adjustedYieldPerHa.toFixed(1)),
      totalYieldQuintals: Math.round(totalYieldQuintals),
      maxPossibleQtl: Math.round(cropData.maxYield * landHectares),
      yieldEfficiencyPercent: Math.round(actualYieldFraction * 100),
    },
    financials: {
      mspRatePerQtl: cropData.mspPerQtl,
      grossRevenueRs: Math.round(grossRevenueRs),
      pmfbyPremiumRs: farmerPremiumRs,
      pmfbyPayoutRs,
      netRevenueAfterInsuranceRs: Math.round(netRevenueAfterInsurance),
    },
    pmfbyInsurance: {
      totalSumInsuredRs: Math.round(totalSumInsured),
      farmerPremiumPercent: cropData.pmfbyPremiumPct,
      farmerPremiumRs,
      centralSubsidyEstimateRs: Math.round(totalSumInsured * 0.08),
      expectedPayoutRs: pmfbyPayoutRs,
      recommendation: pmfbyPayoutRs > farmerPremiumRs * 2
        ? 'STRONGLY RECOMMENDED — Insurance payout likely exceeds premium cost'
        : 'Enroll for crop loss safety net',
    },
    scenarios,
  };
}

module.exports = {
  predictCropYield,
  CROP_YIELD_DATABASE,
  CLIMATE_RISK_FACTORS,
};
