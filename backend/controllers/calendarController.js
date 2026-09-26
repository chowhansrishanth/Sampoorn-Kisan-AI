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

// GET /api/calendar/crops — list available crops
exports.listCrops = (req, res) => {
  const data = getCalendarData();
  const crops = Object.keys(data).map(key => ({
    key,
    name: data[key].name,
    season: data[key].season,
  }));
  res.json({ success: true, crops });
};

// GET /api/calendar/:crop — full 12-month schedule
exports.getCropCalendar = (req, res) => {
  const { crop } = req.params;
  const data = getCalendarData();
  const cropKey = Object.keys(data).find(k => k.toLowerCase() === crop.toLowerCase());
  if (!cropKey) {
    return res.status(404).json({ success: false, error: 'Crop not found', available: Object.keys(data) });
  }
  res.json({ success: true, crop: cropKey, ...data[cropKey] });
};

// GET /api/calendar/:crop/:month — tasks for a specific month
exports.getMonthTasks = (req, res) => {
  const { crop, month } = req.params;
  const data = getCalendarData();
  const cropKey = Object.keys(data).find(k => k.toLowerCase() === crop.toLowerCase());
  if (!cropKey) {
    return res.status(404).json({ success: false, error: 'Crop not found' });
  }
  const monthKey = Object.keys(data[cropKey].months).find(m => m.toLowerCase() === month.toLowerCase());
  if (!monthKey) {
    return res.status(404).json({ success: false, error: 'Month not found' });
  }
  res.json({ success: true, crop: cropKey, month: monthKey, tasks: data[cropKey].months[monthKey] });
};
