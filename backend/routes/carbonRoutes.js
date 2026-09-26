'use strict';

const express = require('express');
const router = express.Router();

/**
 * Regenerative Agriculture & Soil Carbon Quantification Engine
 * Based on IPCC Tier-1 & Verra VM0042 agricultural soil carbon methodologies.
 */

const REGENERATIVE_PRACTICES = {
  noTill: { name: 'Zero Tillage / Direct Seeding', sequestrationPerAcreYearTCO2: 0.65, description: 'Prevents soil carbon oxidation and preserves fungal mycorrhizal networks.' },
  residueRetention: { name: 'Crop Residue Mulching (No Stubble Burning)', sequestrationPerAcreYearTCO2: 0.85, description: 'Mulches 3–5 tons of dry biomass back into topsoil per acre.' },
  coverCropping: { name: 'Leguminous Cover Crops / Green Manuring', sequestrationPerAcreYearTCO2: 0.70, description: 'Sunhemp or Dhaincha fixing atmospheric nitrogen and adding root exudates.' },
  biocharApplication: { name: 'Biochar / Ag-Char Application', sequestrationPerAcreYearTCO2: 1.20, description: 'Stable recalcitrant carbon with 100+ year soil half-life.' },
  dripFertigation: { name: 'Precision Drip Fertigation', sequestrationPerAcreYearTCO2: 0.35, description: 'Cuts nitrous oxide (N2O) emissions by 40% through targeted nutrient placement.' },
  agroforestry: { name: 'Agroforestry / Bund Tree Planting (Subabul/Melia)', sequestrationPerAcreYearTCO2: 1.50, description: 'Perennial deep-root woody biomass carbon storage.' }
};

// POST /api/carbon/estimate
router.post('/estimate', (req, res) => {
  try {
    const {
      acres = 5,
      activePractices = ['noTill', 'residueRetention', 'coverCropping'],
      carbonCreditPriceINR = 1800 // Market rate: ~₹1,500 - ₹2,500 per tCO2e
    } = req.body || {};

    const farmAcres = Math.max(0.5, Math.min(500, Number(acres) || 1));
    const pricePerTon = Math.max(800, Math.min(5000, Number(carbonCreditPriceINR) || 1800));

    let totalSequesteredPerAcre = 0;
    const practiceBreakdown = [];

    (Array.isArray(activePractices) ? activePractices : []).forEach(pKey => {
      const practice = REGENERATIVE_PRACTICES[pKey];
      if (practice) {
        totalSequesteredPerAcre += practice.sequestrationPerAcreYearTCO2;
        practiceBreakdown.push({
          id: pKey,
          name: practice.name,
          tco2PerAcre: practice.sequestrationPerAcreYearTCO2,
          totalTCO2: +(practice.sequestrationPerAcreYearTCO2 * farmAcres).toFixed(2),
          description: practice.description
        });
      }
    });

    const totalTCO2SequesteredAnnual = +(totalSequesteredPerAcre * farmAcres).toFixed(2);
    const grossCarbonRevenueINR = Math.round(totalTCO2SequesteredAnnual * pricePerTon);
    const verificationAndPlatformFeeINR = Math.round(grossCarbonRevenueINR * 0.15); // 15% MRV & registry fees
    const netFarmerCarbonIncomeINR = grossCarbonRevenueINR - verificationAndPlatformFeeINR;

    // Soil Organic Carbon (SOC) percentage increase estimate over 3 years
    const estimatedSocIncreasePercent = +(totalSequesteredPerAcre * 0.18).toFixed(2);

    return res.json({
      success: true,
      farmAcres,
      totalTCO2SequesteredAnnual,
      totalSequesteredPerAcre: +totalSequesteredPerAcre.toFixed(2),
      estimatedSocIncreasePercent,
      grossCarbonRevenueINR,
      netFarmerCarbonIncomeINR,
      pricePerTonINR: pricePerTon,
      practiceBreakdown,
      registryStandards: ['Verra VCS (VM0042)', 'Gold Standard for the Global Goals'],
      sustainabilityRating: totalSequesteredPerAcre > 2.0 ? 'Elite Regenerative (A+)' : totalSequesteredPerAcre > 1.0 ? 'Advanced Sustainable (A)' : 'Emerging Carbon Farm (B)'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Carbon estimation failed', details: err.message });
  }
});

// GET /api/carbon/practices — available practices catalogue
router.get('/practices', (req, res) => {
  res.json({
    success: true,
    practices: REGENERATIVE_PRACTICES
  });
});

module.exports = router;
