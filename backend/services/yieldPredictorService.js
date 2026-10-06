/**
 * ============================================================================
 * CROP YIELD & HARVEST REVENUE PREDICTOR WITH PMFBY CLIMATE RISK SIMULATOR
 * ============================================================================
 * This service calculates anticipated harvest yield, revenue projections, and
 * actuarial insurance payouts under the Pradhan Mantri Fasal Bima Yojana (PMFBY).
 *
 * ----------------------------------------------------------------------------
 * MATHEMATICAL FORMULATION & AGRONOMIC EQUATIONS:
 * ----------------------------------------------------------------------------
 *
 * 1. MULTI-FACTOR ADJUSTED YIELD PER HECTARE:
 *    The final predicted yield per hectare ($Y_{\text{adj}}$) modifies the baseline
 *    crop yield ($Y_{\text{base}}$) through soil, irrigation, cultivar, and
 *    climate stress factors:
 *
 *      Y_adj = Y_base * M_soil * M_irrig * M_cultivar * gamma_climate
 *
 *    Where:
 *      - Y_base: Standard agro-climatic zone potential yield (quintals/ha)
 *      - M_soil: Soil quality multiplier
 *          * 'excellent' -> 1.12 (+12%)
 *          * 'good'      -> 1.00 (baseline)
 *          * 'fair'      -> 0.85 (-15%)
 *          * 'poor'      -> 0.68 (-32%)
 *      - M_irrig: Water application efficiency multiplier
 *          * 'drip'      -> 1.15 (precision localized root delivery)
 *          * 'sprinkler' -> 1.08 (uniform coverage)
 *          * 'canal'     -> 1.05 (flood surface canal)
 *          * 'rainfed'   -> 0.82 (drought/monsoon-dependent)
 *      - M_cultivar: Seed genetic potential multiplier
 *          * 'hybrid'    -> 1.18 (heterosis hybrid vigor)
 *          * 'improved'  -> 1.08 (certified high-yielding variety)
 *          * 'local'     -> 1.00 (traditional landrace)
 *      - gamma_climate: Climate stress penalty factor (from CLIMATE_RISK_FACTORS)
 *          * Normal: 1.00 | Mild Drought: 0.82 | Severe Drought: 0.58
 *          * Heat Wave: 0.70 | Flood: 0.75 | Frost: 0.65
 *
 * 2. TOTAL FARM HARVEST & GROSS REVENUE:
 *      Y_total = Y_adj * Area_ha                          (in quintals)
 *      Rev_gross = Y_total * MSP_per_qtl                  (in INR)
 *
 * 3. PMFBY (PRADHAN MANTRI FASAL BIMA YOJANA) ACTUARIAL MODEL:
 *    Under Indian national agricultural insurance guidelines:
 *      - Sum Insured (SI):
 *          SI = Y_base * MSP_per_qtl * Area_ha
 *      - Farmer Premium Contribution (Capped by Govt at 1.5% - 5.0%):
 *          Premium_farmer = (SI * P_pct) / 100
 *          Where P_pct = 1.5% for Rabi, 2.0% for Kharif, 5.0% for Commercial/Horticulture.
 *      - Yield Shortfall Ratio (Threshold Yield - Actual Yield):
 *          Ratio_actual = Y_adj / Y_base
 *          Shortfall = max(0, 1 - Ratio_actual)
 *      - Insurance Indemnity Claim Payout:
 *          Payout_PMFBY = SI * Shortfall       (if Shortfall > 10% franchise threshold)
 *                       = 0                    (if Shortfall <= 10%)
 *      - Net Realized Revenue:
 *          Rev_net = Rev_gross - Premium_farmer + Payout_PMFBY
 * ============================================================================
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

/**
 * Predicts crop harvest yield, financial returns, and PMFBY insurance outcomes.
 *
 * @param {Object} params
 * @param {string} params.crop - Name of crop (e.g., 'Wheat', 'Paddy / Rice')
 * @param {number} params.landHectares - Cultivated area in hectares
 * @param {string} params.irrigationType - 'drip' | 'sprinkler' | 'canal' | 'rainfed'
 * @param {string} params.soilQuality - 'excellent' | 'good' | 'fair' | 'poor'
 * @param {string} params.climateScenario - Weather anomaly scenario key
 * @param {string} params.cultivarType - 'hybrid' | 'improved' | 'local'
 * @returns {Object} Harvest forecast, financial metrics, and PMFBY policy recommendations
 */
function predictCropYield({ crop, landHectares, irrigationType, soilQuality, climateScenario, cultivarType }) {
  const cropData = CROP_YIELD_DATABASE[crop] || CROP_YIELD_DATABASE.Wheat;
  const climateRisk = CLIMATE_RISK_FACTORS[climateScenario] || CLIMATE_RISK_FACTORS['No Anomaly (Normal Season)'];

  // Step 1: Soil quality multiplier (M_soil)
  // Higher organic carbon and favorable CEC boost nutrient uptake efficiency.
  const soilMultiplier = soilQuality === 'excellent' ? 1.12 : soilQuality === 'good' ? 1.00 : soilQuality === 'fair' ? 0.85 : 0.68;

  // Step 2: Irrigation efficiency multiplier (M_irrig)
  // Drip achieves 90%+ water application efficiency versus 50-60% under traditional flood.
  const irrigationMultiplier = irrigationType === 'drip' ? 1.15 : irrigationType === 'sprinkler' ? 1.08 : irrigationType === 'canal' ? 1.05 : 0.82;

  // Step 3: Cultivar hybrid vigor multiplier (M_cultivar)
  // Heterosis breeding provides higher photosynthetic canopy efficiency and lodging resistance.
  const cultivarMultiplier = cultivarType === 'hybrid' ? 1.18 : cultivarType === 'improved' ? 1.08 : 1.00;

  // Step 4: Calculate expected yield per hectare and total harvest
  // Formula: Y_adj = Y_base * M_soil * M_irrig * M_cultivar * gamma_climate
  const baseYieldPerHa = cropData.baseYield;
  const adjustedYieldPerHa = baseYieldPerHa * soilMultiplier * irrigationMultiplier * cultivarMultiplier * climateRisk.yieldFactor;
  const totalYieldQuintals = adjustedYieldPerHa * landHectares;
  const grossRevenueRs = totalYieldQuintals * cropData.mspPerQtl;

  // Step 5: PMFBY Insurance Actuarial Calculation
  // Sum Insured = baseline yield value for the full landholding
  const sumInsuredPerHa = cropData.baseYield * cropData.mspPerQtl;
  const totalSumInsured = sumInsuredPerHa * landHectares;
  // Farmer subsidized premium (capped at 1.5% - 5%)
  const farmerPremiumRs = Math.round((totalSumInsured * cropData.pmfbyPremiumPct) / 100);
  // Yield shortfall relative to baseline: Shortfall = max(0, 1 - Y_adj / Y_base)
  const actualYieldFraction = adjustedYieldPerHa / cropData.baseYield;
  const shortfallFraction = Math.max(0, 1 - actualYieldFraction);
  // Indemnity claim triggers if shortfall exceeds 10%
  const pmfbyPayoutRs = shortfallFraction > 0.1 ? Math.round(totalSumInsured * shortfallFraction) : 0;
  const netRevenueAfterInsurance = grossRevenueRs - farmerPremiumRs + pmfbyPayoutRs;

  // Step 6: 3-scenario stochastic forecast (Pessimistic, Expected, Optimistic)
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
