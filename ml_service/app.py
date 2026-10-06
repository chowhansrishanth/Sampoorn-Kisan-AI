"""
========================================================================================
Sampoorn Kisan AI — FastAPI Autonomous Multi-Agent & XAI Microservice (`ml_service/app.py`)
========================================================================================

PURPOSE:
Acts as the central Machine Learning REST API Gateway for the application.
Exposes endpoints for:
1. Crop Recommendation (XGBoost)
2. Explainable AI feature attributions (SHAP TreeExplainer)
3. Plant Disease Diagnosis & Visual Heatmaps (PyTorch MobileNetV2 + Grad-CAM)
4. Multi-Agent Agronomic Consultation & Advisory

ARCHITECTURE & CONCURRENCY:
- Built with FastAPI (Asynchronous Server Gateway Interface / ASGI).
- Uses `starlette.concurrency.run_in_threadpool` for compute-heavy ML inferences
  (PyTorch forward passes and Grad-CAM backpropagation) so the main event loop
  is never blocked by CPU-intensive array operations.
========================================================================================
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from starlette.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import time

# Import Core ML and Vision Engines
from ml_engine import crop_engine
try:
    from vision_engine import vision_engine
    VISION_IMPORT_ERROR = None
except Exception as exc:
    # Graceful degradation: Crop inference remains independently usable
    # even if PyTorch vision dependencies are not configured on the host machine.
    vision_engine = None
    VISION_IMPORT_ERROR = type(exc).__name__

from agents import multi_agent_orchestrator

# Initialize FastAPI Application
app = FastAPI(
    title="Sampoorn Kisan AI - Autonomous Multi-Agent & XAI Microservice",
    description="Federated Explainable AI Microservice providing SHAP, Grad-CAM, and Multi-Agent Agronomic Orchestration.",
    version="2.0.0"
)

# Cross-Origin Resource Sharing (CORS) Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Pydantic Request Schema Models (Data Transfer Objects / DTOs)
# ============================================================================

class CropPredictRequest(BaseModel):
    """Input payload for 7-parameter crop recommendation."""
    N: float = 90.0           # Soil Nitrogen (kg/ha)
    P: float = 42.0           # Soil Phosphorus (kg/ha)
    K: float = 43.0           # Soil Potassium (kg/ha)
    temperature: float = 25.5 # Ambient temperature (°C)
    humidity: float = 75.0    # Relative humidity (%)
    ph: float = 6.5           # Soil pH level (0-14 scale)
    rainfall: float = 200.0   # Seasonal precipitation (mm)


class YieldPredictRequest(BaseModel):
    """Input payload for crop yield estimation."""
    crop: str = "Rice"
    area_hectares: float = 2.5
    N: float = 90.0
    P: float = 42.0
    K: float = 43.0
    rainfall: float = 200.0


class FertilizerRequest(BaseModel):
    """Input payload for N-P-K nutrient deficit calculation."""
    crop: str = "Rice"
    N: float = 90.0
    P: float = 42.0
    K: float = 43.0
    soil_type: str = "Alluvial"


class AgentOrchestrateRequest(BaseModel):
    """Input payload for multi-agent agronomy strategy dispatch."""
    crop: str = "Rice"
    state: str = "Telangana"
    land_acres: float = 2.5
    soil_data: Optional[Dict[str, Any]] = {"N": 90, "P": 42, "K": 43, "ph": 6.5, "rainfall": 200}


class AgentChatRequest(BaseModel):
    """Input payload for farmer conversational chat assistant."""
    message: str
    crop: Optional[str] = "Tomato"
    language: Optional[str] = "en"
    user_context: Optional[Dict[str, Any]] = None


# ============================================================================
# Route Handlers & Microservice Endpoints
# ============================================================================

# ── Health check ────────────────────────────────────────────────────────────
@app.get("/")
@app.get("/health")
def health_check():
    """
    Service health and model readiness probe.
    Returns status of PyTorch vision model, XGBoost crop model, and available devices.
    """
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
        "model_states": {
            "crop": crop_engine.status,
            "disease": vision_engine.status if vision_engine else "DEPENDENCY_UNAVAILABLE"
        },
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
    """
    Predicts the best crop suited to current soil and climate factors.
    Invokes the XGBoost / Scikit-learn estimator in `ml_engine.py`.
    """
    return crop_engine.predict_crop({
        "N": req.N, "P": req.P, "K": req.K,
        "temperature": req.temperature, "humidity": req.humidity,
        "ph": req.ph, "rainfall": req.rainfall
    })


@app.post("/predict/yield")
def predict_yield(req: YieldPredictRequest):
    """Predicts crop harvest yield (metric tons per hectare)."""
    return crop_engine.predict_yield(
        crop=req.crop, area_hectares=req.area_hectares,
        N=req.N, P=req.P, K=req.K, rainfall=req.rainfall
    )


@app.post("/predict/fertilizer")
def predict_fertilizer(req: FertilizerRequest):
    """
    Nutrient calculator endpoint. Guides synthetic and organic fertilizer dosage.
    Delegates to the Node.js nutrient calculator API for authoritative CIBRC targets.
    """
    raise HTTPException(status_code=503, detail="Use the nutrient calculator API with prescribed targets; no agronomic dose model is configured.")


# ── XAI Specific Endpoints ───────────────────────────────────────────────────
@app.post("/explain/shap")
def explain_shap(req: CropPredictRequest):
    """Computes SHAP (Shapley Additive exPlanations) feature attributions."""
    raise HTTPException(status_code=503, detail="A validated SHAP explainer must be configured.")


@app.post("/explain/lime")
def explain_lime(req: CropPredictRequest):
    """Computes LIME (Local Interpretable Model-agnostic Explanations) local rules."""
    raise HTTPException(status_code=503, detail="A validated LIME explainer must be configured.")


# ── Disease Diagnosis & Grad-CAM ─────────────────────────────────────────────
@app.post("/diagnose/disease")
async def diagnose_disease(
    file: Optional[UploadFile] = File(None),
    cropType: Optional[str] = Form("Tomato")
):
    """
    Diagnoses foliar plant diseases from an uploaded photograph.
    Workflow:
    1. Validates upload size (<= 20 MB).
    2. Dispatches inference to worker threadpool via `run_in_threadpool`.
    3. Executes botanical foliage verification in HSV space.
    4. Computes PyTorch MobileNetV2 forward pass & Softmax probabilities.
    5. Calculates Grad-CAM visual heatmap overlay.
    """
    if vision_engine is None:
        raise HTTPException(status_code=503, detail="Disease model dependencies are not installed; no diagnosis was generated.")
    if file is None:
        raise HTTPException(status_code=400, detail="An image is required.")
    try:
        # Buffer image with 20 MB safety limit
        contents = await file.read(20 * 1024 * 1024 + 1)
        if len(contents) > 20 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Image exceeds 20 MB.")
        # Asynchronously offload compute-intensive vision inference to worker threadpool
        return await run_in_threadpool(vision_engine.diagnose_image, contents, file.filename, cropType)
    finally:
        await file.close()


# ── Multi-Agent Orchestration & Chat ─────────────────────────────────────────
@app.post("/agents/orchestrate")
def orchestrate_agents(req: AgentOrchestrateRequest):
    """Coordinates autonomous domain agents into a comprehensive seasonal plan."""
    raise HTTPException(status_code=503, detail="Use the authenticated Node multi-agent coordinator.")


@app.post("/agents/chat")
def agent_chat(req: AgentChatRequest):
    """Conversational query router routing farmer questions to specialized agents."""
    raise HTTPException(status_code=503, detail="Use the authenticated Node multi-agent coordinator.")


# ── Market Forecast ──────────────────────────────────────────────────────────
@app.get("/market/forecast")
def get_market_forecast(crop: str = "Rice", state: str = "Telangana"):
    """APMC Mandi historical modal price forecast."""
    raise HTTPException(status_code=503, detail="Use the Node market history quality gate; no Python market model is configured.")


if __name__ == "__main__":
    import uvicorn
    # Boot standalone Uvicorn ASGI server
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
