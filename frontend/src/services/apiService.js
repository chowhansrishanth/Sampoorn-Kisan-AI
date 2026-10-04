/*
 * apiService.js
 * Centralized Axios API service layer for Sampoorn Kisan AI frontend.
 * Uses unified api client with JWT interceptor and standard error formatting.
 */

import api, { getApiErrorMessage } from '../api/client';

// Helper to handle responses and errors uniformly.
const handleResponse = (promise) =>
  promise
    .then((res) => res.data)
    .catch((err) => {
      const msg = getApiErrorMessage(err);
      console.warn('API call notice:', msg);
      throw err;
    });

/**
 * Get crop recommendation and SHAP/LIME feature importance based on soil parameters.
 */
export const getCropRecommendation = (payload) =>
  handleResponse(api.post('/api/crop/recommend', payload));

/**
 * Get estimated crop yield.
 */
export const getYieldPrediction = (payload) =>
  handleResponse(api.post('/api/crop/yield', payload));

/**
 * Get tailored fertilizer recommendation schedule.
 */
export const getFertilizerRecommendation = (payload) =>
  handleResponse(api.post('/api/crop/fertilizer', payload));

/**
 * Compare two or more crops side-by-side with dynamic land size
 */
export const compareCropsApi = (payload) =>
  handleResponse(api.post('/api/crop/compare', payload));

/**
 * Upload leaf image for disease diagnosis with Grad-CAM heatmap visualization.
 */
export const uploadDiseaseImage = (imageFile, cropType = "Tomato", symptomsText = "") => {
  const formData = new FormData();
  if (imageFile) {
    formData.append('image', imageFile);
  }
  formData.append('cropType', cropType);
  formData.append('symptomsText', symptomsText);
  return handleResponse(
    api.post('/api/disease/diagnose', formData)
  );
};

/**
 * Multi-Agent Chat API
 */
export const sendAgentChat = (message, crop = "Rice", language = "en") =>
  handleResponse(api.post('/api/agents/chat', { message, crop, language }));

/**
 * Multi-Agent Holistic Farm Plan Orchestrator
 */
export const orchestrateFarmPlan = (payload) =>
  handleResponse(api.post('/api/agents/orchestrate', payload));

/**
 * Get live weather forecast.
 */
export const getWeatherForecast = (lat = 17.3850, lon = 78.4867) =>
  handleResponse(api.get('/api/market/weather', { params: { lat, lon } }));

/**
 * Get live APMC Mandi commodity prices.
 */
export const getMandiPrices = (crop = "Rice", state = "Telangana") =>
  handleResponse(api.get('/api/market/mandi', { params: { crop, state } }));

/**
 * Get Federated Learning network status and Differential Privacy metrics.
 */
export const getFederatedLearningStatus = () =>
  handleResponse(api.get('/api/fl/status'));

export default api;
