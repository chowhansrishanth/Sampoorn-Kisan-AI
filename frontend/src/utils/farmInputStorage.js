/**
 * Shared Agricultural Farm Input Store
 * Connects Crop Recommendation Tool and XAI Dashboard to guarantee
 * consistent, single-source-of-truth farm data without fake fallbacks.
 */

export const ACTIVE_FARM_INPUTS_KEY = "sampoorn_active_farm_inputs";

/**
 * Saves current verified/retrieved/manual farm input parameters.
 * @param {Object} data 
 */
export function saveActiveFarmInputs(data) {
  if (!data) return;
  try {
    const payload = {
      ...data,
      savedAt: Date.now()
    };
    localStorage.setItem(ACTIVE_FARM_INPUTS_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("Failed to persist farm inputs to storage:", err);
  }
}

/**
 * Loads current active farm inputs if available.
 * Returns null if empty or expired (> 7 days).
 * @returns {Object|null}
 */
export function loadActiveFarmInputs() {
  try {
    const raw = localStorage.getItem(ACTIVE_FARM_INPUTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    
    // Expire stale inputs older than 7 days
    if (parsed.savedAt && Date.now() - parsed.savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(ACTIVE_FARM_INPUTS_KEY);
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn("Failed to load active farm inputs from storage:", err);
    return null;
  }
}

/**
 * Clears stored active farm inputs.
 */
export function clearActiveFarmInputs() {
  try {
    localStorage.removeItem(ACTIVE_FARM_INPUTS_KEY);
  } catch (err) {
    console.warn("Failed to clear active farm inputs:", err);
  }
}

/**
 * Validates that an agricultural feature vector is complete and numerical.
 * Required fields: N, P, K, temperature, humidity, ph, rainfall.
 * 
 * @param {Object|null} npk 
 * @returns {boolean}
 */
export function areAgriculturalInputsValid(npk) {
  if (!npk || typeof npk !== "object") return false;
  const required = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"];
  return required.every((field) => {
    const val = npk[field];
    return val !== null && val !== undefined && val !== "" && Number.isFinite(Number(val));
  });
}
