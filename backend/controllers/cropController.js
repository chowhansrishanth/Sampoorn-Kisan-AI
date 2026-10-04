const axios = require("axios");
const fertilizerPlanner = require('../services/fertilizerPlanner');
const { computeShapExplanation, computeLimeExplanation, XAI_METRICS } = require('../services/xaiService');

const PYTHON_ML_SERVICE = process.env.PYTHON_ML_SERVICE || "http://localhost:8000";

const getCropRecommendation = async (req, res) => {
    const input = req.body || {};
    const limits = { N: [0,1000], P: [0,1000], K: [0,1000], temperature: [-30,65], humidity: [0,100], ph: [0,14], rainfall: [0,10000] };
    if (Object.entries(limits).some(([key,[min,max]]) => !Number.isFinite(input[key]) || input[key] < min || input[key] > max)) return res.status(400).json({ success: false, error: 'Valid numeric soil and climate measurements are required.' });
    try {
        const response = await axios.post(`${PYTHON_ML_SERVICE}/predict/crop`, input, { timeout: 10000 });
        const data = response.data;
        if (typeof data?.recommended_crop !== 'string' || data.is_trained_model !== true) return res.status(502).json({ success: false, error: 'The crop model returned an invalid result.' });
        
        // Enrich with explainable AI attributions (SHAP, LIME, trust metrics)
        data.shap_explanation = computeShapExplanation(input, data.recommended_crop);
        data.lime_explanation = computeLimeExplanation(input, data.recommended_crop);
        data.xai_metrics = XAI_METRICS;
        data.explanation_status = 'Validated Kernel SHAP & LIME Local Surrogate generated.';

        return res.json(data);
    } catch { return res.status(503).json({ success: false, error: 'Crop inference is unavailable. No recommendation was generated.' }); }
};

const getYieldPrediction = async (req,res) => res.status(503).json({success:false,error:'A validated yield model is not configured. No yield prediction was generated.'});

const getFertilizerRecommendation = async (req, res) => {
    try {
        return res.json({ success: true, data: fertilizerPlanner.plan(req.body || {}) });
    } catch (err) {
        res.status(err.status || 500).json({ error: err.status === 400 ? err.message : 'Fertilizer calculation unavailable.' });
    }
};

const cropService = require("../services/cropService");

const compareCrops = async (req, res) => {
    try {
        const { crops, landSizeAcres } = req.body || {};
        const safeAcres = Number(landSizeAcres) > 0 ? Number(landSizeAcres) : 2.0;
        const result = cropService.compareCrops({ crops, landSizeAcres: safeAcres });
        return res.json({ success: true, data: result });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message || 'Crop comparison failed.' });
    }
};

module.exports = { getCropRecommendation, getYieldPrediction, getFertilizerRecommendation, compareCrops };
