'use strict';

const history = require('./marketHistory');
const Observation = require('../models/MarketObservation');
const { isDbOperational } = require('../config/db');

const COMMODITY_BASE_PRICES = {
  Tomato: 2600,
  Onion: 2150,
  Potato: 1450,
  Cotton: 7550,
  Wheat: 2425,
  Paddy: 2320,
  Chili: 14500,
  Soybean: 4892,
  Maize: 2225,
  Mustard: 5650,
  Groundnut: 6780
};

const REGIONAL_MANDI_NETWORK = {
  Telangana: [
    { mandiName: "Warangal APMC", district: "Warangal", distanceKm: 35, priceOffset: +180, cessPercent: 1.0, loadingCharges: 150 },
    { mandiName: "Bowenpally Market Yard", district: "Hyderabad", distanceKm: 85, priceOffset: +260, cessPercent: 1.0, loadingCharges: 200 },
    { mandiName: "Khammam Mandi", district: "Khammam", distanceKm: 70, priceOffset: +80, cessPercent: 1.0, loadingCharges: 180 },
    { mandiName: "Nizamabad APMC", district: "Nizamabad", distanceKm: 120, priceOffset: -50, cessPercent: 1.0, loadingCharges: 160 },
    { mandiName: "Suryapet Local Mandi", district: "Suryapet", distanceKm: 20, priceOffset: -90, cessPercent: 1.0, loadingCharges: 120 }
  ],
  "Andhra Pradesh": [
    { mandiName: "Guntur Mirchi Yard", district: "Guntur", distanceKm: 25, priceOffset: +280, cessPercent: 1.0, loadingCharges: 180 },
    { mandiName: "Vijayawada APMC", district: "Krishna", distanceKm: 60, priceOffset: +150, cessPercent: 1.0, loadingCharges: 170 },
    { mandiName: "Kurnool Commercial Market", district: "Kurnool", distanceKm: 90, priceOffset: +40, cessPercent: 1.0, loadingCharges: 150 },
    { mandiName: "Tirupati Mandi", district: "Chittoor", distanceKm: 140, priceOffset: -60, cessPercent: 1.0, loadingCharges: 190 }
  ],
  Maharashtra: [
    { mandiName: "Lasalgaon APMC", district: "Nashik", distanceKm: 30, priceOffset: +250, cessPercent: 1.05, loadingCharges: 200 },
    { mandiName: "Vashi APMC Market", district: "Navi Mumbai", distanceKm: 160, priceOffset: +420, cessPercent: 1.05, loadingCharges: 300 },
    { mandiName: "Pune Gultekdi Market", district: "Pune", distanceKm: 80, priceOffset: +210, cessPercent: 1.05, loadingCharges: 220 },
    { mandiName: "Akola Cotton Yard", district: "Akola", distanceKm: 50, priceOffset: +90, cessPercent: 1.05, loadingCharges: 180 }
  ],
  Punjab: [
    { mandiName: "Khanna Grain Market", district: "Ludhiana", distanceKm: 40, priceOffset: +160, cessPercent: 1.5, loadingCharges: 200 },
    { mandiName: "Ludhiana APMC", district: "Ludhiana", distanceKm: 25, priceOffset: +110, cessPercent: 1.5, loadingCharges: 180 },
    { mandiName: "Bathinda Mandi", district: "Bathinda", distanceKm: 80, priceOffset: +50, cessPercent: 1.5, loadingCharges: 170 },
    { mandiName: "Jalandhar Cantt Yard", district: "Jalandhar", distanceKm: 65, priceOffset: +70, cessPercent: 1.5, loadingCharges: 180 }
  ]
};

async function predictMandiPrices(commodity, location, market) {
  if (!isDbOperational()) {
    return {
      ...history.forecast([]),
      commodity,
      reason: 'Market history storage is unavailable. No prices or forecasts have been generated.'
    };
  }
  const filter = { crop: commodity };
  if (location) filter.location = location;
  if (market) filter.market = market;
  const data = await Observation.find(filter).sort({ date: -1 }).limit(365).lean().maxTimeMS(3000);
  return { ...history.forecast(data), commodity };
}

function calculateArbitrageMatrix({ quotes, quantityQuintals = 20, transportCostPerKm = 18, commodity = 'Tomato', state = 'Telangana' }) {
  const valid = n => typeof n === 'number' && Number.isFinite(n) && n >= 0;
  const qty = Number(quantityQuintals);
  const freight = Number(transportCostPerKm);

  if (!valid(qty) || qty === 0 || !valid(freight)) {
    throw Object.assign(new Error('Valid quantity and transport cost are required.'), { status: 400 });
  }

  let effectiveQuotes = quotes;
  let provenance = 'USER_PROVIDED_QUOTES_AND_COSTS';

  if (!Array.isArray(effectiveQuotes) || effectiveQuotes.length < 2) {
    // Generate regional APMC quotes for this commodity & state
    const basePrice = COMMODITY_BASE_PRICES[commodity] || 2500;
    const network = REGIONAL_MANDI_NETWORK[state] || REGIONAL_MANDI_NETWORK['Telangana'];
    const today = new Date().toISOString().slice(0, 10);

    effectiveQuotes = network.map(m => ({
      mandiName: m.mandiName,
      district: m.district,
      date: today,
      pricePerQuintal: Math.max(1000, basePrice + m.priceOffset),
      distanceKm: m.distanceKm,
      loadingCharges: m.loadingCharges || 150,
      cessPercent: m.cessPercent || 1.0
    }));
    provenance = 'REGIONAL_APMC_NETWORK_BENCHMARKS';
  }

  const comparison = effectiveQuotes.map(q => {
    if (!q || !q.mandiName || !q.date || !['pricePerQuintal', 'distanceKm', 'loadingCharges', 'cessPercent'].every(k => valid(q[k]))) {
      throw Object.assign(new Error('Each quote needs name, date, price, distance, loading cost and cess.'), { status: 400 });
    }
    const grossRevenue = q.pricePerQuintal * qty;
    const transportCost = q.distanceKm * freight;
    const apmcCess = (grossRevenue * q.cessPercent) / 100;
    const netProfit = grossRevenue - transportCost - apmcCess - q.loadingCharges;
    return {
      ...q,
      quotedModalPrice: q.pricePerQuintal,
      grossRevenue,
      transportCost,
      apmcCess,
      netProfit,
      effectivePricePerQuintal: Math.round(netProfit / qty)
    };
  }).sort((a, b) => b.netProfit - a.netProfit);

  return {
    status: 'CALCULATED',
    commodity,
    state,
    quantityQuintals: qty,
    transportCostPerKm: freight,
    bestMandi: comparison[0] || null,
    comparison,
    provenance,
    limitations: ['Net sale return excludes cultivation and storage costs. Real-time APMC auction gate quotes may fluctuate daily.']
  };
}

module.exports = {
  predictMandiPrices,
  calculateArbitrageMatrix,
  COMMODITY_BASE_PRICES,
  REGIONAL_MANDI_NETWORK
};
