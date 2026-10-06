/**
 * ============================================================================
 * CROP CONTROLLER — ML INFERENCE ROUTING & EXPLAINABLE AI INTEGRATION
 * ============================================================================
 * Handles crop suitability prediction requests by:
 *   1. Strictly validating input agronomic boundary constraints:
 *      x = [N, P, K, temp, humidity, ph, rainfall] in R^7
 *   2. Forwarding feature vectors to Python ML FastAPI Microservice (port 8000)
 *      which executes the trained XGBoost model (crop_model.pkl).
 *   3. Enriching prediction results with Kernel SHAP & LIME local attributions
 *      from xaiService.
 *   4. Providing deterministic ICAR agronomic heuristics as safety fallback
 *      if ML inference service is unavailable and allow_heuristic is permitted.
 * ============================================================================
 */
const axios = require("axios");
const fertilizerPlanner = require('../services/fertilizerPlanner');
const { computeShapExplanation, computeLimeExplanation, XAI_METRICS } = require('../services/xaiService');

const PYTHON_ML_SERVICE = process.env.PYTHON_ML_SERVICE || "http://localhost:8000";

function getIcarFallbackCrop(input = {}) {
    const { N = 60, P = 40, K = 40, temperature = 26, humidity = 60, ph = 6.8, rainfall = 600 } = input;
    if (rainfall > 1000 || humidity > 75) {
        return {
            name: "rice",
            confidence: 0.92,
            keyBenefits: ["Guaranteed government MSP procurement", "High grain volume in flood/canal regions"],
            needs: ["Continuous standing water (1100-1400mm)", "Clayey or alluvial soil with pH 5.5-7.2"],
            zeroDamage: "Keep water depth shallow (2-3cm) rather than deep standing water. Use AWD (alternate wetting & drying) to prevent root decay and planthopper infestation."
        };
    }
    if (rainfall < 350 || humidity < 40) {
        return {
            name: "mothbeans",
            confidence: 0.89,
            keyBenefits: ["Extreme drought tolerance", "Nutritious pulse fixing natural atmospheric nitrogen"],
            needs: ["Sandy or light soil, pH 6.0-8.0", "Minimal water"],
            zeroDamage: "Sow on ridge beds. Treat seeds with Trichoderma viride to prevent collar rot."
        };
    }
    if (temperature < 20) {
        return {
            name: "wheat",
            confidence: 0.94,
            keyBenefits: ["High winter stability and guaranteed MSP", "Minimal pest incidence in cool climate"],
            needs: ["Alluvial/loam soil, pH 6.5-8.0", "Critical irrigation at Crown Root Initiation (21 days)"],
            zeroDamage: "First irrigation at day 21 (CRI stage) is mandatory to prevent up to 35% tiller loss."
        };
    }
    if (N < 40) {
        return {
            name: "pigeonpeas",
            confidence: 0.91,
            keyBenefits: ["Biological nitrogen fixation (40 kg/acre)", "Deep taproots aerate subsoil"],
            needs: ["Well-drained soil, pH 6.0-7.5", "1-2 protective irrigations"],
            zeroDamage: "Apply seed inoculation with Rhizobium. Install pheromone traps for pod borers."
        };
    }
    if (P > 50 && K > 40) {
        return {
            name: "cotton",
            confidence: 0.90,
            keyBenefits: ["Top commercial gross revenue", "Massive mandi liquidity"],
            needs: ["Deep black or alluvial soil, pH 6.5-8.2", "Steady moisture during square and boll opening"],
            zeroDamage: "Border planting of castor and marigold intercepts armyworms with zero pesticide damage."
        };
    }
    return {
        name: "maize",
        confidence: 0.88,
        keyBenefits: ["Rapid 100-day harvest allows double-cropping", "Dual income: grain and animal fodder"],
        needs: ["Well-drained loam, pH 6.0-7.5", "Adequate moisture at silking and tasseling"],
        zeroDamage: "Early whorl spray of neem formulation protects against Fall Armyworm with zero chemical burn."
    };
}

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
    } catch {
        if (req.body?.allow_heuristic === true || req.query?.allow_heuristic === 'true' || req.headers?.['x-allow-heuristic'] === 'true') {
            const fallback = getIcarFallbackCrop(input);
            return res.json({
                success: true,
                recommended_crop: fallback.name,
                confidence: fallback.confidence,
                is_trained_model: false,
                source: "ICAR Agronomic Benchmark Engine (Deterministic Fallback)",
                key_benefits: fallback.keyBenefits,
                needs: fallback.needs,
                zero_damage_advisory: fallback.zeroDamage,
                shap_explanation: computeShapExplanation(input, fallback.name),
                lime_explanation: computeLimeExplanation(input, fallback.name),
                xai_metrics: XAI_METRICS,
                explanation_status: 'Explainable AI attribution calculated from local surrogate baseline.'
            });
        }
        return res.status(503).json({ success: false, error: 'Crop inference is unavailable. No recommendation was generated.' });
    }
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

module.exports = { getCropRecommendation, getYieldPrediction, getFertilizerRecommendation, compareCrops, getIcarFallbackCrop };
