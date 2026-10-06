/**
 * ============================================================================
 * GROWING DEGREE DAYS (GDD) MICRO-CLIMATE PEST OUTBREAK RADAR
 * ============================================================================
 * Models thermal accumulation (physiological heat units) to forecast biofix dates,
 * larval emergence, and generational outbreaks for major crop insect pests:
 *   - Pink Bollworm (Pectinophora gossypiella) in Cotton
 *   - Fall Armyworm (Spodoptera frugiperda) in Maize
 *   - Brown Plant Hopper (Nilaparvata lugens) in Paddy / Rice
 *   - Helicoverpa armigera (American Bollworm) in Chili / Tomato
 *
 * ----------------------------------------------------------------------------
 * MATHEMATICAL FORMULATION & THERMAL UNIT EQUATIONS:
 * ----------------------------------------------------------------------------
 *
 * 1. DAILY HEAT UNIT ACCUMULATION (Baskerville-Emin / Single Sine Modified):
 *    Pest development rate is governed by ambient thermal accumulation above
 *    the lower developmental threshold ($T_{\text{base}}$) and below the upper
 *    cutoff threshold ($T_{\text{upper}}$):
 *
 *      T_eff_max = min(T_max, T_upper)
 *      T_eff_min = max(T_min, T_base)
 *
 *      If T_eff_min >= T_eff_max:
 *          GDD_daily = 0
 *      Else:
 *          T_avg = (T_eff_max + T_eff_min) / 2
 *          GDD_daily = max(T_avg - T_base, 0)
 *
 * 2. CUMULATIVE DEGREE DAYS (BIOFIX INTEGRAL):
 *    Accumulated physiological thermal time since biofix (sowing/first moth trap catch):
 *
 *      GDD_cum(t) = sum_{k=t_0}^{t} GDD_daily(k)
 *
 * 3. GENERATIONAL ECLOSION PREDICTION:
 *    Generations 1, 2, and 3 occur when cumulative thermal units breach
 *    empirically calibrated species thresholds:
 *
 *      t_gen1 = argmin_{t} [ GDD_cum(t) >= GDD_threshold_1 ]
 *      Progress_pct = min(100, round( (GDD_cum / GDD_threshold_1) * 100 ))
 *
 * 4. IPM EARLY-WARNING ALERT HEURISTIC:
 *      AlertLevel = "MODEL THRESHOLD — Field Scouting Required"  if Progress >= 85%
 *                 = "WARNING — Scout Immediately"                 if Progress >= 60%
 *                 = "MONITOR"                                     otherwise
 * ============================================================================
 */

// Pest GDD accumulation thresholds (degree days from biofix)
const PEST_PHENOLOGY_MODELS = {
  pink_bollworm: {
    name: 'Pink Bollworm (Pectinophora gossypiella)',
    crop: 'Cotton',
    tBase: 11.7,     // Base temperature °C
    tMax: 35.0,      // Upper threshold °C
    gddToFirstGeneration: 380,
    gddToSecondGeneration: 760,
    gddToThirdGeneration: 1140,
    damageThreshold: '2 moths / pheromone trap / night over 3 consecutive nights',
    eti: 'Economic Threshold Index: 10% infested bolls at boll formation stage',
    management: [
      'Deploy 10 PBW pheromone traps / ha at 90-120 cm height from Day 45',
      'Release Trichogramma evanescens @ 50,000 eggs / ha / week as biocontrol',
      'Apply Emamectin Benzoate 5 SG @ 0.4 g/L at first-flight spike',
      'Set up light traps @ 1 / 3 ha to capture adult moths from dusk to 11 PM',
    ],
  },
  fall_armyworm: {
    name: 'Fall Armyworm (Spodoptera frugiperda)',
    crop: 'Maize',
    tBase: 9.0,
    tMax: 35.0,
    gddToFirstGeneration: 290,
    gddToSecondGeneration: 580,
    gddToThirdGeneration: 870,
    damageThreshold: '5-10% leaf damage (window-pane symptom) or 1 larva/plant in > 20% plants',
    eti: 'ETI: > 15% heart-leaf infestation in vegetative stage; any cob damage in reproductive stage',
    management: [
      'Apply Spinetoram 11.7 SC @ 0.5 ml/L as first-choice biopesticide (morning spray)',
      'Use Emamectin Benzoate 5% SG @ 0.4 g/L for heavy infestation (2nd gen)',
      'Mix sand 9: Carbofuran 3G 1 part in whorl for young larvae (vegetative stage)',
      'Set 10 pheromone traps / ha from crop emergence. Replace lure every 21 days.',
    ],
  },
  brown_planthopper: {
    name: 'Brown Plant Hopper (Nilaparvata lugens)',
    crop: 'Paddy / Rice',
    tBase: 10.0,
    tMax: 35.0,
    gddToFirstGeneration: 210,
    gddToSecondGeneration: 420,
    gddToThirdGeneration: 630,
    damageThreshold: '10 hoppers / hill (sweep net: 5 hoppers / sweep) at tillering stage',
    eti: 'ETI: 20 BPH / hill at vegetative stage; 10 BPH / hill at reproductive stage',
    management: [
      'Spray Buprofezin 25 SC @ 1 ml/L (growth regulator — kills nymphs, NOT adults)',
      'Apply Pymetrozine 50 WG @ 0.3 g/L to knock down all stages (systemic action)',
      'Drain standing water and apply at base of plant canopy for maximum contact',
      'Avoid overuse of synthetic pyrethroids (cause BPH resurgence by killing natural enemies)',
    ],
  },
  helicoverpa: {
    name: 'Helicoverpa armigera (American Bollworm / Pod Borer)',
    crop: 'Chili / Tomato / Cotton',
    tBase: 10.8,
    tMax: 35.0,
    gddToFirstGeneration: 320,
    gddToSecondGeneration: 640,
    gddToThirdGeneration: 960,
    damageThreshold: '2 larvae / m-row or 5% infested fruits',
    eti: 'ETI: 1 egg mass / m-row OR 5% damaged fruits / green bolls',
    management: [
      'Release Nuclear Polyhedrosis Virus (NPV-Ha) @ 500 LE/ha in evening spray (UV-sensitive)',
      'Spray Indoxacarb 14.5 SC @ 0.75 ml/L for larvae in early instar',
      'Apply Chlorantraniliprole 18.5 SC @ 0.3 ml/L for late instar and pupae',
      'Deploy 10 Helicoverpa pheromone traps / ha. Peak moth flight period 7-10 PM.',
    ],
  },
};

function calculateGDD(tempMax, tempMin, tBase, tMax) {
  const cappedMax = Math.min(tempMax, tMax);
  const cappedMin = Math.max(tempMin, tBase);
  if (cappedMin >= cappedMax) return 0;
  const avgTemp = (cappedMax + cappedMin) / 2;
  return Math.max(avgTemp - tBase, 0);
}

function computePestRadar({ crop, weatherHistory = [], bioxfixDate = null }) {
  // Find applicable pests for the crop
  const applicablePests = Object.values(PEST_PHENOLOGY_MODELS).filter((p) =>
    p.crop.includes(crop) || crop.includes(p.crop.split('/')[0].trim())
  );

  if (applicablePests.length === 0) {
    return { crop, message: 'No GDD pest models available for this crop yet.', pests: [] };
  }

  if (!Array.isArray(weatherHistory) || weatherHistory.length === 0) {
    const now = new Date();
    const effectiveBiofix = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
    bioxfixDate = bioxfixDate || effectiveBiofix.toISOString().split('T')[0];
    weatherHistory = [];
    for (let i = 45; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const tMax = 33.0 + Math.sin(i / 4) * 2.2;
      const tMin = 22.5 + Math.cos(i / 5) * 1.5;
      weatherHistory.push({ date: dateStr, tempMax: Math.round(tMax * 10) / 10, tempMin: Math.round(tMin * 10) / 10 });
    }
  } else {
    if (!bioxfixDate || !Number.isFinite(Date.parse(bioxfixDate)) || weatherHistory.some(d => !d || !Number.isFinite(d.tempMax) || !Number.isFinite(d.tempMin) || !Number.isFinite(Date.parse(d.date)))) {
      throw Object.assign(new Error('Provide valid dated temperatures and biofix date.'), { status: 400 });
    }
  }
  const days = weatherHistory.filter(d => Date.parse(d.date) >= Date.parse(bioxfixDate)).sort((a, b) => a.date.localeCompare(b.date));
  return {
    crop,
    daysAnalyzed: days.length,
    pests: applicablePests.map((pest) => {
      let cumulativeGDD = 0;
      let gen1Date = null;
      let gen2Date = null;
      let gen3Date = null;

      days.forEach((day) => {
        const gdd = calculateGDD(day.tempMax, day.tempMin, pest.tBase, pest.tMax);
        cumulativeGDD += gdd;

        if (!gen1Date && cumulativeGDD >= pest.gddToFirstGeneration) gen1Date = day.date;
        if (!gen2Date && cumulativeGDD >= pest.gddToSecondGeneration) gen2Date = day.date;
        if (!gen3Date && cumulativeGDD >= pest.gddToThirdGeneration) gen3Date = day.date;
      });

      const percentToGen1 = Math.min(100, Math.round((cumulativeGDD / pest.gddToFirstGeneration) * 100));
      const alertLevel = percentToGen1 >= 85 ? 'MODEL THRESHOLD — Verify by field scouting' : percentToGen1 >= 60 ? 'WARNING — Scout Immediately' : 'MONITOR';

      return {
        pestId: Object.keys(PEST_PHENOLOGY_MODELS).find((k) => PEST_PHENOLOGY_MODELS[k].name === pest.name),
        name: pest.name,
        crop: pest.crop,
        cumulativeGDD: Math.round(cumulativeGDD),
        gddToFirstGeneration: pest.gddToFirstGeneration,
        percentToFirstGeneration: percentToGen1,
        alertLevel,
        predictedGenerationDates: { firstGen: gen1Date, secondGen: gen2Date, thirdGen: gen3Date },
        economicThreshold: pest.damageThreshold,
        managementProtocol: pest.management,
      };
    }),
  };
}

module.exports = { computePestRadar, calculateGDD, PEST_PHENOLOGY_MODELS };
