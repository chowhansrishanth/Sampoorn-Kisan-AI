const aiProvider = require('./aiProvider');
const fs = require('node:fs');

const registry = [
  { id: 'general-chat', purpose: 'GENERAL_CHAT', provider: aiProvider.provider, capabilities: ['conversation', 'agriculture-reasoning'] },
  { id: 'crop-model', purpose: 'CROP_RECOMMENDATION', provider: 'local-ml', capabilities: ['crop-recommendation'], configured: Boolean(process.env.CROP_MODEL_PATH) },
  { id: 'disease-model', purpose: 'DISEASE_DIAGNOSIS', provider: 'local-ml', capabilities: ['image-diagnosis'], configured: Boolean(process.env.VISION_MODEL_PATH) },
  { id: 'weather', purpose: 'WEATHER_ANALYSIS', provider: 'configured-weather-provider', capabilities: ['forecast', 'agromet-advisory'] },
  { id: 'market', purpose: 'MARKET_ANALYSIS', provider: 'configured-market-provider', capabilities: ['mandi-prices', 'trends'] },
  { id: 'knowledge', purpose: 'KNOWLEDGE_RETRIEVAL', provider: 'local-knowledge', capabilities: ['schemes', 'agronomy'] }
];

function status(item) {
  if (item.configured === false) return 'NOT_CONFIGURED';
  if (item.id === 'general-chat' && !aiProvider.hasValidApiKey) return 'DEGRADED';
  return 'AVAILABLE';
}
function checkpointStatus(path) {
  if (!path) return 'NOT_CONFIGURED';
  try { return fs.existsSync(path) && fs.statSync(path).isFile() ? 'UNVERIFIED' : 'INVALID'; } catch { return 'LOAD_FAILED'; }
}

function getHealth() {
  return registry.map(item => ({ ...item, configured: item.configured !== false, health: item.id === 'crop-model' ? checkpointStatus(process.env.CROP_MODEL_PATH) : item.id === 'disease-model' ? checkpointStatus(process.env.VISION_MODEL_PATH) : status(item), timeoutMs: item.id === 'general-chat' ? 15000 : 5000 }));
}

module.exports = { getHealth, getByPurpose: purpose => getHealth().find(item => item.purpose === purpose) };
