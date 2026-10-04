from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from starlette.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import time

from ml_engine import crop_engine
try:
    from vision_engine import vision_engine
    VISION_IMPORT_ERROR = None
except Exception as exc:
    # Crop inference remains independently usable when optional torch/vision
    # dependencies are not installed. Disease routes report a truthful 503.
    vision_engine = None
    VISION_IMPORT_ERROR = type(exc).__name__
from agents import multi_agent_orchestrator

app = FastAPI(
    title="Sampoorn Kisan AI - Autonomous Multi-Agent & XAI Microservice",
    description="IEEE Paper Grade Federated Explainable AI Microservice providing SHAP, LIME, Grad-CAM, and Multi-Agent Orchestration.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CropPredictRequest(BaseModel):
    N: float = 90.0
    P: float = 42.0
    K: float = 43.0
    temperature: float = 25.5
    humidity: float = 75.0
    ph: float = 6.5
    rainfall: float = 200.0


class YieldPredictRequest(BaseModel):
    crop: str = "Rice"
    area_hectares: float = 2.5
    N: float = 90.0
    P: float = 42.0
    K: float = 43.0
    rainfall: float = 200.0


class FertilizerRequest(BaseModel):
    crop: str = "Rice"
    N: float = 90.0
    P: float = 42.0
    K: float = 43.0
    soil_type: str = "Alluvial"


class AgentOrchestrateRequest(BaseModel):
    crop: str = "Rice"
    state: str = "Telangana"
    land_acres: float = 2.5
    soil_data: Optional[Dict[str, Any]] = {"N": 90, "P": 42, "K": 43, "ph": 6.5, "rainfall": 200}


class AgentChatRequest(BaseModel):
    message: str
    crop: Optional[str] = "Tomato"
    language: Optional[str] = "en"
    user_context: Optional[Dict[str, Any]] = None


# ── Health check ────────────────────────────────────────────────────────────
@app.get("/")
@app.get("/health")
def health_check():
    crop_engine.load()
    cuda_avail = False
    try:
        import torch
        cuda_avail = torch.cuda.is_available()
    except Exception:
        pass
    device = "cuda" if cuda_avail else "cpu"
    return {
        "status": "online",
        "service": "Sampoorn Kisan AI - Multi-Agent ML & XAI Engine",
        "version": "2.0.0",
        "cuda_available": cuda_avail,
        "selected_device": device,
        "model_states": {"crop": crop_engine.status, "disease": vision_engine.status if vision_engine else "DEPENDENCY_UNAVAILABLE"},
        "models_loaded": {
            "crop_recommendation_xgboost_scikit": crop_engine.status == "READY",
            "leaf_disease_pytorch_vision": bool(vision_engine and vision_engine.ready),
            "shap_tree_explainer": False,
            "lime_tabular_surrogate": False,
            "gradcam_cnn_heatmaps": bool(vision_engine and vision_engine.ready),
            "multi_agent_orchestrator": False
        },
        "supported_xai": ["Grad-CAM"] if vision_engine and vision_engine.ready else [],
        "paper_framework": "A Federated Explainable AI Framework for Smart Agriculture",
        "endpoints": [
            "/predict/crop",
            "/predict/yield",
            "/predict/fertilizer",
            "/diagnose/disease",
            "/explain/shap",
            "/explain/lime",
            "/agents/orchestrate",
            "/agents/chat",
            "/market/forecast"
        ]
    }


# ── Crop & Yield Prediction ──────────────────────────────────────────────────
@app.post("/predict/crop")
def predict_crop(req: CropPredictRequest):
    return crop_engine.predict_crop({
        "N": req.N, "P": req.P, "K": req.K,
        "temperature": req.temperature, "humidity": req.humidity,
        "ph": req.ph, "rainfall": req.rainfall
    })


@app.post("/predict/yield")
def predict_yield(req: YieldPredictRequest):
    return crop_engine.predict_yield(
        crop=req.crop, area_hectares=req.area_hectares,
        N=req.N, P=req.P, K=req.K, rainfall=req.rainfall
    )


@app.post("/predict/fertilizer")
def predict_fertilizer(req: FertilizerRequest):
    raise HTTPException(status_code=503, detail="Use the nutrient calculator API with prescribed targets; no agronomic dose model is configured.")
    crop_name = req.crop
    n = req.N
    p = req.P
    k = req.K
    
    urea_kg = max(20.0, round((120.0 - n) * 0.45, 1))
    dap_kg = max(15.0, round((60.0 - p) * 0.40, 1))
    mop_kg = max(10.0, round((50.0 - k) * 0.35, 1))
    
    return {
        "crop": crop_name,
        "soil_type": req.soil_type,
        "recommended_fertilizers": [
            {"name": "Neem Coated Urea (46% N)", "quantity_kg_per_acre": urea_kg, "timing": "Split into 3 doses: Basal, Tillering, Panicle Initiation"},
            {"name": "Di-Ammonium Phosphate / DAP (18:46:0)", "quantity_kg_per_acre": dap_kg, "timing": "100% as Basal application at sowing"},
            {"name": "Muriate of Potash / MOP (60% K2O)", "quantity_kg_per_acre": mop_kg, "timing": "50% Basal + 50% at flowering stage"}
        ],
        "organic_supplements": [
            {"name": "Well-decomposed Farmyard Manure (FYM)", "quantity": "4-5 tons/acre applied 3 weeks prior to sowing"},
            {"name": "Bio-fertilizers (Azospirillum / PSB)", "quantity": "2 kg/acre mixed with 50 kg FYM"}
        ],
        "xai_guidance": f"Fertilizer dosage is tailored to your measured soil N ({n}), P ({p}), K ({k}) levels to optimize yield while protecting soil microbiome health."
    }


# ── XAI Specific Endpoints ───────────────────────────────────────────────────
@app.post("/explain/shap")
def explain_shap(req: CropPredictRequest):
    raise HTTPException(status_code=503, detail="A validated SHAP explainer must be configured.")
    res = crop_engine.predict_crop({
        "N": req.N, "P": req.P, "K": req.K,
        "temperature": req.temperature, "humidity": req.humidity,
        "ph": req.ph, "rainfall": req.rainfall
    })
    return {
        "target_crop": res["recommended_crop"],
        "base_value": res["shap_explanation"]["base_value"],
        "shap_values": res["shap_explanation"]["shap_values"],
        "summary": f"Top driving feature for {res['recommended_crop']} is {res['shap_explanation']['shap_values'][0]['feature']}."
    }


@app.post("/explain/lime")
def explain_lime(req: CropPredictRequest):
    raise HTTPException(status_code=503, detail="A validated LIME explainer must be configured.")
    res = crop_engine.predict_crop({
        "N": req.N, "P": req.P, "K": req.K,
        "temperature": req.temperature, "humidity": req.humidity,
        "ph": req.ph, "rainfall": req.rainfall
    })
    return {
        "target_crop": res["recommended_crop"],
        "lime_local_rules": res["lime_explanation"],
        "fidelity_score": 0.942
    }


# ── Disease Diagnosis & Grad-CAM ─────────────────────────────────────────────
@app.post("/diagnose/disease")
async def diagnose_disease(
    file: Optional[UploadFile] = File(None),
    cropType: Optional[str] = Form("Tomato")
):
    if vision_engine is None:
        raise HTTPException(status_code=503, detail="Disease model dependencies are not installed; no diagnosis was generated.")
    if file is None:
        raise HTTPException(status_code=400, detail="An image is required.")
    try:
        contents = await file.read(20 * 1024 * 1024 + 1)
        if len(contents) > 20 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Image exceeds 20 MB.")
        return await run_in_threadpool(vision_engine.diagnose_image, contents, file.filename, cropType)
    finally:
        await file.close()


# ── Multi-Agent Orchestration & Chat ─────────────────────────────────────────
@app.post("/agents/orchestrate")
def orchestrate_agents(req: AgentOrchestrateRequest):
    raise HTTPException(status_code=503, detail="Use the authenticated Node multi-agent coordinator.")
    return multi_agent_orchestrator.orchestrate_comprehensive_plan({
        "crop": req.crop,
        "state": req.state,
        "land_acres": req.land_acres,
        "soil_data": req.soil_data
    })


@app.post("/agents/chat")
def agent_chat(req: AgentChatRequest):
    raise HTTPException(status_code=503, detail="Use the authenticated Node multi-agent coordinator.")
    msg = req.message.lower()
    crop = req.crop or "Crop"
    
    # Route query to most relevant specialized agent
    if any(w in msg for w in ["price", "mandi", "market", "rate", "cost", "sell", "msp", "profit"]):
        agent_info = multi_agent_orchestrator.market.evaluate(crop)
        reply = f"📈 **Market Intelligence Agent Advice:**\n\n• Current APMC Mandi Modal Price for {crop}: ₹{agent_info['mandi_modal_price_inr_qtl']}/Quintal (MSP: ₹{agent_info['msp_inr_qtl']}/Qtl).\n• Trend: {agent_info['market_trend']}.\n• {agent_info['arbitrage_advisory']}"
        active_badge = "📈 Market Agent"
    elif any(w in msg for w in ["disease", "pest", "leaf", "spot", "blight", "yellow", "spray", "insect", "worm"]):
        agent_info = multi_agent_orchestrator.vision_ipm.inspect(crop)
        reply = f"🔬 **Vision & IPM Agent Advice for {crop}:**\n\n• Recommended Organic Control: Spray cold-pressed Neem Oil 10,000 PPM @ 5ml/L.\n• Recommended Chemical Control: Apply Mancozeb 75% WP @ 2.5g/L water.\n• IPM Measure: Install Pheromone / Sticky Traps @ 10/acre."
        active_badge = "🔬 Vision & IPM Agent"
    elif any(w in msg for w in ["scheme", "yojana", "subsidy", "pm-kisan", "pmfby", "loan", "insurance", "kcc"]):
        agent_info = multi_agent_orchestrator.policy.get_schemes()
        reply = f"🏛️ **Policy & Governance Agent Advice:**\n\n• **PM-KISAN**: ₹6,000/year direct bank transfer.\n• **PMFBY Crop Insurance**: 1.5-2% subsidized premium coverage.\n• **Kisan Credit Card (KCC)**: 4% effective interest rate up to ₹3 Lakhs.\n• Kisan Call Centre Helpline: 1800-180-1551 (Toll-Free)."
        active_badge = "🏛️ Policy Agent"
    else:
        agent_info = multi_agent_orchestrator.agronomy.analyze({"N": 90, "P": 42, "K": 43, "ph": 6.5})
        reply = f"🌱 **Agronomy & Soil Agent Advice:**\n\n• Balanced NPK 12:32:16 application recommended.\n• Soil Health Index: {agent_info['soil_health_score']}/100.\n• Maintain 40-50% soil moisture during peak vegetative stages for maximum nutrient uptake."
        active_badge = "🌱 Agronomy Agent"
        
    return {
        "reply": reply,
        "active_agent": active_badge,
        "timestamp": time.strftime("%H:%M:%S")
    }


# ── Market Forecast ──────────────────────────────────────────────────────────
@app.get("/market/forecast")
def get_market_forecast(crop: str = "Rice", state: str = "Telangana"):
    raise HTTPException(status_code=503, detail="Use the Node market history quality gate; no Python market model is configured.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
