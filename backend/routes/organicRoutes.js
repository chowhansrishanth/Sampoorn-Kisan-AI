'use strict';

const express = require('express');
const router = express.Router();

// ── ICAR & ZBNF Standard Bio-Formulations ─────────────────────────────────────
const BIO_FORMULATIONS = [
  {
    id: 'jeevamrutha',
    name: 'Jeevamrutha (जीवामृत / Microbial Soil Inoculant)',
    category: 'Soil Fertility & Microbial Culture',
    shelfLifeDays: 12,
    applicationMethod: 'Soil application via irrigation water or 10% foliar spray',
    dosagePerAcre: '200 Liters per acre (applied twice monthly)',
    targetBenefits: 'Multiplies beneficial soil aerobic/anaerobic bacteria, increases earthworm activity, unlocks fixed soil phosphorus.',
    baseIngredientsPer200L: {
      freshDesiCowDungKg: 10,
      desiCowUrineLiters: 10,
      jaggeryKg: 2,
      pulseFlourKg: 2, // Besan / chickpea or green gram flour
      virginSoilHandful: 1, // Soil from field bunds or banyan tree
      waterLiters: 200
    },
    preparationSteps: [
      'Take 200 liters of water in a 250-liter plastic drum (keep under shade, avoid direct sunlight).',
      'Add 10 kg fresh desi cow dung and 10 liters desi cow urine. Stir thoroughly with a wooden stick.',
      'Dissolve 2 kg jaggery and 2 kg pulse flour in 5 liters water and add to the barrel.',
      'Add a handful of virgin forest or bund soil to introduce native microbial flora.',
      'Stir clockwise 50 times and counter-clockwise 50 times twice daily for 48 to 72 hours.',
      'Cover drum with a wet gunny bag to maintain humidity and aerobic respiration.'
    ]
  },
  {
    id: 'beejamrutha',
    name: 'Beejamrutha (बीजामृत / Seed Treatment Culture)',
    category: 'Seed Dressing & Seedling Dip',
    shelfLifeDays: 2,
    applicationMethod: 'Coat seeds with slurry before sowing; air-dry in shade for 20 minutes',
    dosagePerAcre: 'Sufficient for treating 50–100 kg seed lot',
    targetBenefits: 'Protects emerging germlings from soil-borne fungi (Pythium, Rhizoctonia, Fusarium) and bacterial wilt.',
    baseIngredientsPer200L: {
      freshDesiCowDungKg: 5,
      desiCowUrineLiters: 5,
      desiCowMilkLiters: 1,
      limestoneChunaGrams: 50,
      waterLiters: 20
    },
    preparationSteps: [
      'Hang 5 kg fresh cow dung in a cloth bag and submerge overnight in 20 liters water.',
      'Squeeze the bag repeatedly next morning to extract active microbial liquor.',
      'Add 5 liters desi cow urine, 1 liter cow milk, and 50g slaked lime (chuna) to adjust pH.',
      'Mix thoroughly. Slurry is immediately ready for seed soaking (5 mins) or root dipping of transplants.'
    ]
  },
  {
    id: 'panchagavya',
    name: 'Panchagavya (पंचगव्य / Miracle Growth Promoter)',
    category: 'Growth Stimulant & Micronutrient Tonic',
    shelfLifeDays: 180,
    applicationMethod: '3% Foliar spray (300 ml in 10L water) or drip irrigation (20L/acre)',
    dosagePerAcre: '3 Liters per 100 Liters spray solution',
    targetBenefits: 'Rich in auxins, gibberellins, and cytokinin; triggers profuse branching, flowering, and fruit setting.',
    baseIngredientsPer200L: {
      freshDesiCowDungKg: 7,
      desiCowGheeKg: 1,
      desiCowUrineLiters: 10,
      freshCowMilkLiters: 3,
      cowCurdLiters: 2,
      tenderCoconutWaterLiters: 3,
      ripeBananasCount: 12,
      sugarcaneJuiceLiters: 3
    },
    preparationSteps: [
      'Day 1–3: Thoroughly mix 7 kg dung and 1 kg ghee in a wide-mouthed clay/plastic vessel. Stir twice daily.',
      'Day 4: Add urine and 10 liters water. Stir for 10 days twice daily.',
      'Day 14: Add milk, curd, tender coconut water, jaggery/sugarcane juice, and mashed bananas.',
      'Stir twice daily for an additional 7 days. Fermented product is ready by Day 21 (pleasant fruity aroma).'
    ]
  },
  {
    id: 'neemastra',
    name: 'Neemastra (नीमास्त्र / Sucking Pest Bio-Shield)',
    category: 'Botanical Insecticide',
    shelfLifeDays: 180,
    applicationMethod: '100% Undiluted foliar spray during early morning or late evening',
    dosagePerAcre: '200 Liters spray per acre',
    targetBenefits: 'Effective against aphids, jassids, whiteflies, thrips, and early instar leaf-eating caterpillars.',
    baseIngredientsPer200L: {
      freshNeemLeavesKg: 10,
      desiCowUrineLiters: 10,
      freshDesiCowDungKg: 2,
      waterLiters: 200
    },
    preparationSteps: [
      'Crush 10 kg neem leaves or crushed neem seed kernel paste.',
      'Add to 200 liters water along with 10 liters cow urine and 2 kg cow dung.',
      'Stir clockwise twice daily for 48 hours in shade.',
      'Filter through double-layered muslin cloth and spray directly without dilution.'
    ]
  },
  {
    id: 'brahmastra',
    name: 'Brahmastra (ब्रह्मास्त्र / Borer & Pod Borer Annihilator)',
    category: 'Potent Bio-Repellent',
    shelfLifeDays: 180,
    applicationMethod: '2% to 2.5% Foliar spray (200-250 ml in 10L water)',
    dosagePerAcre: '4 to 5 Liters per acre mixed in 200L water',
    targetBenefits: 'Controls bollworms in cotton, shoot and fruit borers in brinjal/tomato, and stem borers in paddy.',
    baseIngredientsPer200L: {
      desiCowUrineLiters: 10,
      crushedNeemLeavesKg: 3,
      custardAppleLeavesKg: 2, // Sitaphal leaves
      papayaLeavesKg: 2,
      guavaOrPomegranateLeavesKg: 2,
      calotropisLeavesKg: 2 // Aak / Jilledu leaves
    },
    preparationSteps: [
      'Crush leaves of 5 bitter/latex-yielding plants into a coarse paste.',
      'Combine with 10 liters of desi cow urine in an earthen or steel pot.',
      'Boil on slow fire until the liquid reduces to half volume (approximately 5 liters).',
      'Allow to cool for 48 hours; filter and bottle. Stable for up to 6 months.'
    ]
  }
];

// GET /api/organic/formulations — list all bio-inputs
router.get('/formulations', (req, res) => {
  res.json({
    success: true,
    formulations: BIO_FORMULATIONS
  });
});

// POST /api/organic/calculate-acreage — computes raw materials scaled to farm size
router.post('/calculate-acreage', (req, res) => {
  try {
    const { formulationId = 'jeevamrutha', acres = 2.5 } = req.body || {};
    const farmAcres = Math.max(0.25, Math.min(100, Number(acres) || 1));
    const formulation = BIO_FORMULATIONS.find(f => f.id === formulationId) || BIO_FORMULATIONS[0];

    const scaledIngredients = {};
    Object.entries(formulation.baseIngredientsPer200L).forEach(([key, val]) => {
      scaledIngredients[key] = +(val * farmAcres).toFixed(1);
    });

    const totalSolutionLiters = Math.round(200 * farmAcres);

    return res.json({
      success: true,
      formulationId: formulation.id,
      formulationName: formulation.name,
      acres: farmAcres,
      totalSolutionLiters,
      scaledIngredients,
      applicationSchedule: formulation.dosagePerAcre,
      estimatedPreparationCost: Math.round(farmAcres * 140), // Raw material cost estimate vs chemical fertilizer (saves ~₹3500/acre)
      chemicalFertilizerSavingsINR: Math.round(farmAcres * 3200)
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Acreage scaling failed', details: err.message });
  }
});

module.exports = router;
