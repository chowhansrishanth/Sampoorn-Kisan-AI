const fs = require('fs');
const path = require('path');

async function testAll() {
  const base = 'http://127.0.0.1:5000';
  const endpoints = [
    { method: 'GET', path: '/health' },
    { method: 'GET', path: '/api/health' },
    { method: 'GET', path: '/api/ai/health' },
    { method: 'GET', path: '/api/fl/status' },
    { method: 'GET', path: '/api/market/weather?lat=17.385&lon=78.4867' },
    { method: 'GET', path: '/api/market/mandi?commodity=rice&state=Telangana' },
    { method: 'POST', path: '/api/crop/recommend', body: { N: 90, P: 42, K: 43, temperature: 25.5, humidity: 75, ph: 6.5, rainfall: 200 } },
    { method: 'POST', path: '/api/crop/yield', body: { crop: 'Rice', area_hectares: 2.5, N: 90, P: 42, K: 43, rainfall: 200 } },
    { method: 'POST', path: '/api/crop/fertilizer', body: { crop: 'Rice', N: 90, P: 42, K: 43, soil_type: 'Alluvial' } },
    { method: 'POST', path: '/api/disease/diagnose', body: { cropType: 'Tomato' } },
    { method: 'GET', path: '/api/disease/catalog' },
    { method: 'GET', path: '/api/knowledge/categories' },
    { method: 'GET', path: '/api/location/reverse-geocode?lat=17.385&lon=78.4867' },
    { method: 'POST', path: '/api/location/parse-manual', body: { addressText: 'Warangal, Telangana' } },
    { method: 'GET', path: '/api/benchmark/metrics' },
    { method: 'GET', path: '/api/calendar/schedules' },
    { method: 'GET', path: '/api/alerts' },
    { method: 'GET', path: '/api/admin/stats' },
    { method: 'POST', path: '/api/irrigation/schedule', body: { crop: 'Tomato', area_acres: 2 } },
    { method: 'GET', path: '/api/market-forecast/trends?commodity=Chilli' },
    { method: 'POST', path: '/api/rotation/simulate', body: { current_crop: 'Paddy', season: 'Kharif' } },
    { method: 'GET', path: '/api/ledger/entries' },
    { method: 'GET', path: '/api/satellite/ndvi?lat=17.385&lon=78.4867' },
    { method: 'POST', path: '/api/yield/forecast', body: { crop: 'Wheat', acres: 2 } },
    { method: 'GET', path: '/api/trace/batches' },
    { method: 'GET', path: '/api/hire/equipment' },
    { method: 'POST', path: '/api/soil-health/analyze', body: { N: 90, P: 42, K: 43, ph: 6.5 } },
    { method: 'POST', path: '/api/tank-mix/check', body: { chemicals: ['Mancozeb', 'Chlorpyrifos'] } },
    { method: 'GET', path: '/api/gdd/radar?crop=Maize&sowing_date=2026-06-01' },
    { method: 'GET', path: '/api/livestock/advisory' },
    { method: 'GET', path: '/api/organic/practices' },
    { method: 'POST', path: '/api/solar-pump/sizing', body: { water_depth_ft: 150, land_acres: 3 } },
    { method: 'POST', path: '/api/insurance/calculator', body: { crop: 'Cotton', sum_insured: 50000 } },
    { method: 'POST', path: '/api/carbon/estimate', body: { farm_acres: 5, practices: ['no-till', 'cover-crops'] } },
    { method: 'POST', path: '/api/orchestrate-farm-report', body: { farmer_id: 'test', soil_data: { N: 90, P: 42, K: 43, ph: 6.5, rainfall: 200 }, location: { lat: 17.385, lon: 78.4867 } } }
  ];

  const results = [];
  for (const ep of endpoints) {
    try {
      const opts = { method: ep.method, headers: {} };
      if (ep.body) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(ep.body);
      }
      const res = await fetch(base + ep.path, opts);
      const data = await res.json().catch(() => null);
      results.push({
        method: ep.method,
        path: ep.path,
        status: res.status,
        ok: res.ok,
        hasData: !!data,
        dataSummary: data ? (typeof data === 'object' ? Object.keys(data).slice(0, 5).join(', ') : String(data).slice(0, 30)) : 'none'
      });
    } catch (e) {
      results.push({
        method: ep.method,
        path: ep.path,
        status: 'ERROR',
        ok: false,
        error: e.message
      });
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

testAll();
