'use strict';
/**
 * Farm-to-Fork Traceability Engine & QR Batch Passport Generator
 * Creates verifiable crop batch records with full chain-of-custody from
 * sowing → harvest → storage → transport → market, suitable for export
 * certification, organic premium labelling, and FPO compliance.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TRACE_FILE = path.join(process.env.DATA_DIR || path.join(__dirname, '../data'), 'traceability_batches.json');
let batchStore = {};

function loadBatches() {
  try {
    if (fs.existsSync(TRACE_FILE)) {
      batchStore = JSON.parse(fs.readFileSync(TRACE_FILE, 'utf8'));
    }
  } catch { batchStore = {}; }
}

function saveBatches() {
  try {
    const dir = path.dirname(TRACE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(TRACE_FILE, JSON.stringify(batchStore, null, 2), 'utf8');
  } catch (err) { console.warn('Traceability save error:', err.message); }
}

function generateBatchId(farmerName, crop) {
  const slug = `${farmerName.replace(/\s+/g, '').toUpperCase().slice(0, 4)}-${crop.slice(0, 3).toUpperCase()}`;
  const hash = crypto.randomBytes(8).toString('hex').toUpperCase();
  return `SKF-${slug}-${hash}`;
}

function createBatch({ farmerName, farmerId, crop, landAcres, harvestDateExpected, soilType, irrigationType, pesticidesUsed, certifications, location, grade }) {
  loadBatches();

  const batchId = generateBatchId(farmerName, crop);
  const qrPayload = `https://sampoornkisan.ai/trace/${batchId}`;

  const batch = {
    batchId,
    qrPayload,
    status: 'SOWING_REGISTERED',
    farmerName,
    farmerId: farmerId || 'guest',
    crop,
    landAcres: Number(landAcres) || 1.0,
    location: location || 'Telangana, India',
    grade: grade || 'Grade A',
    soilType: soilType || 'black',
    irrigationType: irrigationType || 'drip',
    certifications: certifications || ['Standard'],
    pesticidesUsed: pesticidesUsed || [],
    harvestDateExpected: harvestDateExpected || new Date(Date.now() + 100 * 86400000).toISOString().split('T')[0],
    timeline: [
      {
        stage: 'Land Preparation & Sowing',
        date: new Date().toISOString().split('T')[0],
        actor: farmerName,
        details: `${crop} sown on ${landAcres} acres at ${location || 'Telangana, India'}. Soil: ${soilType || 'Black'}. Irrigation: ${irrigationType || 'Drip'}.`,
        status: 'COMPLETE',
        geoTag: { lat: 17.38, lon: 78.48 },
      },
    ],
    createdAt: new Date().toISOString(),
  };

  batchStore[batchId] = batch;
  saveBatches();
  return batch;
}

function addCheckpoint(batchId, { stage, actor, details, geoTag }) {
  loadBatches();
  if (!batchStore[batchId]) throw new Error(`Batch ${batchId} not found`);

  const statusMap = {
    'Crop Scouting / Field Inspection': 'IN_PROGRESS',
    'Pesticide / Fertilizer Application': 'IN_PROGRESS',
    'Harvest': 'HARVESTED',
    'Post-Harvest Cleaning & Grading': 'GRADED',
    'Cold Storage / Warehouse Entry': 'IN_STORAGE',
    'Quality Lab Test': 'TESTED',
    'Transport to APMC / Buyer': 'IN_TRANSIT',
    'Market Sale / Export Dispatch': 'SOLD',
  };

  batchStore[batchId].timeline.push({
    stage,
    date: new Date().toISOString().split('T')[0],
    actor: actor || 'Farmer',
    details,
    status: statusMap[stage] || 'IN_PROGRESS',
    geoTag: geoTag || { lat: 17.38, lon: 78.48 },
  });

  batchStore[batchId].status = statusMap[stage] || batchStore[batchId].status;
  saveBatches();
  return batchStore[batchId];
}

function getBatch(batchId) {
  loadBatches();
  return batchStore[batchId] || null;
}

function getFarmerBatches(farmerId) {
  loadBatches();
  return Object.values(batchStore).filter((b) => b.farmerId === farmerId);
}

// Default sample batches for demo
function getSampleBatches(farmerId) { return getFarmerBatches(farmerId); }

module.exports = { createBatch, addCheckpoint, getBatch, getFarmerBatches, getSampleBatches };
