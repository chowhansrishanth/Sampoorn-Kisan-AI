'use strict';

const express = require('express');
const router = express.Router();

/**
 * MNRE & PM-KUSUM Scheme Component-B & C Standards
 * Sizing solar pumps according to total dynamic head (meters) and water discharge.
 */

// Sizing logic: Water Power (kW) = (Flow LPH * Head meters * 9.81) / (3.6e6 * Pump Efficiency 0.5)
function calculateSolarPumpSizing({
  depthFeet = 150,
  irrigationAcres = 4,
  cropType = 'Paddy / Vegetable',
  waterSource = 'Borewell',
  existingPumpType = 'Diesel'
}) {
  const depthMeters = Number(depthFeet) * 0.3048;
  const acres = Number(irrigationAcres);

  // Determine pump HP based on total dynamic head
  let recommendedHP = 3;
  let solarArrayKWp = 3.0;

  if (depthFeet <= 100) {
    recommendedHP = acres > 3 ? 3 : 2;
    solarArrayKWp = recommendedHP === 3 ? 3.0 : 2.0;
  } else if (depthFeet <= 200) {
    recommendedHP = acres > 5 ? 7.5 : 5;
    solarArrayKWp = recommendedHP === 7.5 ? 7.5 : 4.8;
  } else if (depthFeet <= 350) {
    recommendedHP = 7.5;
    solarArrayKWp = 7.5;
  } else {
    recommendedHP = 10;
    solarArrayKWp = 10.0;
  }

  // MNRE Benchmark Costs: ~₹55,000 to ₹65,000 per HP for solar pump system
  const benchmarkCostPerHP = 60000;
  const totalProjectCostINR = recommendedHP * benchmarkCostPerHP;

  // PM-KUSUM Subsidy Architecture:
  // Central Govt Subsidy: 30% (or 50% for NE/Hilly states)
  // State Govt Subsidy: 30%
  // Bank Loan / NABARD: 30%
  // Farmer Contribution: 10%
  const centralSubsidyINR = Math.round(totalProjectCostINR * 0.30);
  const stateSubsidyINR = Math.round(totalProjectCostINR * 0.30);
  const bankLoanINR = Math.round(totalProjectCostINR * 0.30);
  const farmerPayableINR = Math.round(totalProjectCostINR * 0.10);

  // Daily water discharge in sunshine hours (average 6 peak sun hours)
  // Approximate 2000 to 3500 liters per hour per HP depending on head
  const dischargeLitersPerHour = Math.round((solarArrayKWp * 1000 * 0.50 * 3600) / (depthMeters * 9.81));
  const dailyDischargeLiters = Math.round(dischargeLitersPerHour * 6.5);

  // Operational Savings Calculation
  // Diesel pump consumes ~1.2 liters diesel per hour * 6 hours * 180 watering days/yr * ₹92/liter
  const annualDieselCostINR = existingPumpType === 'Diesel'
    ? Math.round(recommendedHP * 0.35 * 6 * 160 * 92) // ~₹30,000 - ₹80,000/yr
    : Math.round(recommendedHP * 0.746 * 6 * 160 * 7.5); // Grid electricity cost

  const paybackPeriodYears = +(farmerPayableINR / (annualDieselCostINR || 35000)).toFixed(1);
  const co2MitigatedTonnesPerYear = +((annualDieselCostINR / 92) * 2.68 / 1000).toFixed(2); // 2.68 kg CO2 per liter diesel

  return {
    inputs: { depthFeet, depthMeters: +depthMeters.toFixed(1), irrigationAcres: acres, cropType, waterSource, existingPumpType },
    sizing: {
      recommendedHP,
      pumpType: depthFeet > 60 ? 'Submersible AC/DC Solar Pump' : 'Surface Monoblock Solar Pump',
      solarArrayKWp,
      solarPanelsCount: Math.round(solarArrayKWp * 1000 / 335), // 335W polycrystalline panels
      dischargeLitersPerHour,
      dailyDischargeLiters
    },
    financials: {
      totalProjectCostINR,
      centralSubsidyINR, // 30%
      stateSubsidyINR,   // 30%
      bankLoanINR,       // 30%
      farmerPayableINR,  // 10%
      subsidyPercentage: 60,
      annualDieselSavingsINR: annualDieselCostINR,
      paybackPeriodYears,
      warrantyYears: 5,
      solarPanelLifeYears: 25
    },
    environmentalImpact: {
      co2MitigatedTonnesPerYear,
      equivalentTreesPlanted: Math.round(co2MitigatedTonnesPerYear * 45)
    }
  };
}

// POST /api/solar-pump/calculate
router.post('/calculate', (req, res) => {
  try {
    const { depthFeet = 150, irrigationAcres = 4, cropType = 'Paddy', waterSource = 'Borewell', existingPumpType = 'Diesel' } = req.body || {};
    const result = calculateSolarPumpSizing({ depthFeet, irrigationAcres, cropType, waterSource, existingPumpType });
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Solar pump calculation failed', details: err.message });
  }
});

module.exports = router;
