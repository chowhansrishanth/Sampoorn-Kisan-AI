# Full Implementation Plan: Sampoorn Kisan AI (IEEE Paper Grade)

Build and integrate all missing components of the **Sampoorn Kisan AI** smart agriculture platform based on the IEEE paper framework *"A Federated Explainable AI Framework for Smart Agriculture"*. This includes the Python ML/XAI microservice (SHAP, LIME, Grad-CAM), Federated Learning server (Flower FLWR + AES aggregation), MongoDB database layer, JWT authentication, real-time weather & market APIs, and an interactive React Frontend Dashboard with XAI charts and disease upload.

## User Review Required

> [!IMPORTANT]
> **Python Microservice & Fallback Bridge:** We will create a full Python ML microservice (`ml_service`) with FastAPI, Scikit-Learn, PyTorch, SHAP, LIME, and Grad-CAM. To guarantee 100% out-of-the-box reliability without requiring complex local C++ compilation for OpenCV/PyTorch on every system, the Express backend will also include an intelligent built-in ML/XAI engine that serves identical structured XAI payloads and heatmaps whenever the Python service is offline.

> [!NOTE]
> **Database Connection:** We will configure Mongoose for MongoDB and include an automatic in-memory fallback mechanism so the entire application functions seamlessly for demonstration even if a local MongoDB server is not running.

---

## Proposed Changes

### Component 1: Python ML & Explainable AI (XAI) Engine (`ml_service/`)

#### [NEW] `ml_service/app.py`
- FastAPI REST service exposing ML & XAI endpoints (`/predict/crop`, `/predict/disease`, `/explain/shap`, `/explain/gradcam`).

#### [NEW] `ml_service/ml_engine.py`
- Scikit-learn / XGBoost ML models for crop recommendation, fertilizer calculation, and yield prediction.
- Integrated **SHAP** TreeExplainer and **LIME** TabularExplainer.

#### [NEW] `ml_service/vision_engine.py`
- PyTorch CNN / EfficientNet model for leaf disease detection.
- **Grad-CAM** algorithm to produce visual attention heatmap overlays.

#### [NEW] `ml_service/requirements.txt`
- Python dependencies (`fastapi`, `uvicorn`, `scikit-learn`, `shap`, `lime`, `torch`, `opencv-python`, `flower`).

---

### Component 2: Federated Learning Architecture (`fl_server/`)

#### [NEW] `fl_server/server.py`
- Flower (FLWR) federated learning server implementing FedAvg parameter aggregation with AES-256 encrypted model updates.

#### [NEW] `fl_server/client_node.py`
- Federated client simulation representing local farm nodes (Farm 1, Farm 2, Farm 3).

---

### Component 3: Express Backend & Database (`backend/`)

#### [DELETE] `backend/aiOrchestrator.js`
- Remove redundant root file to maintain clean code structure.

#### [NEW] `backend/config/db.js`
- MongoDB Mongoose database connection with automatic in-memory fallback.

#### [NEW] `backend/models/User.js`, `FarmData.js`, `PredictionLog.js`
- Mongoose schemas for farmer authentication, IoT sensor telemetry (NPK, pH, Soil Moisture), and XAI audit logs.

#### [NEW] `backend/controllers/authController.js`, `cropController.js`, `diseaseController.js`, `marketWeatherController.js`, `flController.js`
- Business logic for Authentication, Crop/Yield XAI predictions, Disease diagnosis with Grad-CAM image output, Mandi prices, Weather forecasting, and Federated Learning metrics.

#### [NEW] `backend/routes/authRoutes.js`, `cropRoutes.js`, `diseaseRoutes.js`, `marketRoutes.js`, `flRoutes.js`
- Clean RESTful routing endpoints.

#### [MODIFY] `backend/server.js`
- Attach all routes, setup Multer image upload handling, enable CORS, and initialize database connection.

#### [MODIFY] `backend/package.json`
- Add `jsonwebtoken`, `bcryptjs`, `mongoose`, `multer`, `canvas` / image tools.

---

### Component 4: React Frontend & Dashboard (`frontend/`)

#### [NEW] `frontend/src/components/Navbar.jsx` & `Footer.jsx`
- Unified header with navigation tabs, language toggle (English/Telugu/Hindi), and Auth status.

#### [NEW] `frontend/src/pages/Dashboard.jsx`
- Main Farmer Command Center featuring:
  - IoT Telemetry cards (Soil Moisture, Temperature, NPK levels, pH value).
  - Weather forecast & smart irrigation recommendation widget.
  - Live Mandi price trend chart.
  - Federated Learning network state & privacy loss indicator.

#### [NEW] `frontend/src/pages/DiseaseDiagnosis.jsx`
- Leaf disease diagnosis tool with drag-and-drop image upload, instant diagnosis, remedy advisory, and **Grad-CAM visual heatmap explanation overlay**.

#### [NEW] `frontend/src/pages/XAIDashboard.jsx`
- Dedicated Explainable AI visualizer featuring **SHAP feature importance bar charts** and **LIME local explanation breakdowns** powered by Recharts.

#### [NEW] `frontend/src/pages/CropRecommendationTool.jsx`
- Interactive form for crop choice, yield estimation, and fertilizer calculator with instant feature impact explanations.

#### [NEW] `frontend/src/pages/AuthModal.jsx`
- Modal for Farmer Registration and Login.

#### [MODIFY] `frontend/src/AIChat.jsx`
- Enhanced multi-agent chat interface with agent badges, image upload capabilities, quick suggested prompts, and Telugu/Hindi translation toggle.

#### [MODIFY] `frontend/src/App.jsx`
- Multi-page client router supporting all views (`/`, `/dashboard`, `/chat`, `/disease`, `/xai`, `/crop-tool`).

---

## Verification Plan

### Automated & API Verification
1. Start Express backend (`npm run dev` in `backend/`).
2. Test `/` root health check endpoint.
3. Test `/api/auth/register` and `/api/auth/login`.
4. Test `/api/crop/recommend` with NPK/soil inputs and verify SHAP feature importance JSON response.
5. Test `/api/disease/diagnose` image upload and verify Grad-CAM output.
6. Test `/api/fl/status` to confirm Federated Learning round metrics.

### Manual UI Verification
1. Launch Vite frontend (`npm run dev` in `frontend/`).
2. Navigate through Landing Page, Farmer Dashboard, Disease Diagnosis, XAI Dashboard, and Crop Tool.
3. Test interactive SHAP graphs on the XAI Dashboard using Recharts.
4. Drag-and-drop a crop leaf image in the Disease Diagnosis tab to view the Grad-CAM heatmap visualization.
5. Test the AI Chatbot with different farming queries.
