'use strict';
const express = require('express');
const router = express.Router();
const { calculateIrrigationSchedule, CROP_KC_DATABASE, SOIL_TAW_MM_PER_M, PUMP_CAPACITIES_LPH } = require('../services/irrigationService');
const weatherService = require('../services/weatherService');

// POST /api/irrigation/calculate — generate 7-day irrigation schedule
router.post('/calculate', async (req,res)=>{
 try {
  const input=req.body||{};
  const w=await weatherService.fetchOpenMeteoWeather(input.lat,input.lon);
  const weatherForecast=w.daily?.time?.map((date,i)=>({date,day:i===0?'Today':'Day '+(i+1),tempMax:w.daily.temperature_2m_max?.[i],tempMin:w.daily.temperature_2m_min?.[i],rainMm:w.daily.precipitation_sum?.[i],et0:w.daily.et0_fao_evapotranspiration?.[i]}));
  if(!weatherForecast?.length)return res.status(503).json({error:'Live daily weather is unavailable; no schedule generated.'});
  return res.json({success:true,...calculateIrrigationSchedule({...input,weatherForecast}),weatherSource:w.source,weatherRetrievedAt:w.retrievedAt});
 }catch(e){return res.status(e.status||503).json({success:false,error:e.status===400?e.message:'Irrigation guidance is unavailable. Retry when live weather is available.'});}
});

// GET /api/irrigation/metadata — supported crops, soils, and pump specifications
router.get('/metadata', (req, res) => {
  res.json({
    success: true,
    crops: Object.keys(CROP_KC_DATABASE),
    soils: Object.keys(SOIL_TAW_MM_PER_M),
    pumpCapacities: PUMP_CAPACITIES_LPH,
    stages: ['initial', 'vegetative', 'mid_season', 'late_season'],
    irrigationTypes: [
      { id: 'drip', name: 'Drip Irrigation (90% Efficiency)', efficiency: 90, waterSavingPercent: 45 },
      { id: 'sprinkler', name: 'Micro-Sprinkler (75% Efficiency)', efficiency: 75, waterSavingPercent: 25 },
      { id: 'flood', name: 'Traditional Furrow/Flood (60% Efficiency)', efficiency: 60, waterSavingPercent: 0 },
    ],
  });
});

module.exports = router;
