'use strict';

const express = require('express');
const router = express.Router();

/**
 * Pradhan Mantri Fasal Bima Yojana (PMFBY) Framework
 * Standard premium rates:
 * - Kharif Food & Oilseeds: 2.0%
 * - Rabi Food & Oilseeds: 1.5%
 * - Annual Commercial / Horticultural crops: 5.0%
 */

const CROP_INSURANCE_DATA = {
  Paddy: { season: 'Kharif', category: 'Foodgrains', farmerPremiumRatePercent: 2.0, sumInsuredPerAcreINR: 32000 },
  Wheat: { season: 'Rabi', category: 'Foodgrains', farmerPremiumRatePercent: 1.5, sumInsuredPerAcreINR: 28000 },
  Cotton: { season: 'Kharif', category: 'Commercial', farmerPremiumRatePercent: 5.0, sumInsuredPerAcreINR: 36000 },
  Soybean: { season: 'Kharif', category: 'Oilseeds', farmerPremiumRatePercent: 2.0, sumInsuredPerAcreINR: 24000 },
  Maize: { season: 'Kharif', category: 'Foodgrains', farmerPremiumRatePercent: 2.0, sumInsuredPerAcreINR: 22000 },
  Chili: { season: 'Kharif / Rabi', category: 'Horticulture', farmerPremiumRatePercent: 5.0, sumInsuredPerAcreINR: 48000 },
  Tomato: { season: 'Rabi', category: 'Horticulture', farmerPremiumRatePercent: 5.0, sumInsuredPerAcreINR: 42000 },
  Mustard: { season: 'Rabi', category: 'Oilseeds', farmerPremiumRatePercent: 1.5, sumInsuredPerAcreINR: 21000 },
  Groundnut: { season: 'Kharif', category: 'Oilseeds', farmerPremiumRatePercent: 2.0, sumInsuredPerAcreINR: 26000 }
};

const CLAIM_TRIAGE_RULES = {
  PREVENTED_SOWING: {
    title: 'Prevented Sowing / Planting Risk',
    stage: 'Pre-Sowing (Due to deficit rainfall or adverse weather)',
    payoutTerms: 'Up to 25% of the Sum Insured paid immediately; policy terminates after payout.',
    timeWindow: 'Must intimate within 15 days of normal sowing closure date.'
  },
  MID_SEASON_ADVERSITY: {
    title: 'Mid-Season Adversity (Drought / Dry Spell / Flood)',
    stage: 'Standing Crop (Crop loss > 50% based on State Govt notification)',
    payoutTerms: 'Immediate on-account payment of 25% of expected claims; balance settled after harvest crop cutting experiments (CCE).',
    timeWindow: 'Direct relief credited within 30 days of notification.'
  },
  POST_HARVEST_LOSS: {
    title: 'Post-Harvest Losses (Cyclonic Rains / Unseasonal Downpour)',
    stage: 'Harvested crop kept in cut-and-spread condition in field for drying',
    payoutTerms: 'Individual farm assessment; payout based on actual localized field damage.',
    timeWindow: 'MANDATORY: Must intimate claim within 72 HOURS of loss event.'
  },
  LOCALIZED_CALAMITY: {
    title: 'Localized Calamities (Hailstorm / Landslide / Inundation)',
    stage: 'Any vegetative to maturity stage',
    payoutTerms: 'Individual farm survey by Joint Committee (Insurance Co. + Agriculture Dept).',
    timeWindow: 'MANDATORY: Must intimate claim within 72 HOURS via Crop Insurance App or Toll-Free 14447.'
  }
};

// POST /api/insurance/calculate-premium
router.post('/calculate-premium', (req, res) => {
  try {
    const { crop = 'Paddy', acres = 3, state = 'Telangana' } = req.body || {};
    const cropMeta = CROP_INSURANCE_DATA[crop] || CROP_INSURANCE_DATA.Paddy;
    const farmAcres = Number(acres) || 1;

    const sumInsuredTotalINR = cropMeta.sumInsuredPerAcreINR * farmAcres;
    const actuarialPremiumRatePercent = 14.5; // Commercial actuarial rate
    const totalActuarialPremiumINR = Math.round(sumInsuredTotalINR * (actuarialPremiumRatePercent / 100));

    // Farmer only pays fixed statutory rate (1.5% to 5.0%)
    const farmerPremiumPayableINR = Math.round(sumInsuredTotalINR * (cropMeta.farmerPremiumRatePercent / 100));
    // Government subsidizes the rest (50:50 Center & State)
    const govtSubsidyINR = totalActuarialPremiumINR - farmerPremiumPayableINR;

    return res.json({
      success: true,
      crop,
      acres: farmAcres,
      state,
      season: cropMeta.season,
      category: cropMeta.category,
      sumInsuredTotalINR,
      sumInsuredPerAcreINR: cropMeta.sumInsuredPerAcreINR,
      farmerPremiumRatePercent: cropMeta.farmerPremiumRatePercent,
      farmerPremiumPayableINR,
      govtSubsidyINR,
      governmentSubsidySharePercent: +(((govtSubsidyINR) / totalActuarialPremiumINR) * 100).toFixed(1),
      officialPortal: 'https://pmfby.gov.in',
      claimHelpline: '14447 (National PMFBY Toll-Free Helpline)'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Premium calculation failed', details: err.message });
  }
});

// GET /api/insurance/claim-guide — 72-hour claim intimation protocol
router.get('/claim-guide', (req, res) => {
  res.json({
    success: true,
    claimCategories: CLAIM_TRIAGE_RULES,
    claimIntimationChecklist: [
      'Take 3 clear geo-tagged photos of damaged field with time-stamp using Crop Insurance App.',
      'Call National Toll-Free Helpline 14447 or bank branch within 72 hours of damage event.',
      'Keep Khasra / Survey Number, Bank Passbook, and PMFBY Application Receipt handy.',
      'Joint Survey will be conducted within 10 days by insurance surveyor and Patwari / Village Agriculture Officer.'
    ],
    helpline: '14447'
  });
});

module.exports = router;
