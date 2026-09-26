'use strict';
/**
 * Farmer Alert Service
 * Generates weather-based and seasonal pest alerts for farmers.
 * Pluggable SMS provider via TWILIO_ENABLED env flag.
 */
const path = require('path');
const fs = require('fs');

const ALERTS_FILE = path.join(process.env.DATA_DIR || path.join(__dirname, '../data'), 'alerts_store.json');

// In-memory alerts map: farmerId -> [alert, ...]
let alertsStore = {};
let alertsStoreLoaded = false;

function loadAlerts() {
  if (alertsStoreLoaded) return;
  try {
    if (fs.existsSync(ALERTS_FILE)) {
      alertsStore = JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'));
    }
  } catch { alertsStore = {}; }
  alertsStoreLoaded = true;
}

function saveAlerts() {
  try { fs.writeFileSync(ALERTS_FILE, JSON.stringify(alertsStore, null, 2)); } catch {}
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Pest calendar: month (1-12) -> alert
const PEST_CALENDAR = {
  6:  [{ severity: 'warning', title: 'Kharif Crop Alert', message: 'June: Monitor nursery for stem borer and blast in paddy. Apply preventive spray.' }],
  7:  [{ severity: 'critical', title: 'Monsoon Pest Alert', message: 'July: High humidity increases risk of blast, BPH and gall midge in Kharif paddy. Scout weekly.' }],
  8:  [{ severity: 'warning', title: 'Cotton Bollworm Alert', message: 'August: Pink bollworm and American bollworm activity peaks. Check pheromone traps daily.' }],
  9:  [{ severity: 'advisory', title: 'Harvest Season Advisory', message: 'September: Post-harvest Aflatoxin risk high in groundnut. Dry produce quickly to <8% moisture.' }],
  11: [{ severity: 'advisory', title: 'Rabi Sowing Advisory', message: 'November: Optimal window for wheat and mustard sowing. Ensure certified seed is treated before sowing.' }],
  12: [{ severity: 'warning', title: 'Frost Risk Warning', message: 'December: Night temperatures may drop. Protect tomato, chili, and potato with mulching or micro-jets.' }],
  2:  [{ severity: 'advisory', title: 'Rabi Harvest Advisory', message: 'February: Wheat heading stage — critical irrigation and aphid watch needed.' }],
};

/**
 * Generate alerts for a farmer based on weather data and current month.
 */
function generateAlerts(farmerId, weatherData) {
  loadAlerts();
  const now = Date.now();
  const month = new Date().getMonth() + 1;
  const existing = alertsStore[farmerId] || [];

  // Prune dismissed and expired alerts (older than 24h)
  const active = existing.filter(a => !a.dismissed && now - a.createdAt < 86_400_000);

  const newAlerts = [];

  // Weather-based alerts
  if (weatherData) {
    const { temperature, precipitation } = weatherData;

    if (temperature !== undefined && temperature > 40) {
      const key = 'heat_stress';
      if (!active.find(a => a.key === key)) {
        newAlerts.push({ id: generateId(), key, severity: 'critical', title: 'Heat Stress Alert', message: 'Current temperature is ' + temperature + '\u00B0C \u2014 critical heat stress risk for crops. Irrigate early morning and apply mulch immediately.', createdAt: now });
      }
    }

    if (precipitation !== undefined && precipitation > 50) {
      const key = 'flood_risk';
      if (!active.find(a => a.key === key)) {
        newAlerts.push({ id: generateId(), key, severity: 'critical', title: 'Heavy Rain / Flood Risk', message: 'Rainfall forecast of ' + precipitation + 'mm detected. Ensure field drainage channels are open. Postpone chemical sprays.', createdAt: now });
      }
    }
  }

  // Seasonal pest alerts
  const pestAlerts = PEST_CALENDAR[month] || [];
  for (const pa of pestAlerts) {
    const key = pa.title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').substring(0, 40);
    if (!active.find(a => a.key === key)) {
      newAlerts.push({ id: generateId(), key, ...pa, createdAt: now });
    }
  }

  alertsStore[farmerId] = [...active, ...newAlerts];
  if (newAlerts.length > 0) saveAlerts();
  return alertsStore[farmerId];
}

function getAlerts(farmerId) {
  loadAlerts();
  const now = Date.now();
  const existing = alertsStore[farmerId] || [];
  return existing.filter(a => !a.dismissed && now - a.createdAt < 86_400_000);
}

function dismissAlert(farmerId, alertId) {
  loadAlerts();
  const existing = alertsStore[farmerId] || [];
  const alert = existing.find(a => a.id === alertId);
  if (alert) { alert.dismissed = true; saveAlerts(); return true; }
  return false;
}

module.exports = { generateAlerts, getAlerts, dismissAlert };
