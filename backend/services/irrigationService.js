'use strict';
/**
 * Weather-based irrigation scenario calculator
 * Calculates crop water requirements (ETc = ETo * Kc), soil moisture balance,
 * pump runtimes, and optimal 7-day irrigation schedules.
 */

// Crop coefficients (Kc) across growth stages: initial, vegetative, mid_season (flowering), late_season (maturity)
const CROP_KC_DATABASE = {
  Rice: { initial: 1.05, vegetative: 1.15, mid_season: 1.20, late_season: 0.90, root_depth_m: 0.6, depletion_factor_p: 0.20 },
  Wheat: { initial: 0.35, vegetative: 0.75, mid_season: 1.15, late_season: 0.40, root_depth_m: 1.0, depletion_factor_p: 0.55 },
  Cotton: { initial: 0.35, vegetative: 0.75, mid_season: 1.20, late_season: 0.65, root_depth_m: 1.2, depletion_factor_p: 0.65 },
  Tomato: { initial: 0.60, vegetative: 0.85, mid_season: 1.15, late_season: 0.80, root_depth_m: 0.7, depletion_factor_p: 0.40 },
  Maize: { initial: 0.40, vegetative: 0.80, mid_season: 1.20, late_season: 0.55, root_depth_m: 1.0, depletion_factor_p: 0.55 },
  Sugarcane: { initial: 0.40, vegetative: 1.00, mid_season: 1.25, late_season: 0.75, root_depth_m: 1.5, depletion_factor_p: 0.65 },
  Chili: { initial: 0.50, vegetative: 0.80, mid_season: 1.10, late_season: 0.80, root_depth_m: 0.8, depletion_factor_p: 0.45 },
  Soybean: { initial: 0.40, vegetative: 0.75, mid_season: 1.15, late_season: 0.50, root_depth_m: 0.9, depletion_factor_p: 0.50 },
  Groundnut: { initial: 0.40, vegetative: 0.75, mid_season: 1.15, late_season: 0.55, root_depth_m: 0.6, depletion_factor_p: 0.50 },
  Onion: { initial: 0.50, vegetative: 0.80, mid_season: 1.05, late_season: 0.75, root_depth_m: 0.5, depletion_factor_p: 0.35 },
};

// Soil water holding capacities (mm of water per meter of soil depth)
const SOIL_TAW_MM_PER_M = {
  black: 180,       // Deep Black Cotton Soil / Vertisols
  alluvial: 160,    // Fertile Indo-Gangetic Alluvium
  red: 120,         // Red Loamy Soil
  sandy: 70,        // Coarse Sandy Soil
  clay: 190,        // Heavy Clay
  loam: 150,        // Medium Loam
};

// Standard pump discharge capacities in Liters per Hour (L/hr) by Motor HP
const PUMP_CAPACITIES_LPH = {
  "3": 18000,
  "5": 30000,
  "7.5": 45000,
  "10": 60000,
  "drip_system": 12000,
};

/**
 * Estimate Reference Evapotranspiration (ETo in mm/day)
 * Using FAO Hargreaves-Samani temperature-radiation model
 */
function calculateETo(tempMax, tempMin, tempMean, latitude = 17.38) {
  const tRange = Math.max(tempMax - tempMin, 2.0);
  const latRad = (latitude * Math.PI) / 180;
  // Extraterrestrial solar radiation approximation Ra (MJ/m2/day)
  const ra = Math.max(28 + 10 * Math.cos(latRad), 20.0);
  const et0 = 0.0023 * (tempMean + 17.8) * Math.sqrt(tRange) * (ra * 0.408);
  return Math.max(Number(et0.toFixed(2)), 1.5);
}

/**
 * Calculate Comprehensive Irrigation Schedule
 */
function calculateIrrigationSchedule({
  crop = "Wheat",
  stage = "vegetative",
  soil = "black",
  landAcres = 2.5,
  pumpHp = "5",
  irrigationType = "flood", // "drip", "sprinkler", "flood"
  weatherForecast = null,
  initialDeficitMm,
  pumpFlowLph,
}) {
  const invalid=message=>Object.assign(new Error(message),{status:400});
  if(!CROP_KC_DATABASE[crop]||!['initial','vegetative','mid_season','late_season'].includes(stage)||!SOIL_TAW_MM_PER_M[soil]||!['drip','sprinkler','flood'].includes(irrigationType))throw invalid('Select a supported crop, growth stage, soil and irrigation method.');
  if(![landAcres,initialDeficitMm,pumpFlowLph].every(Number.isFinite)||landAcres<=0||landAcres>1e6||initialDeficitMm<0||initialDeficitMm>1000||pumpFlowLph<=0||pumpFlowLph>1e7)throw invalid('Provide area, estimated starting water deficit (mm) and measured pump flow (L/hour).');
  const cropData = CROP_KC_DATABASE[crop];
  const stageKc = cropData[stage] || cropData.vegetative || 0.85;
  const tawPerM = SOIL_TAW_MM_PER_M[soil] || 150;
  const rootDepth = cropData.root_depth_m || 0.8;
  const depletionP = cropData.depletion_factor_p || 0.5;

  // Total Available Water (TAW) and Readily Available Water (RAW) in root zone (mm)
  const taw = tawPerM * rootDepth;
  const raw = taw * depletionP;

  // Efficiency factor based on irrigation method
  const efficiency = irrigationType === "drip" ? 0.90 : irrigationType === "sprinkler" ? 0.75 : 0.60;

  if (!Array.isArray(weatherForecast) || weatherForecast.length < 1) throw new Error('A current weather forecast is required for irrigation guidance.');
  const days = weatherForecast;
  const pumpFlowRate = pumpFlowLph;

  let soilWaterDeficit = initialDeficitMm; // Explicit user-supplied scenario assumption
  const schedule = [];
  let totalWaterLiters7Days = 0;
  let totalPumpHours7Days = 0;

  days.forEach((d, idx) => {
    if(![d.et0,d.rainMm,d.tempMax,d.tempMin].every(Number.isFinite)||d.et0<0||d.rainMm<0||!d.date)throw invalid('Complete provider rainfall, ETo, temperature and date are required.');
    const et0 = d.et0;
    const etc = Number((et0 * stageKc).toFixed(2)); // Crop water requirement (mm/day)

    // Effective rainfall (FAO approximation: rain > 5mm has 70% efficiency)
    const effRain = d.rainMm > 5 ? Number((d.rainMm * 0.7).toFixed(1)) : 0;

    // Accumulate soil moisture deficit
    soilWaterDeficit += etc - effRain;
    if (soilWaterDeficit < 0) soilWaterDeficit = 0;

    const needsIrrigation = soilWaterDeficit >= raw;
    let waterToApplyMm = 0;
    let waterVolumeLiters = 0;
    let pumpMinutes = 0;
    let actionRecommendation = "Maintain soil moisture. No irrigation needed.";
    let priority = "routine";

    if (effRain >= 8) {
      actionRecommendation = `Rain predicted (${d.rainMm} mm) — Delay irrigation to avoid root asphyxiation.`;
      priority = "skip";
    } else if (needsIrrigation) {
      waterToApplyMm = Number((soilWaterDeficit / efficiency).toFixed(1));
      // 1 mm on 1 acre = 4046.86 Liters
      waterVolumeLiters = Math.round(waterToApplyMm * 4047 * landAcres);
      pumpMinutes = Math.round((waterVolumeLiters / pumpFlowRate) * 60);

      const hours = Math.floor(pumpMinutes / 60);
      const mins = pumpMinutes % 60;
      const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;

      actionRecommendation = `Apply ${waterToApplyMm} mm irrigation (${waterVolumeLiters.toLocaleString()} L). Run ${pumpHp} HP pump for ${timeStr}.`;
      priority = "irrigate";

      soilWaterDeficit = 0; // Reset deficit after irrigation
      totalWaterLiters7Days += waterVolumeLiters;
      totalPumpHours7Days += pumpMinutes / 60;
    }

    schedule.push({
      day: d.day,
      date: d.date,
    tempMax: d.tempMax,
      tempMin: d.tempMin,
      et0,
      etc,
      rainMm: d.rainMm,
      effRain,
      needsIrrigation: needsIrrigation && effRain < 8,
      waterVolumeLiters,
      pumpMinutes,
      recommendation: actionRecommendation,
      priority,
    });
  });

  return {
    crop,
    stage,
    soilType: soil,
    landAcres,
    cropKc: stageKc,
    irrigationType,
    pumpHp,
    efficiencyPercent: Math.round(efficiency * 100),
    rootZoneDepthM: rootDepth,
    readilyAvailableWaterMm: Math.round(raw),
    weeklySummary: {
      totalWaterLiters: totalWaterLiters7Days,
      totalPumpHours: Number(totalPumpHours7Days.toFixed(1)),
      estimatedElectricityKwh: Number((totalPumpHours7Days * Number(pumpHp || 5) * 0.746).toFixed(1)),
      waterSavedVsFloodPercent: Math.round((1 - 0.6 / efficiency) * 100),
    },
    schedule,
    assumptions: {initialDeficitMm,pumpFlowLph,efficiency,rainfallEffectiveFraction:0.7},
    limitations:['Scenario estimate: inspect soil moisture before acting.','Crop coefficients, root depth, soil capacity and method efficiency are reference assumptions, not field measurements.','Each suggested irrigation assumes it is completed; recalculate if skipped.','Effective rainfall uses a simplified 70% fraction above 5 mm. No water-saving guarantee.'],
    provenance: { weather: 'WEATHER_PROVIDER', cropCoefficients: 'PROJECT_REFERENCE_ESTIMATES_REQUIRE_LOCAL_VALIDATION', soilCapacity: 'REFERENCE_SOIL_TABLE', soilMoisture: 'USER_PROVIDED_STARTING_DEFICIT; NO_CONNECTED_SENSOR' },
  };
}

module.exports = {
  calculateETo,
  calculateIrrigationSchedule,
  CROP_KC_DATABASE,
  SOIL_TAW_MM_PER_M,
  PUMP_CAPACITIES_LPH,
};
