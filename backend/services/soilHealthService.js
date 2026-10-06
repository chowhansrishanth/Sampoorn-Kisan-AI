/**
 * ============================================================================
 * SOIL HEALTH CARD (SHC) ANALYSIS & TAILORED NPK + MICRONUTRIENT PRESCRIPTION
 * ============================================================================
 * Interprets laboratory Soil Health Card test values against ICAR/STCR
 * (Soil Test Crop Response) empirical calibration equations, diagnoses macro
 * and micro-nutrient deficiencies, and computes precise fertilizer dosage.
 *
 * ----------------------------------------------------------------------------
 * MATHEMATICAL FORMULATION & AGRONOMIC EQUATIONS:
 * ----------------------------------------------------------------------------
 *
 * 1. NUTRIENT STATUS CLASSIFICATION:
 *    Let $V_i$ be the tested soil concentration of nutrient $i$, with low threshold
 *    $\theta_{\text{low}}$ and medium threshold $\theta_{\text{med}}$:
 *
 *      Status(V_i) = 'deficient'   if V_i < theta_low
 *                  = 'medium'      if theta_low <= V_i < theta_med
 *                  = 'sufficient'  if V_i >= theta_med
 *
 * 2. STCR ADJUSTED NUTRIENT REQUIREMENTS (kg/ha):
 *    Based on ICAR soil test calibration coefficients:
 *
 *      N_req = 0.70 * N_crop   if Status(N) = 'sufficient'  (-30% reduction)
 *            = 0.85 * N_crop   if Status(N) = 'medium'      (-15% reduction)
 *            = 1.00 * N_crop   if Status(N) = 'deficient'   (100% full dose)
 *
 *      P_req = 0.50 * P_crop   if Status(P) = 'sufficient'  (-50% reduction)
 *            = 0.75 * P_crop   if Status(P) = 'medium'      (-25% reduction)
 *            = 1.00 * P_crop   if Status(P) = 'deficient'   (100% full dose)
 *
 *      K_req = 0.50 * K_crop   if Status(K) = 'sufficient'  (-50% reduction)
 *            = 0.75 * K_crop   if Status(K) = 'medium'      (-25% reduction)
 *            = 1.00 * K_crop   if Status(K) = 'deficient'   (100% full dose)
 *
 * 3. FERTILIZER COMMERCIAL CARRIER STOICHIOMETRY:
 *    Converts elemental/oxide nutrient demand into standard 50 kg commercial bags:
 *
 *      - Urea (46% elemental N):
 *          Urea_kg_ha = (N_req / 0.46)
 *      - DAP (Diammonium Phosphate: 18% N, 46% P2O5):
 *          DAP_kg_ha = (P_req / 0.46)
 *      - MOP (Muriate of Potash: 60% K2O):
 *          MOP_kg_ha = (K_req / 0.60)
 *
 * 4. OVERALL SOIL HEALTH INDEX (SHI):
 *    Normalized percentage of tested macro & micro nutrients in the 'sufficient' range:
 *
 *      SHI = ( sum_{i=1}^{M} I(Status(V_i) == 'sufficient') / M ) * 100%
 * ============================================================================
 */

// ICAR soil nutrient sufficiency ranges
const ICAR_BENCHMARKS = {
  nitrogen:    { low: 280, medium: 560, unit: 'kg/ha',  name: 'Available Nitrogen (N)' },
  phosphorus:  { low: 11,  medium: 22,  unit: 'kg/ha',  name: 'Available Phosphorus (P)' },
  potassium:   { low: 108, medium: 280, unit: 'kg/ha',  name: 'Available Potassium (K)' },
  sulfur:      { low: 10,  medium: 20,  unit: 'ppm',    name: 'Available Sulfur (S)' },
  zinc:        { low: 0.6, medium: 1.2, unit: 'ppm',    name: 'DTPA-Zinc (Zn)' },
  iron:        { low: 4.5, medium: 10,  unit: 'ppm',    name: 'DTPA-Iron (Fe)' },
  manganese:   { low: 2.0, medium: 5.0, unit: 'ppm',    name: 'DTPA-Manganese (Mn)' },
  boron:       { low: 0.5, medium: 1.0, unit: 'ppm',    name: 'Hot-Water Soluble Boron (B)' },
  pH:          { low: 5.5, medium: 7.5, unit: '',        name: 'Soil pH' },
  organicCarbon: { low: 0.5, medium: 0.75, unit: '%',   name: 'Organic Carbon (OC)' },
};

// Crop-wise NPK requirement per hectare (kg/ha) from ICAR recommendation
const CROP_NPK_REQUIREMENTS = {
  'Paddy / Rice':       { N: 120, P: 60, K: 60, zincKgHa: 25 },
  Wheat:                { N: 120, P: 60, K: 40, zincKgHa: 25 },
  Cotton:               { N: 180, P: 90, K: 90, zincKgHa: 25 },
  Maize:                { N: 150, P: 75, K: 50, zincKgHa: 25 },
  Soybean:              { N: 30,  P: 80, K: 40, zincKgHa: 25 },
  Tomato:               { N: 200, P: 100, K: 200, zincKgHa: 25 },
  Onion:                { N: 100, P: 50, K: 100, zincKgHa: 25 },
  Chili:                { N: 120, P: 60, K: 60, zincKgHa: 25 },
  Groundnut:            { N: 25,  P: 50, K: 50, zincKgHa: 25 },
  Sugarcane:            { N: 250, P: 115, K: 115, zincKgHa: 25 },
};

// Common fertilizer N-P-K content (%)
const FERTILIZERS = {
  'Urea (46-0-0)':          { N: 46, P: 0,   K: 0,   pricePerBag50kg: 270  },
  'DAP (18-46-0)':          { N: 18, P: 46,  K: 0,   pricePerBag50kg: 1350 },
  'MOP (0-0-60)':           { N: 0,  P: 0,   K: 60,  pricePerBag50kg: 870  },
  'NPK 10-26-26':           { N: 10, P: 26,  K: 26,  pricePerBag50kg: 1350 },
  'SSP (0-16-0)':           { N: 0,  P: 16,  K: 0,   pricePerBag50kg: 320  },
  'SOP Sulfate of Potash':   { N: 0,  P: 0,   K: 50,  pricePerBag50kg: 1800 },
};

function classifyNutrient(value, benchmark) {
  if (value === null || value === undefined) return 'unknown';
  if (value < benchmark.low) return 'deficient';
  if (value < benchmark.medium) return 'medium';
  return 'sufficient';
}

function analyzeSoilHealthCard(shcData, crop, landHectares) {
  const cropReq = CROP_NPK_REQUIREMENTS[crop] || CROP_NPK_REQUIREMENTS.Wheat;
  const soilAnalysis = {};
  const deficiencies = [];
  const recommendations = [];

  // Analyze each nutrient
  Object.keys(ICAR_BENCHMARKS).forEach((nutrient) => {
    const val = shcData[nutrient];
    const bench = ICAR_BENCHMARKS[nutrient];
    const status = classifyNutrient(val, bench);

    soilAnalysis[nutrient] = {
      measured: val,
      unit: bench.unit,
      name: bench.name,
      status,
      sufficiencyRange: `${bench.low}–${bench.medium} ${bench.unit}`,
    };

    if (status === 'deficient') deficiencies.push(bench.name);
  });

  // Generate NPK fertilizer prescription (STCR soil test based)
  const soilNStatus = soilAnalysis.nitrogen?.status;
  const soilPStatus = soilAnalysis.phosphorus?.status;
  const soilKStatus = soilAnalysis.potassium?.status;

  // Adjust recommendation based on soil test (STCR formula)
  const nReqKg = soilNStatus === 'sufficient' ? cropReq.N * 0.7 : soilNStatus === 'medium' ? cropReq.N * 0.85 : cropReq.N;
  const pReqKg = soilPStatus === 'sufficient' ? cropReq.P * 0.5 : soilPStatus === 'medium' ? cropReq.P * 0.75 : cropReq.P;
  const kReqKg = soilKStatus === 'sufficient' ? cropReq.K * 0.5 : soilKStatus === 'medium' ? cropReq.K * 0.75 : cropReq.K;

  // Fertilizer schedule calculation per hectare
  const ureaKgPerHa = Math.round((nReqKg / 46) * 100);
  const dapKgPerHa = Math.round((pReqKg / 46) * 100);
  const mopKgPerHa = Math.round((kReqKg / 60) * 100);

  const fertilizerSchedule = [
    {
      timing: 'Basal (At Sowing)',
      fertilizers: [
        { name: 'DAP (18-46-0)', kgPerHa: dapKgPerHa, totalKg: Math.round(dapKgPerHa * landHectares), costRs: Math.round((dapKgPerHa * landHectares / 50) * 1350) },
        { name: 'MOP (0-0-60)', kgPerHa: mopKgPerHa, totalKg: Math.round(mopKgPerHa * landHectares), costRs: Math.round((mopKgPerHa * landHectares / 50) * 870) },
        ...(soilAnalysis.zinc?.status === 'deficient' ? [{ name: 'Zinc Sulphate 21%', kgPerHa: 25, totalKg: Math.round(25 * landHectares), costRs: Math.round(25 * landHectares * 28) }] : []),
      ],
    },
    {
      timing: 'Top Dressing 1 (30-40 DAS)',
      fertilizers: [
        { name: 'Urea (46-0-0)', kgPerHa: Math.round(ureaKgPerHa * 0.5), totalKg: Math.round(ureaKgPerHa * 0.5 * landHectares), costRs: Math.round((ureaKgPerHa * 0.5 * landHectares / 50) * 270) },
      ],
    },
    {
      timing: 'Top Dressing 2 (60-70 DAS / At Tillering)',
      fertilizers: [
        { name: 'Urea (46-0-0)', kgPerHa: Math.round(ureaKgPerHa * 0.5), totalKg: Math.round(ureaKgPerHa * 0.5 * landHectares), costRs: Math.round((ureaKgPerHa * 0.5 * landHectares / 50) * 270) },
      ],
    },
  ];

  // Organic carbon alert
  if (soilAnalysis.organicCarbon?.status === 'deficient') {
    recommendations.push('Apply 5-6 tonnes/ha of Farm Yard Manure (FYM) or Vermicompost to improve Organic Carbon before sowing.');
  }
  if (soilAnalysis.pH?.measured < 5.5) {
    recommendations.push('Soil is acidic (pH < 5.5). Apply 1.5 tonnes/ha of Dolomitic Lime and disc-harrow before planting.');
  }
  if (soilAnalysis.pH?.measured > 8.0) {
    recommendations.push('Alkaline soil (pH > 8.0). Apply Gypsum @ 400–600 kg/ha. Consider green manure incorporation.');
  }

  return {
    crop,
    landHectares,
    soilHealthScore: Math.round((Object.values(soilAnalysis).filter((n) => n.status === 'sufficient').length / Object.keys(soilAnalysis).length) * 100),
    deficienciesDetected: deficiencies,
    soilAnalysis,
    fertilizerSchedule,
    agronomicRecommendations: recommendations,
  };
}

module.exports = { analyzeSoilHealthCard, ICAR_BENCHMARKS, CROP_NPK_REQUIREMENTS };
