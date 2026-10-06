'use strict';
// Crop Calendar Controller — Serves ICAR-aligned month-by-month agronomic tasks
const path = require('path');
const fs = require('fs');

let calendarData = null;
const getCalendarData = () => {
  if (!calendarData) {
    try {
      const file = path.join(__dirname, '../data/cropCalendar.json');
      calendarData = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
    } catch {
      calendarData = {};
    }
  }
  return calendarData;
};

// GET /api/calendar/crops — list available crops with metadata
exports.listCrops = (req, res) => {
  const data = getCalendarData();
  const crops = Object.keys(data).map(key => ({
    key,
    name: data[key].name || key,
    category: data[key].category || 'Crops',
    season: data[key].season || 'All seasons',
    defaultDurationDays: data[key].defaultDurationDays || 120,
    durationMinDays: data[key].durationMinDays || 90,
    durationMaxDays: data[key].durationMaxDays || 150
  }));
  res.json({ success: true, crops });
};

// GET /api/calendar/:crop — full 12-month schedule & comprehensive agronomic requirements
exports.getCropCalendar = (req, res) => {
  const { crop } = req.params;
  const data = getCalendarData();
  const cleanQuery = String(crop || '').toLowerCase().trim();

  // Robust fuzzy matching: match exact key, lowercase key, display name, or substring
  const cropKey = Object.keys(data).find(k => {
    const kLow = k.toLowerCase();
    const nameLow = (data[k].name || '').toLowerCase();
    return kLow === cleanQuery || 
           nameLow === cleanQuery || 
           cleanQuery.includes(kLow) || 
           kLow.includes(cleanQuery) ||
           nameLow.includes(cleanQuery) ||
           cleanQuery.includes(nameLow);
  });

  if (!cropKey) {
    return res.status(404).json({ success: false, error: 'Crop not found', available: Object.keys(data) });
  }

  res.json({ success: true, crop: cropKey, ...data[cropKey] });
};

// GET /api/calendar/:crop/:month — tasks for a specific month
exports.getMonthTasks = (req, res) => {
  const { crop, month } = req.params;
  const data = getCalendarData();
  const cleanQuery = String(crop || '').toLowerCase().trim();

  const cropKey = Object.keys(data).find(k => {
    const kLow = k.toLowerCase();
    const nameLow = (data[k].name || '').toLowerCase();
    return kLow === cleanQuery || nameLow === cleanQuery || cleanQuery.includes(kLow) || kLow.includes(cleanQuery);
  });

  if (!cropKey) {
    return res.status(404).json({ success: false, error: 'Crop not found' });
  }

  const monthKey = Object.keys(data[cropKey].months || {}).find(m => m.toLowerCase() === month.toLowerCase());
  if (!monthKey) {
    return res.status(404).json({ success: false, error: 'Month not found' });
  }

  res.json({ success: true, crop: cropKey, month: monthKey, tasks: data[cropKey].months[monthKey] });
};
