'use strict';
/**
 * Custom Hiring Center (CHC) Machinery & Drone Spray Rental Marketplace
 * Database of agricultural machinery rates, availability, booking engine,
 * and drone spray dispatch with coverage area and cost estimation.
 */

// CHC machinery catalog with per-acre rental rates
const MACHINERY_CATALOG = [
  { id: 'tractor_55hp', name: 'Tractor (55 HP) with Rotavator', category: 'Land Preparation', ratePerAcre: 900, ratePerHour: 600, minHours: 2, available: true, distKm: 4, operator: 'Srinivas Reddy CHC', contactPhone: '94409-XXXXX', description: 'Suitable for deep ploughing, rotavation, and ridge formation. Max 3 acres/day.' },
  { id: 'paddy_transplanter', name: 'Paddy Transplanter (8-row Self-Propelled)', category: 'Sowing & Planting', ratePerAcre: 1200, ratePerHour: 800, minHours: 3, available: true, distKm: 8, operator: 'State CHC Hub', contactPhone: '94900-XXXXX', description: 'ICAR recommended mat-type nursery system. 3-4 acres/day. Saves 60% labor.' },
  { id: 'seed_drill', name: 'Zero-Till Seed-cum-Fertilizer Drill (9-Tyne)', category: 'Sowing & Planting', ratePerAcre: 700, ratePerHour: 500, minHours: 2, available: true, distKm: 6, operator: 'Kisan CHC Cooperative', contactPhone: '98760-XXXXX', description: 'Simultaneous sowing + basal fertilizer placement. 5 acres/day capacity.' },
  { id: 'combine_harvester', name: 'Combine Harvester (120 HP Axial Flow)', category: 'Harvesting', ratePerAcre: 1800, ratePerHour: 1400, minHours: 4, available: true, distKm: 12, operator: 'Agro Harvest Services', contactPhone: '97000-XXXXX', description: 'Multi-crop harvester (wheat, paddy, soybean). 8-10 acres/day. GPS-enabled.' },
  { id: 'drone_spray_10l', name: 'Agricultural Drone (10L Tank DJI Agras)', category: 'Drone Spray Services', ratePerAcre: 400, ratePerHour: 2000, minHours: 1, available: true, distKm: 3, operator: 'SkyAgri Drone Services', contactPhone: '96666-XXXXX', description: '10L capacity precision sprayer. 10-12 acres/hr. GPS obstacle avoidance. Pesticide / nano-urea spray.' },
  { id: 'drone_spray_16l', name: 'Agricultural Drone (16L Tank XAG P40)', category: 'Drone Spray Services', ratePerAcre: 500, ratePerHour: 2800, minHours: 1, available: true, distKm: 10, operator: 'FutureFarm Drone Co.', contactPhone: '94400-XXXXX', description: '16L heavy-duty spray drone. Ideal for tall crops (sugarcane, cotton). DGCA certified operator.' },
  { id: 'mini_tractor_25hp', name: 'Mini Tractor (25 HP) with Cultivator', category: 'Inter-Cultivation', ratePerAcre: 550, ratePerHour: 380, minHours: 2, available: true, distKm: 2, operator: 'Local Farmer Cooperative', contactPhone: '90000-XXXXX', description: 'Compact tractor for inter-row weeding and earthing-up in vegetables & cotton.' },
  { id: 'power_sprayer', name: 'Boom Sprayer (400L Tractor-Mounted)', category: 'Pest Management', ratePerAcre: 280, ratePerHour: 350, minHours: 3, available: true, distKm: 5, operator: 'Agri Sprayer Rentals', contactPhone: '95555-XXXXX', description: '400L boom sprayer. 4-5 acres/hr. Uniform canopy coverage. Suitable for pesticide & fungicide.' },
];

function getMachineryCatalog(category) {
  if (category && category !== 'All') {
    return MACHINERY_CATALOG.filter((m) => m.category === category);
  }
  return MACHINERY_CATALOG;
}

function estimateJobCost({ machineId, acres, hours }) {
  const machine = MACHINERY_CATALOG.find((m) => m.id === machineId);
  if (!machine) throw new Error(`Machine ${machineId} not found`);

  const acresCost = (acres || 0) * machine.ratePerAcre;
  const hoursCost = Math.max(hours || 0, machine.minHours) * machine.ratePerHour;
  // Use the higher of acres-based or hours-based calculation
  const estimatedCost = Math.max(acresCost, hoursCost);
  const fuelSurcharge = Math.round(machine.distKm * 18); // ₹18/km transport

  return {
    machine: machine.name,
    operator: machine.operator,
    contactPhone: machine.contactPhone,
    acres,
    estimatedHours: hours || Math.ceil(acres / 4),
    rentalCost: estimatedCost,
    fuelSurcharge,
    totalEstimate: estimatedCost + fuelSurcharge,
    perAcreEffectiveCost: Math.round((estimatedCost + fuelSurcharge) / Math.max(acres, 1)),
    laborSavingPercent: machine.category === 'Drone Spray Services' ? 85 : machine.category === 'Harvesting' ? 90 : 60,
    timeSavingDays: machine.category === 'Harvesting' ? Math.ceil(acres / 8) : null,
  };
}

function getCategories() {
  return [...new Set(MACHINERY_CATALOG.map((m) => m.category))];
}

module.exports = { getMachineryCatalog, estimateJobCost, getCategories, MACHINERY_CATALOG };
