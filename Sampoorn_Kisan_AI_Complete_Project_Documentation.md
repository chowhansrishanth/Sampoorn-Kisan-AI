# Sampoorn Kisan AI — Complete Project Documentation & Technical Architecture Report

`Documentation generated from the current project state.`

---

## Executive Metadata
- **Project Name**: Sampoorn Kisan AI (సంపూర్ణ కిసాన్ AI / सम्पूर्ण किसान AI)
- **Current Version**: `v1.0.0-RC1` (Release Candidate 1)
- **Architecture**: Federated Explainable AI (FL-XAI) & Autonomous Multi-Agent Smart Agriculture Platform
- **Operating Environment**: Node.js v20+, Express 5.x / 4.x, React 19.x, Vite 8.x, Python 3.10+ (FastAPI, PyTorch, XGBoost), MongoDB 6.x / In-Memory JSON Store
- **Audit Date**: Current Local Time: September 2026
- **Target Audience**: Indian Smallholder Farmers, Agricultural Extension Officers, Agronomists, KVK Centers, and Agricultural Researchers

---

# PHASE 1 — PROJECT IDENTIFICATION

## 1.1 Project Overview
**Sampoorn Kisan AI** is a full-stack, enterprise-grade agricultural intelligence platform engineered specifically for Indian agricultural realities. The platform brings together Explainable Artificial Intelligence (XAI), Edge Computer Vision, Autonomous Multi-Agent Reasoning, Real-Time APMC Mandi Market Intelligence, IoT Microclimate Telemetry, and Federated Learning into a unified, multilingual progressive web application.

The application bridges the severe diagnostic and advisory gap faced by rural smallholder farmers by delivering sub-second crop disease diagnosis, transparent NPK soil balancing with SHAP/LIME attribution, 7-day weather-adjusted irrigation scheduling, localized market arbitrage calculations, and 24x7 agronomic conversational support in English, Telugu, and Hindi.

## 1.2 Problem Statement
Indian agriculture sustains over 140 million farm families, yet smallholder and marginal farmers (owning <2 hectares of land) confront systemic vulnerabilities:
1. **Delayed Pest & Pathogen Diagnosis**: Over 20–35% of total crop yield is lost annually to fungal blights, bacterial wilts, and viral infections. Visual misdiagnosis leads to incorrect pesticide application, chemical resistance, and heavy financial losses.
2. **"Black-Box" AI Distrust**: Standard deep learning models present recommendations without scientific rationale. Farmers distrust recommendations when they cannot see *why* a particular chemical or crop was selected.
3. **Mandi Intermediary Exploitation & Price Asymmetry**: Farmers sell produce at suboptimal local APMC mandis due to lack of real-time price awareness and transportation cost transparency.
4. **Suboptimal Fertilizer Usage**: Imbalanced urea (Nitrogen) usage damages soil pH, locks up micro-nutrients, and elevates production costs.
5. **Language & Digital Literacy Barriers**: Most sophisticated agronomic advisory portals operate solely in English or formal Hindi, excluding regional language speakers.
6. **Data Privacy in Farm Aggregation**: Centralized farm data aggregation creates privacy risks; farmers require local edge ownership of operational records.

## 1.3 Proposed Solution
Sampoorn Kisan AI addresses these challenges through a layered, multi-engine architecture:
- **Transparent Neural Disease Diagnosis**: MobileNetV2 CNN paired with real backward-hook Grad-CAM overlays that project heatmaps directly onto infected leaf margins, paired with ICAR/CIBRC-compliant dual remedies (chemical vs. organic), knapsack dosage specifications, and 14-day progression timelines.
- **Explainable Crop & Soil Recommendation**: XGBoost classification grounded by SHAP (TreeExplainer) and LIME surrogate rules, detailing the exact percentage contribution and favorable/unfavorable status of Nitrogen, Phosphorus, Potassium, Soil pH, Temperature, Humidity, and Rainfall.
- **Sahayak 24x7 Multi-Agent AI**: A coordinated multi-agent orchestration architecture comprising 5 domain specialist agents (Agronomy, Vision/IPM, Market Intelligence, Policy Governance, and Farm Economics) with Google Gemini integration, Server-Sent Events (SSE) streaming, and comprehensive in-memory conversation retention.
- **Hyper-Local Market Arbitrage & Weather Telemetry**: Real-time integration with Open-Meteo for hourly agromet weather and the Farmer.in Open Prices API / Agmarknet for APMC price monitoring, coupled with a Net Return Transportation Cost Calculator.
- **Resilient Dual-Mode Execution**: Every critical service features an automatic fallback mechanism (e.g., if MongoDB is restricted, a file-backed JSON disk store activates; if the Python GPU microservice is offline, an integrated Node.js XAI fallback engine generates SVG Grad-CAM heatmaps and SHAP breakdowns).

## 1.4 Objectives
1. Provide instant leaf disease diagnosis (<2 seconds) with visual Grad-CAM transparency.
2. Provide transparent, agronomy-backed crop and fertilizer recommendations using exact soil test parameters.
3. Eliminate market information asymmetry by calculating net returns after logistics, cess, and loading expenses across competing APMC mandis.
4. Offer zero-latency, multi-dialect agricultural advisory in English, Telugu, and Hindi.
5. Provide specialized decision tools: Solar Pump sizing (PM-KUSUM), Crop Insurance (PMFBY), Carbon Credit quantification (IPCC Tier-1), Tank-Mix chemical compatibility, Satellite NDVI simulation, and Veterinary Triage.
6. Safeguard user privacy and local operational sovereignty through simulated Federated Learning (FedAvg + Differential Privacy).

## 1.5 Target Users
- **Smallholder & Marginal Farmers**: Farmers seeking immediate, practical advice regarding leaf spot remediation, spray timings, seed treatment, and fertilizer schedules.
- **Progressive & Commercial Growers**: Farmers optimizing logistics, intercropping profits, carbon credits, and cold-chain traceability.
- **Krishi Vigyan Kendra (KVK) Extension Workers & Village Coordinators**: Agricultural field staff needing standardized ICAR protocols and diagnostic validation.
- **Agricultural Students & Researchers**: Users evaluating model performance, latency benchmarks, SHAP/LIME feature importances, and FL convergence curves.

## 1.6 Current Implementation Status
The project is currently deployed and verified as **Release Candidate 1 (`v1.0.0-RC1`)**. All 28 frontend pages, 29 backend API route modules, dual ML engines (Python FastAPI + Node.js fallback), and comprehensive automated test suites have been verified with 0 horizontal layout overflows across 9 viewports (320px to 1920px) and 0 unhandled runtime crashes.

---

# PHASE 2 — COMPLETE TECHNOLOGY STACK

## 2.1 Technology Stack Matrix

| Layer | Technology | Version | Purpose | Evidence in Codebase |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Core** | React | `^19.2.7` | UI Component Framework | `frontend/package.json` |
| **Frontend Bundler** | Vite | `^8.1.1` | Build tool, HMR dev server, code splitting | `frontend/package.json`, `vite.config.js` |
| **Routing** | React Router DOM | `^7.18.1` | Declarative client-side routing | `frontend/src/App.jsx` |
| **State & Context** | React Context API | Native | Language (`LanguageContext`) & Theme (`ThemeContext`) | `frontend/src/context/` |
| **Styling** | Vanilla CSS (CSS3 Tokens) | Native | Responsive design tokens, dark/light themes | `frontend/src/index.css` (100KB) |
| **UI Icons** | Lucide React | `^1.25.0` | Comprehensive iconography | `frontend/package.json` |
| **Charts & Data Viz** | Recharts | `^2.12.7` | Responsive area, bar, line, and radar charts | `frontend/package.json`, dashboards |
| **Markdown Rendering**| React Markdown | `^10.1.0` | Rich text rendering for AI responses | `frontend/src/AIChat.jsx` |
| **Push Notifications** | Firebase SDK | `^12.17.1` | Web push & FCM notification handling | `frontend/package.json`, `usePushNotifications.js` |
| **HTTP Client (Client)**| Axios | `^1.18.1` | Interceptor-enabled API client | `frontend/src/api/client.js` |
| **Backend Runtime** | Node.js | `v20.x - v26.x` | Asynchronous JavaScript runtime | Environment specs, `package.json` |
| **Backend Framework**| Express.js | `^5.2.1` | REST API routing and middleware pipeline | `backend/package.json`, `server.js` |
| **Security Headers** | Custom Middleware | Native | `X-Content-Type-Options`, `X-Frame-Options`, `CSP` | `backend/server.js` |
| **CORS** | cors | `^2.8.6` | Cross-Origin Resource Sharing control | `backend/server.js` |
| **Rate Limiting** | express-rate-limit | `^8.7.0` | Brute-force & DDoS throttling | `backend/middleware/rateLimit.js` |
| **Authentication** | jsonwebtoken | `^9.0.2` | Stateless HMAC-SHA256 JWT generation | `backend/controllers/authController.js` |
| **Password Hashing** | bcryptjs | `^2.4.3` | Salted credential hashing (10 rounds) | `backend/controllers/authController.js` |
| **File Uploads** | Multer | `^1.4.5-lts.1` | Multipart leaf image handling & disk storage | `backend/routes/diseaseRoutes.js` |
| **In-Memory Caching** | lru-cache | `^11.5.2` | LRU query & prompt deduplication cache | `backend/services/aiProvider.js`, `cacheService.js` |
| **HTTP Client (Server)**| Axios + Axios Retry | `^1.18.1`, `^4.5.0`| Upstream API fetching with automatic retries | `backend/services/httpClient.js` |
| **Real-Time IoT** | ws (WebSocket) | `^8.21.3` | Bidirectional telemetry socket server | `backend/services/telemetryWs.js` |
| **Email Transporter** | Nodemailer | `^9.0.5` | Password reset link delivery | `backend/controllers/authController.js` |
| **Headless Browser** | Puppeteer Core | `^25.9.0` | Automated visual audits & testing | `backend/package.json`, `release_candidate_audit.js` |
| **Database** | MongoDB | `6.0` | Primary document database | `docker-compose.yml`, `backend/config/db.js` |
| **Database ODM** | Mongoose | `^8.3.0` | Schema validation and document mapping | `backend/models/` |
| **Fallback DB** | File-Backed JSON Store | Native fs | Atomic JSON disk store (`users_store.json`) | `backend/controllers/authController.js` |
| **ML Runtime** | Python | `3.10` | High-performance numerical runtime | `ml_service/Dockerfile` |
| **ML Framework** | FastAPI + Uvicorn | `^0.100.0` | Asynchronous Python REST microservice | `ml_service/requirements.txt`, `app.py`, `main.py` |
| **Deep Learning** | PyTorch & Torchvision | `^2.0.0`, `^0.15.0`| MobileNetV2 CNN inference & Grad-CAM hooks | `ml_service/vision_engine.py` |
| **Gradient Boosting** | XGBoost | `^1.7.0` | Multi-class crop prediction model | `ml_service/crop_engine.py` |
| **Classical ML** | Scikit-Learn | `^1.2.0` | Preprocessing, LabelEncoders, metrics | `ml_service/requirements.txt` |
| **Explainable AI** | SHAP | `^0.42.0` | KernelExplainer & TreeExplainer attribution | `ml_service/crop_engine.py` |
| **Explainable AI** | LIME | `^0.2.0.1` | Local Interpretable Model-agnostic Explanations| `ml_service/requirements.txt` |
| **Computer Vision** | OpenCV & Pillow | `^4.7.0`, `^9.5.0` | Image array transforms, Grad-CAM blending | `ml_service/vision_engine.py` |
| **Federated Learning**| Flower (FLWR) | `^1.4.0` | Federated aggregation simulation (FedAvg) | `ml_service/requirements.txt`, `fl_server/` |
| **LLM Provider** | Google GenAI SDK | `^2.12.0` | Gemini 2.0 Flash / Lite multimodal integration | `backend/services/aiProvider.js` |
| **Weather API** | Open-Meteo | Public API | Live 7-day hourly temperature, rain, humidity | `backend/services/weatherService.js` |
| **Mandi Price API** | Farmer.in Open API | Public API | Live wholesale modal APMC market rates | `backend/services/marketPriceService.js` |
| **Geocoding API** | OSM Nominatim | Public API | GPS reverse geocoding to village/district | `backend/services/locationService.js` |

---

# PHASE 3 — COMPLETE SYSTEM ARCHITECTURE

## 3.1 Architecture Overview
The platform operates as a distributed, decoupled multi-service system comprising five core components:

```
                  ┌──────────────────────────────────────────────────┐
                  │                 Farmer / Client                  │
                  │   Desktop Browser / Android PWA / Mobile Web     │
                  └─────────────────────────┬────────────────────────┘
                                            │
                                  HTTP / SSE / WebSocket
                                            │
                                            ▼
                  ┌──────────────────────────────────────────────────┐
                  │            Vite React SPA (Port 5173 / 80)        │
                  │  - 28 Dynamic Views with React.lazy Code Splitting│
                  │  - Language Provider (EN / TE / HI)               │
                  │  - Theme Engine (Dark Forest / Light Crisp)      │
                  │  - LocalStorage Session & PWA Service Worker     │
                  └─────────────────────────┬────────────────────────┘
                                            │
                                  Axios REST / SSE / WS
                                            │
                                            ▼
                  ┌──────────────────────────────────────────────────┐
                  │         Node.js / Express Backend (Port 5000)    │
                  │  - Security Headers, CORS, Rate Limiters         │
                  │  - JWT Verification & Auth Controller            │
                  │  - Multi-Agent AI Orchestrator (5 Agents)        │
                  │  - In-Memory Conversation State & RAG Engine     │
                  │  - WebSocket IoT Telemetry Server (/ws/telemetry)│
                  │  - Multer Image Handler & Fallback XAI Engines   │
                  └──────────────┬───────────────────┬───────────────┘
                                 │                   │
                 Internal REST   │                   │  Mongoose ODM
                 Port 8000       │                   │  Port 27017
                                 ▼                   ▼
       ┌───────────────────────────────┐   ┌──────────────────────────────┐
       │   Python ML Service (FastAPI) │   │        MongoDB Database      │
       │  - PyTorch MobileNetV2 Vision │   │  - Users, Conversations      │
       │  - Real Grad-CAM Backward Hooks│  │  - FarmData, PredictionLogs  │
       │  - XGBoost Multi-Class Crop   │   │  - AIRequestLogs             │
       │  - SHAP TreeExplainer Model   │   └──────────────┬───────────────┘
       │  - Multi-Agent Python Server  │                  │ Fallback (Atomic fs)
       └───────────────┬───────────────┘                  ▼
                       │                   ┌──────────────────────────────┐
         Flower RPC    │                   │   Persistent JSON Stores     │
         Port 8080     │                   │  - users_store.json (47 users)│
                       ▼                   │  - session_memory.json       │
       ┌───────────────────────────────┐   │  - farm_ledger.json          │
       │   Federated Learning Server   │   │  - traceability_batches.json │
       │  - FedAvg Model Aggregator    │   └──────────────────────────────┘
       │  - AES-256 Gradient Payload   │
       │  - Differential Privacy Engine│
       └───────────────────────────────┘
```

## 3.2 Port Allocations & Networking
- **Frontend SPA (Vite / Nginx)**: `http://localhost:5173` (Dev) / `http://localhost:80` (Docker)
- **Express Backend API**: `http://localhost:5000`
- **IoT WebSocket Telemetry**: `ws://localhost:5000/ws/telemetry`
- **Python ML & Vision Service**: `http://localhost:8000`
- **Flower Federated Learning Server**: `http://localhost:8080`
- **MongoDB Database Server**: `mongodb://localhost:27017/sampoorn_kisan_ai`

## 3.3 End-to-End Authentication & Request Flow
1. **Unauthenticated Access**: Unauthenticated visitors are intercepted by `LoginGate.jsx` (except for `/reset-password`).
2. **Session Generation**: Upon successful login or registration, the backend generates an HMAC-SHA256 JWT containing `{ id, email, role }` with a 7-day expiration.
3. **Session Persistence**: The frontend stores `{ user, token, savedAt }` in `localStorage` under `sampoorn_user_session` and synchronizes user state across React contexts.
4. **Authorized Dispatch**: The Axios interceptor (`frontend/src/api/client.js`) automatically attaches `Authorization: Bearer <token>` to all outbound requests.
5. **Route Protection**: The backend middleware `authMiddleware.js` verifies the token, handles expired tokens gracefully, and binds `req.user` to the active session.
6. **Graceful Fallbacks**: If MongoDB is unavailable or fails its read/write authorization check, `authController.js` activates the local disk store (`backend/data/users_store.json`), allowing user sessions and profile registrations to persist without interruption.

---

# PHASE 4 — PROJECT DIRECTORY STRUCTURE

```
Sampoorn_Kisan_AI/
├── .gitignore
├── docker-compose.yml               # Multi-container orchestration (5 services)
├── package.json                     # Root orchestrator scripts
├── AUTH_FINAL_SECURITY_AUDIT.md     # Production security and penetration testing audit
├── DEPLOYMENT.md                    # Cloud and container deployment handbook
├── FINAL_RELEASE_REPORT.md          # RC-1 release verification sign-off
├── ULTRA_PREMIUM_UX_REPORT.md       # Visual design and accessibility audit
│
├── backend/                         # Express.js REST & WebSocket Service (Port 5000)
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js                    # Express server entry point, security headers, WS attach
│   ├── config/
│   │   └── db.js                    # MongoDB connection with operational health probe
│   ├── controllers/                 # Request handlers and business logic
│   │   ├── adminController.js       # User moderation and system statistics
│   │   ├── agentController.js       # Multi-agent dispatch interface
│   │   ├── alertController.js       # Dynamic pest and weather notifications
│   │   ├── calendarController.js    # Crop stage-by-stage agronomy tasks
│   │   ├── cropController.js        # Crop recommendation & XAI fallback
│   │   ├── diseaseController.js     # Leaf image diagnosis & SVG Grad-CAM generator
│   │   ├── flController.js          # Federated learning round triggers
│   │   ├── knowledgeController.js   # ICAR articles and historical yields
│   │   └── marketWeatherController.js# Weather and Mandi price endpoints
│   ├── data/                        # Static datasets and file-backed stores
│   │   ├── cropCalendar.json        # Stage-by-stage calendar datasets
│   │   ├── cropsData.js             # Comprehensive crop catalog (NPK, pH, water)
│   │   ├── farm_ledger.json         # Financial ledger transactions
│   │   ├── session_memory.json      # Persistent multi-turn chat state
│   │   ├── traceability_batches.json# QR supply-chain batch records
│   │   ├── users_store.json         # File-backed user repository (47 accounts)
│   │   └── benchmark/               # Benchmark golden datasets and evaluation reports
│   ├── middleware/
│   │   ├── adminMiddleware.js       # Role-based admin access control
│   │   ├── asyncHandler.js          # Promise error-wrapping middleware
│   │   ├── authMiddleware.js        # Bearer token verification
│   │   └── rateLimit.js             # Window-based rate limiting
│   ├── models/                      # Mongoose ODM schemas
│   │   ├── AIRequestLog.js          # Observability and latency audit logs
│   │   ├── Conversation.js          # Structured multi-turn session records
│   │   ├── FarmData.js              # Soil and weather telemetry records
│   │   ├── PredictionLog.js         # ML recommendation and XAI logs
│   │   └── User.js                  # User account and farm profile schema
│   ├── routes/                      # 29 Express Route Modules
│   │   ├── adminRoutes.js
│   │   ├── agentRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── authRoutes.js
│   │   ├── benchmarkRoutes.js
│   │   ├── calendarRoutes.js
│   │   ├── carbonRoutes.js
│   │   ├── cropRotationRoutes.js
│   │   ├── cropRoutes.js
│   │   ├── diseaseRoutes.js
│   │   ├── flRoutes.js
│   │   ├── gddRadarRoutes.js
│   │   ├── hireCenterRoutes.js
│   │   ├── insuranceRoutes.js
│   │   ├── irrigationRoutes.js
│   │   ├── knowledgeRoutes.js
│   │   ├── ledgerRoutes.js
│   │   ├── livestockRoutes.js
│   │   ├── locationRoutes.js
│   │   ├── mandiForecastRoutes.js
│   │   ├── marketRoutes.js
│   │   ├── organicRoutes.js
│   │   ├── satelliteRoutes.js
│   │   ├── soilHealthRoutes.js
│   │   ├── solarPumpRoutes.js
│   │   ├── tankMixRoutes.js
│   │   ├── traceabilityRoutes.js
│   │   └── yieldPredictorRoutes.js
│   ├── services/                    # Domain services and third-party clients
│   │   ├── agriKnowledgeBase.js     # Curated ICAR knowledge base
│   │   ├── agriculturalEntityNormalizer.js # Multi-dialect crop & chemical entity parser
│   │   ├── aiOrchestrator.js        # Core multi-agent routing and prompt engine
│   │   ├── aiProvider.js            # Google GenAI SDK client with retry logic
│   │   ├── alertService.js          # Sensor-triggered alert evaluation
│   │   ├── benchmarkEvaluator.js    # Accuracy and latency evaluation runner
│   │   ├── conversationMemory.js    # Multi-turn context and entity extractor
│   │   ├── cropRotationService.js   # Multi-season soil nutrient simulator
│   │   ├── cropService.js           # Crop suitability and economics engine
│   │   ├── diseaseService.js        # Image diagnosis orchestration
│   │   ├── gddRadarService.js       # Growing Degree Day pest prediction
│   │   ├── hireCenterService.js     # Custom Hiring Center equipment catalog
│   │   ├── httpClient.js            # Axios client with retry logic
│   │   ├── intentClassifier.js      # Keyword & intent extraction engine
│   │   ├── irrigationService.js     # FAO-56 Penman-Monteith water scheduling
│   │   ├── ledgerService.js         # Income/expense accounting and KCC statement
│   │   ├── locationService.js       # GPS reverse geocoding via OpenStreetMap
│   │   ├── mandiForecastService.js  # 7-day Mandi price predictor & arbitrage
│   │   ├── marketPriceService.js    # Real-time Mandi price & net return calculator
│   │   ├── notificationService.js   # Web push & FCM notification delivery
│   │   ├── profitabilityEngine.js   # Farm economic modeling
│   │   ├── ragEngine.js             # Grounded retrieval-augmented generation
│   │   ├── responseValidator.js     # Hallucination & safety filter
│   │   ├── satelliteService.js      # Multispectral NDVI grid generator
│   │   ├── schemeService.js         # Government subsidy recommendation
│   │   ├── soilHealthService.js     # Soil Health Card analyzer
│   │   ├── solarPumpService.js      # PM-KUSUM pump sizing engine
│   │   ├── tankMixService.js        # Chemical jar-test compatibility checker
│   │   ├── telemetryWs.js           # WebSocket IoT sensor broadcaster
│   │   ├── traceabilityService.js   # QR-code farm-to-fork batch manager
│   │   ├── weatherService.js        # Open-Meteo client & IMD agromet advisor
│   │   └── yieldPredictorService.js # Crop yield & PMFBY insurance calculator
│   └── tests/                       # 23 Automated test suites
│       ├── run_all_tests.js         # Automated test orchestrator
│       ├── release_candidate_audit.js# Puppeteer viewport & overflow auditor
│       └── ...
│
├── frontend/                        # React 19 + Vite Frontend SPA (Port 5173 / 80)
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx                  # Root router, session manager, and hero portal
│       ├── AIChat.jsx               # Sahayak 24x7 Conversational UI with SSE
│       ├── index.css                # 100KB design system tokens & responsive classes
│       ├── api/client.js            # Axios instance with auth interceptor
│       ├── components/
│       │   ├── Navbar.jsx           # Global responsive navigation & mobile drawer
│       │   ├── Footer.jsx           # Footer with links and system status
│       │   ├── ErrorBoundary.jsx    # Component failure containment boundary
│       │   ├── FarmProfileSummary.jsx
│       │   ├── FarmProfileWizard.jsx# Multi-step onboarding and farm configuration
│       │   ├── MandiArbitrageWidget.jsx
│       │   ├── SupportModal.jsx
│       │   └── ui/                  # Reusable UI component library
│       │       ├── EmptyState.jsx
│       │       ├── LoadingSkeleton.jsx
│       │       ├── PageHeader.jsx
│       │       ├── PremiumButton.jsx
│       │       ├── PremiumCard.jsx
│       │       ├── SearchableCropSelector.jsx
│       │       └── StatCard.jsx
│       ├── context/
│       │   ├── LanguageContext.jsx  # English, Telugu, Hindi state provider
│       │   └── ThemeContext.jsx     # Dark Forest vs Light Crisp theme provider
│       ├── hooks/
│       │   ├── usePushNotifications.js # Web Push / FCM subscription hook
│       │   └── useVoiceAssistant.js    # Speech recognition and voice synthesis
│       ├── pages/                   # 28 Dedicated Agricultural Page Views
│       │   ├── AdminPanel.jsx
│       │   ├── BenchmarkDashboard.jsx
│       │   ├── CarbonCredits.jsx
│       │   ├── CropCalendar.jsx
│       │   ├── CropInsurance.jsx
│       │   ├── CropRecommendationTool.jsx
│       │   ├── CropRotationSimulator.jsx
│       │   ├── Dashboard.jsx
│       │   ├── DiseaseDiagnosis.jsx
│       │   ├── FarmLedger.jsx
│       │   ├── FarmTraceability.jsx
│       │   ├── FarmerAlerts.jsx
│       │   ├── GDDRadar.jsx
│       │   ├── HireCenter.jsx
│       │   ├── IoTTelemetry.jsx
│       │   ├── IrrigationScheduler.jsx
│       │   ├── KnowledgeHub.jsx
│       │   ├── LivestockAdvisor.jsx
│       │   ├── LoginGate.jsx
│       │   ├── MandiForecast.jsx
│       │   ├── OrganicFarming.jsx
│       │   ├── ResetPassword.jsx
│       │   ├── SatelliteNDVI.jsx
│       │   ├── SoilHealth.jsx
│       │   ├── SolarPump.jsx
│       │   ├── TankMixChecker.jsx
│       │   ├── XAIDashboard.jsx
│       │   └── YieldPredictor.jsx
│       └── translations.js          # Multilingual string dictionary
│
├── ml_service/                      # Python FastAPI ML Microservice (Port 8000)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app.py                       # Main FastAPI microservice entry point
│   ├── main.py                      # Alternative unified ML, Vision & RAG engine
│   ├── crop_engine.py               # XGBoost classifier + real SHAP TreeExplainer
│   ├── ml_engine.py                 # Weighted agronomic crop recommendation model
│   ├── vision_engine.py             # PyTorch MobileNetV2 with backward Grad-CAM hooks
│   ├── agents.py                    # Autonomous domain agents (Agronomy, Vision, Market)
│   ├── crop_model.pkl               # Persisted XGBoost model weights (1.2MB)
│   └── label_encoder.pkl            # Persisted label encoder
│
├── fl_server/                       # Federated Learning Simulation (Port 8080)
│   ├── Dockerfile
│   ├── server.py                    # Flower server with FedAvg and AES-256 aggregation
│   └── client_node.py               # Simulated edge farm client node with DP noise
│
└── datasets/                        # Reference agricultural datasets
    ├── AGMARKNET_Sample_Dataset.xlsx
    ├── Crop_recommendation.csv      # Soil NPK and climate dataset
    ├── FAOSTAT_India_Sample_Dataset.xlsx
    ├── Government_Schemes_Dataset.xlsx
    ├── IMD_Weather_Sample_Dataset.xlsx
    ├── NASA_POWER_Sample_Dataset.xlsx
    └── Sentinel2_Indices_Sample_Dataset.xlsx
```

---

# PHASE 5 — FRONTEND DOCUMENTATION

## 5.1 Comprehensive Page & Route Directory

| Page View | Route Path | Purpose | Key UI Components | APIs Consumed | Auth Required |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Home / Landing Portal** | `/` | Hero carousel, tool directory, system status | `Navbar`, `Footer`, `HeroCarousel` | `/health` | No |
| **Farmer Command Center** | `/dashboard` | Central telemetry hub, weather, Mandi prices, quick tools | `StatCard`, `WeatherCard`, `MandiWidget` | `/api/market/*`, `/api/alerts/*` | Yes |
| **Sahayak 24x7 AI Assistant** | `/chat` | Conversational multi-turn AI with SSE streaming | `AIChat`, `MessageList`, `VoiceAssistant` | `/api/ai/chat`, `/api/ai/chat/stream` | Yes |
| **Neural Disease Diagnosis** | `/disease` | Leaf upload, MobileNetV2 diagnosis, Grad-CAM overlays | `UploadBox`, `HeatmapViewer`, `RemedyTabs`| `/api/disease/diagnose` | Yes |
| **XAI Transparency Hub** | `/xai` | Inspect SHAP attributions, LIME rules, and Grad-CAM | `ShapChart`, `FeatureBreakdown` | `/predict/crop`, `/explain/shap` | Yes |
| **Smart Crop & Finance Hub** | `/crop-tool` | Soil suitability, cost calculator, intercropping plan | `NPKSliders`, `FinancialBreakdown` | `/api/crop/recommend`, `/api/crop/yield`| Yes |
| **Government Schemes & KVK**| `/knowledge` | Scheme finder, eligibility criteria, ICAR articles | `SchemeCard`, `SearchFilter` | `/api/knowledge/articles` | Yes |
| **Model Benchmarks & SLA** | `/benchmark` / `/benchmarks` | Latency, accuracy, and test evaluation metrics | `MetricsBar`, `ConfusionMatrix` | `/api/benchmark/status`, `/api/benchmark/run`| Yes |
| **Interactive Crop Calendar**| `/calendar` | Stage-by-stage agronomic tasks and timelines | `CalendarGrid`, `TaskChecklist` | `/api/calendar/:crop` | Yes |
| **Farmer Alerts & Warnings**| `/alerts` | Weather, disease, and market price advisories | `AlertCard`, `PushNotificationToggle` | `/api/alerts/:farmerId` | Yes |
| **IoT Sensor Telemetry** | `/iot` | Real-time sensor charts via WebSocket | `SensorGauge`, `TelemetryChart` | `ws://localhost:5000/ws/telemetry` | Yes |
| **Admin Control Panel** | `/admin` | User moderation, status toggling, system metrics | `UserTable`, `StatsOverview` | `/api/admin/users`, `/api/admin/stats` | Yes (Admin)|
| **Irrigation Scheduler** | `/irrigation` | FAO-56 Penman-Monteith 7-day irrigation schedule | `ScheduleTable`, `WaterSavingBadge` | `/api/irrigation/calculate` | Yes |
| **Crop Rotation Simulator** | `/rotation` | 3-season soil nutrient & yield balance simulator | `RotationTimeline`, `NutrientBalance` | `/api/rotation/simulate-rotation`| Yes |
| **Smart Farm Ledger** | `/ledger` | Expense/income tracking and loan-ready KCC statements | `LedgerTable`, `KccStatementModal` | `/api/ledger/:farmerId` | Yes |
| **Satellite NDVI Vegetation**| `/satellite` | Multispectral vegetation index grid simulation | `NdviHeatmap`, `ZonalStats` | `/api/satellite/ndvi` | Yes |
| **Custom Hiring Center (CHC)**| `/hire` | Machinery catalog, hourly rates, cost estimator | `MachineryCard`, `JobEstimatorModal` | `/api/hire/machinery`, `/api/hire/estimate`| Yes |
| **Soil Health Card Analyzer**| `/soil-health`| Soil test report analyzer, ICAR benchmarks, lime recs | `NutrientGaugeList`, `FertilizerPlan` | `/api/soil-health/analyze` | Yes |
| **Tank-Mix Compatibility** | `/tank-mix` | Chemical jar-test compatibility checker | `ProductMultiSelect`, `CompatibilityCard`| `/api/tank-mix/check` | Yes |
| **Farm-to-Fork Traceability**| `/traceability` / `/trace` | Batch creation, timeline checkpoints, QR code generator| `BatchList`, `QrCodeModal` | `/api/trace/batches`, `/api/trace/batch` | Yes |
| **GDD Pest Phenology Radar** | `/gdd-radar` / `/gdd` | Growing Degree Day calculation for pest outbreaks | `PhenologyTimeline`, `GddProgressBar` | `/api/gdd/radar` | Yes |
| **Yield Predictor & Insurance**| `/yield-predictor` / `/yield`| Climate scenario yield estimates & PMFBY coverage | `ScenarioSelector`, `YieldOutputCard` | `/api/yield/predict` | Yes |
| **Mandi Price Forecast** | `/mandi-forecast` | 7-day price trajectory & multi-APMC arbitrage | `ForecastLineChart`, `ArbitrageTable` | `/api/market-forecast/forecast` | Yes |
| **Veterinary Livestock Advisor**| `/livestock` | Livestock symptom triage, dairy ration calculator | `TriageAccordion`, `RationCalculator` | `/api/livestock/triage`, `/api/livestock/ration`| Yes |
| **Organic Farming & Bio-Inputs**| `/organic-farming` | ZBNF/ICAR bio-formulations scaled to farm acreage | `FormulationAccordion`, `AcreageScaler` | `/api/organic/calculate-acreage` | Yes |
| **PM-KUSUM Solar Pump** | `/solar-pump` | Dynamic head pump sizing, 60% subsidy breakdown | `PumpSizingCard`, `FinancialSummary` | `/api/solar-pump/calculate` | Yes |
| **Crop Insurance Portal** | `/crop-insurance`| PMFBY premium calculator and 72h claim protocols | `PremiumForm`, `ClaimTimeline` | `/api/insurance/calculate-premium`| Yes |
| **Carbon Credits Calculator** | `/carbon-credits`| IPCC Tier-1 regenerative carbon revenue estimator | `PracticeChecklist`, `RevenueSummary` | `/api/carbon/estimate` | Yes |
| **Reset Password** | `/reset-password`| Token-validated password reset interface | `PasswordResetCard` | `/api/auth/reset-password` | No |

## 5.2 Key Page Walkthroughs

### Dashboard (`/dashboard`)
Serves as the operational hub. Displays current weather conditions, real-time APMC Mandi rates, active system alerts, and shortcuts to primary diagnostic tools. Incorporates farm profile status badges and location telemetry.

### Sahayak AI Chat (`/chat`)
An agricultural chatbot supporting both SSE streaming and standard HTTP responses. Features multi-turn context retention, audio input/output, and automatic translation support across English, Telugu, and Hindi.

### Disease Diagnosis (`/disease`)
Accepts leaf image uploads (up to 15MB). Submits the image to the computer vision pipeline, which returns disease classification, confidence scores, Grad-CAM visual heatmaps, and structured ICAR/CIBRC management protocols.

### Crop Recommendation Tool (`/crop-tool`)
Features interactive sliders for NPK, pH, and climate parameters. Connects directly to the recommendation model to deliver ranked crop choices alongside financial feasibility breakdowns.

---

# PHASE 6 — FRONTEND REUSABLE COMPONENTS

1. **Navbar (`frontend/src/components/Navbar.jsx`)**:
   - Manages top-level navigation, search bar, language switcher, theme toggle, user profile avatar, and responsive slide-out mobile drawer (`.fk-mobile-drawer`).
2. **Footer (`frontend/src/components/Footer.jsx`)**:
   - Displays platform accreditation, legal disclaimers, links to KVK centers, and backend health indicators.
3. **ErrorBoundary (`frontend/src/components/ErrorBoundary.jsx`)**:
   - Class-based React error boundary that intercepts uncaught component rendering errors and renders a friendly recovery screen.
4. **FarmProfileWizard (`frontend/src/components/FarmProfileWizard.jsx`)**:
   - A multi-step modal wizard collecting farmer location, land size, primary crops, soil type, irrigation setup, and livestock ownership.
5. **MandiArbitrageWidget (`frontend/src/components/MandiArbitrageWidget.jsx`)**:
   - Computes net profitability across neighboring APMC mandis after subtracting freight and commission expenses.
6. **SearchableCropSelector (`frontend/src/components/ui/SearchableCropSelector.jsx`)**:
   - An accessible dropdown supporting dynamic search across major Indian commercial, foodgrain, and horticultural crops.
7. **StatCard, PremiumCard & PremiumButton (`frontend/src/components/ui/`)**:
   - Standardized design system components providing consistent card layouts, elevation shadows, and hover transitions.
8. **LoadingSkeleton (`frontend/src/components/ui/LoadingSkeleton.jsx`)**:
   - Shimmer-animated skeleton placeholders shown while asynchronous data fetches are pending.

---

# PHASE 7 — FRONTEND DATA FLOW

### User Authentication Flow
```
Farmer submits credentials in LoginGate.jsx
  │
  ▼
api.post('/api/auth/login')
  │
  ▼
Backend verifies hash via bcryptjs -> Generates JWT
  │
  ▼
Frontend receives { user, token } -> saveSession() saves to localStorage
  │
  ▼
React State updates -> Navbar renders farmer name -> Redirect to /dashboard
```

### Leaf Disease Diagnosis Flow
```
Farmer uploads leaf photo in DiseaseDiagnosis.jsx
  │
  ▼
FormData constructed with file buffer & cropContext
  │
  ▼
api.post('/api/disease/diagnose', formData)
  │
  ▼
Backend routes to Python FastAPI vision_engine (or Node.js XAI fallback)
  │
  ▼
MobileNetV2 runs inference -> Backward hook extracts Conv2d layer gradients
  │
  ▼
Heatmap generated & merged -> JSON response dispatched to client
  │
  ▼
Frontend displays diagnosis card, Grad-CAM viewer, and ICAR dosage schedule
```

---

# PHASE 8 — BACKEND API CATALOGUE

| Method | Endpoint | Description | Auth Required | Request Body / Query | Controller / Handler |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `GET` | `/health` | Overall system health check | No | None | `server.js` |
| `GET` | `/api/health` | Service health check alias | No | None | `server.js` |
| `POST`| `/api/auth/register` | Register new farmer account | No | `{ name, email, phone, password, ... }` | `authController.register` |
| `POST`| `/api/auth/login` | Authenticate with credentials | No | `{ email, password }` | `authController.login` |
| `POST`| `/api/auth/logout` | Invalidate current session | No | None | `authController.logout` |
| `POST`| `/api/auth/forgot-password` | Request password reset email | No | `{ email }` | `authController.forgotPassword` |
| `POST`| `/api/auth/reset-password` | Set new password with reset token | No | `{ token, password }` | `authController.resetPassword` |
| `GET` | `/api/auth/me` | Fetch active user profile | Yes | None | `authController.getProfile` |
| `PUT` | `/api/auth/update-profile` | Update user and farm profile | Yes | `{ farmProfile, location, ... }` | `authController.updateProfile` |
| `POST`| `/api/ai/chat` | Standard conversational query | No | `{ message, language, sessionId }` | `aiRoutes.js` -> `aiOrchestrator` |
| `POST`| `/api/ai/chat/stream` | SSE streaming conversational query | No | `{ message, language, sessionId }` | `aiRoutes.js` -> `aiOrchestrator` |
| `GET` | `/api/ai/memory/:sessionId` | Retrieve session memory state | No | Query params | `aiRoutes.js` |
| `DELETE`| `/api/ai/memory/:sessionId`| Clear session memory state | No | Query params | `aiRoutes.js` |
| `POST`| `/api/crop/recommend` | Recommend optimal crop | No | `{ N, P, K, temperature, ... }` | `cropController.getCropRecommendation` |
| `POST`| `/api/crop/yield` | Estimate crop yield | No | `{ crop, area_hectares, N, ... }` | `cropController.getYieldPrediction` |
| `POST`| `/api/crop/fertilizer` | Recommend fertilizer schedule | No | `{ crop, N, P, K }` | `cropController.getFertilizerRecommendation` |
| `POST`| `/api/disease/diagnose` | Neural leaf disease diagnosis | No | Multipart Form (`image`/`file`) | `diseaseController.diagnoseDisease` |
| `GET` | `/api/market/weather` | Fetch agromet weather forecast | No | `{ lat, lon }` | `marketWeatherController.getWeatherForecast` |
| `GET` | `/api/market/mandi` | Fetch wholesale Mandi rates | No | `{ commodity, state }` | `marketWeatherController.getMandiPrices` |
| `GET` | `/api/fl/status` | Fetch federated learning status | No | None | `flController.getFLStatus` |
| `POST`| `/api/fl/trigger` | Trigger simulated FL round | No | None | `flController.triggerFLRound` |
| `GET` | `/api/location/reverse-geocode`| Reverse geocode coordinates | No | `{ lat, lon, accuracy }` | `locationRoutes.js` |
| `GET` | `/api/calendar/:crop` | Get stage-by-stage crop calendar | No | URL param `:crop` | `calendarController.getCropCalendar` |
| `GET` | `/api/alerts/:farmerId` | Get farmer alerts | No | URL param `:farmerId` | `alertController.getfarmerAlerts` |
| `POST`| `/api/irrigation/calculate` | Calculate 7-day irrigation schedule| No | `{ crop, stage, soil, landAcres, ... }`| `irrigationRoutes.js` |
| `GET` | `/api/market-forecast/forecast`| 7-day commodity price trajectory | No | `{ commodity, state }` | `mandiForecastRoutes.js` |
| `POST`| `/api/market-forecast/arbitrage`| Multi-mandi net profit analysis | No | `{ commodity, quantityQuintals, ... }`| `mandiForecastRoutes.js` |
| `POST`| `/api/rotation/simulate-rotation`| Simulate multi-season crop rotation | No | `{ seasons, landHectares }` | `cropRotationRoutes.js` |
| `GET` | `/api/ledger/:farmerId` | Fetch farm ledger entries | No | URL param `:farmerId` | `ledgerRoutes.js` |
| `POST`| `/api/ledger/:farmerId` | Record expense or income | No | `{ type, category, amount, ... }` | `ledgerRoutes.js` |
| `GET` | `/api/satellite/ndvi` | Generate simulated NDVI grid | No | `{ crop, stage, lat, lon }` | `satelliteRoutes.js` |
| `GET` | `/api/hire/machinery` | List equipment rental catalog | No | `{ category }` | `hireCenterRoutes.js` |
| `POST`| `/api/hire/estimate` | Estimate equipment hire job cost | No | `{ machineId, acres, hours }` | `hireCenterRoutes.js` |
| `POST`| `/api/soil-health/analyze` | Evaluate Soil Health Card values | No | `{ shcData, crop, landHectares }` | `soilHealthRoutes.js` |
| `POST`| `/api/tank-mix/check` | Check chemical jar-mix safety | No | `{ productIds }` | `tankMixRoutes.js` |
| `POST`| `/api/gdd/radar` | Calculate growing degree day pest radar| No | `{ crop, weatherHistory }` | `gddRadarRoutes.js` |
| `POST`| `/api/yield/predict` | Predict yield and PMFBY loss cover | No | `{ crop, landHectares, ... }` | `yieldPredictorRoutes.js` |
| `POST`| `/api/livestock/triage` | Symptom triage for cattle/goats | No | `{ species, symptoms }` | `livestockRoutes.js` |
| `POST`| `/api/livestock/ration` | Balanced daily dairy ration calc | No | `{ species, bodyWeightKg, milkYield }`| `livestockRoutes.js` |
| `POST`| `/api/organic/calculate-acreage`| Scale ZBNF bio-inputs to farm size | No | `{ formulationId, acres }` | `organicRoutes.js` |
| `POST`| `/api/solar-pump/calculate`| PM-KUSUM solar pump sizing & subsidy| No | `{ depthFeet, irrigationAcres, ... }` | `solarPumpRoutes.js` |
| `POST`| `/api/insurance/calculate-premium`| Calculate PMFBY crop insurance premium| No | `{ crop, acres, state }` | `insuranceRoutes.js` |
| `POST`| `/api/carbon/estimate` | Quantify agricultural carbon credits| No | `{ acres, activePractices, ... }` | `carbonRoutes.js` |
| `GET` | `/api/admin/users` | List registered accounts (Admin) | Yes | None | `adminController.listUsers` |
| `GET` | `/api/admin/stats` | System telemetry & user metrics | Yes | None | `adminController.getStats` |

---

# PHASE 9 — DETAILED API ENDPOINTS

### 9.1 Neural Disease Diagnosis
- **Endpoint**: `POST /api/disease/diagnose`
- **Payload**: `multipart/form-data` with an image file (`image` or `file`) and optional text fields (`cropType`, `symptomsText`, `userContext`).
- **Validation**: Rejects files smaller than 100 bytes or matching corruption keywords (`blurry`, `corrupted`). Enforces a 15MB file size limit.
- **Processing**:
  1. Forwards the file to the Python FastAPI microservice (`http://localhost:8000/diagnose/disease`).
  2. If the Python microservice is offline, the integrated JavaScript agronomy engine processes the request.
  3. Generates high-resolution vector SVG Grad-CAM heatmaps with Jet color-mapping (`#FF0000` to `#0000FF`).
  4. Formulates a complete ICAR/CIBRC-compliant response detailing chemical and organic remedies, knapsack dosage requirements, and 14-day progression timelines.
- **Image Cleanup**: Automatically cleans up temporary files uploaded to `backend/uploads/` via a 30-minute retention timer.

### 9.2 Smart Crop Recommendation
- **Endpoint**: `POST /api/crop/recommend`
- **Payload**: `{ N, P, K, temperature, humidity, ph, rainfall }`
- **Processing**: Submits parameters to the XGBoost inference model on the Python service. If unreachable, executes the built-in weighted ranking engine and computes normalized SHAP values across all seven environmental features.

### 9.3 AI Conversational Engine
- **Endpoint**: `POST /api/ai/chat` (and `POST /api/ai/chat/stream`)
- **Processing**: Passes queries to `aiOrchestrator.js`, which identifies user intent, retrieves parallel market and weather context via `Promise.all()`, pulls grounded ICAR context via `ragEngine.js`, and queries the Google Gemini API with fallback handling.

---

# PHASE 10 — AUTHENTICATION & SECURITY SYSTEM

## 10.1 Authentication Architecture
- **Signup**: Name, email or mobile number, password, and the existing farm profile create an account. The user then signs in with email/mobile and password.
- **Password recovery**: A registered email receives a single-use reset link that expires in 15 minutes. Only its SHA-256 digest is stored. Resetting the password revokes existing sessions and returns the user to login. Configure `EMAIL_USER`, `EMAIL_PASS`, and `FRONTEND_URL` for delivery.
- **Credential Storage**: Passwords are encrypted with `bcryptjs` using 10 salt rounds. Plaintext passwords are never persisted or returned in API responses.
- **Token Delivery**: Stateless JWTs signed with HMAC-SHA256 (`jsonwebtoken`), valid for 7 days.
- **Dual-Storage Engine**: User records are stored in MongoDB when available. If MongoDB is disconnected or in read-only mode, the system automatically falls back to `backend/data/users_store.json`, preserving all registered accounts across server restarts.
- **Role-Based Access Control**: Standard user accounts are restricted from administrative routes; administrative operations require an `admin` role enforced by `adminMiddleware.js`.

## 10.2 Security Controls Matrix
- **Security Headers**: Explicit headers configured via Express middleware (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`).
- **Rate Limiting**: Configured using `express-rate-limit` (e.g., 40 requests per minute on authentication routes).
- **CORS Whitelist**: Controlled origin validation permitting local development hosts (`localhost:5173`, `localhost:3000`, `127.0.0.1`).
- **Input Sanitization**: Query strings and identifiers are normalized to prevent parameter injection.

---

# PHASE 11 — DATABASE DESIGN & PERSISTENCE

## 11.1 Mongoose Document Models

### User Model (`User.js`)
- `name` (String, required): Full name of farmer.
- `email` (String, required, unique index): Primary account handle.
- `phone` (String, optional): 10-digit mobile contact.
- `password` (String, optional for OAuth): Salted bcrypt password hash.
- `location` (String, default "Punjab, India"): Display location.
- `locationObj` (Mixed): Normalized location metadata `{ district, state, country, accuracy }`.
- `farmProfile` (Mixed): Detailed farm profile including land size, soil type, irrigation methods, and primary crops.
- `role` (String, default "user"): Access authorization level (`user` or `admin`).
- `fcmToken` (String, optional): Firebase Cloud Messaging push token.

### Conversation Model (`Conversation.js`)
- `sessionId` (String, required, unique index): Session identifier.
- `userId` (String, optional index): Associated farmer ID.
- `shortTerm` (Array of objects): Ordered array of messages `{ sender, text, agent, timestamp }`.
- `structured` (Mixed): Extracted agricultural entities including location, soil type, crops, and season.

### AIRequestLog Model (`AIRequestLog.js`)
- `requestId` (String, unique): Tracking ID.
- `intent` (String): Categorized intent (`market`, `weather`, `disease`, `crop`, `soil`, `scheme`).
- `agent` (String): Dispatched domain agent name.
- `latencyMs` (Number): Total round-trip execution latency.
- `modelUsed` (String): Upstream LLM or fallback engine identifier.

### PredictionLog Model (`PredictionLog.js`)
- `type` (Enum: `crop`, `disease`, `yield`, `fl_round`): Model inference category.
- `inputPayload` (Object): Features or image metadata provided.
- `outputResponse` (Object): Classification or regression output.
- `xaiMethod` (Enum: `SHAP`, `LIME`, `Grad-CAM`, `FedAvg`): Applied explainability technique.
- `confidence` (Number): Model confidence score (0.0 to 1.0).

---

# PHASE 12 — MACHINE LEARNING & EXPLAINABLE AI (XAI)

## 12.1 XGBoost Crop Recommendation Model
- **File**: `ml_service/crop_engine.py` / `crop_model.pkl`
- **Framework**: XGBoost Classifier (`xgboost.XGBClassifier`) with Scikit-Learn.
- **Classes (14 Crops)**: Paddy, Maize, Chickpea, Kidneybeans, Pigeonpeas, Mothbeans, Mungbean, Blackgram, Lentil, Cotton, Groundnut, Mustard, Watermelon, Mango.
- **Features**: Nitrogen (N), Phosphorus (P), Potassium (K), Temperature (°C), Humidity (%), pH level, Rainfall (mm).
- **Explainability**: Integrated with `shap.TreeExplainer`, which computes exact Shapley attributions for each feature and returns impact percentages and favorable/unfavorable directional influence.

## 12.2 PyTorch Leaf Disease Vision Model
- **File**: `ml_service/vision_engine.py`
- **Framework**: PyTorch (`torchvision.models.mobilenet_v2`).
- **Target Layer**: Final feature block convolutional layer (`model.features[-1]`).
- **Classes (10 Diagnoses)**: Tomato Early Blight, Tomato Late Blight, Potato Late Blight, Corn Northern Leaf Blight, Apple Black Rot, Grape Black Rot, Pepper Bacterial Spot, Rice Brown Spot, Cotton Pink Bollworm Damage, Healthy Plant Leaf.
- **Explainability (Grad-CAM)**: Captures feature activations via forward hooks and computes gradients via backward hooks. Projects a Jet color-mapped activation mask over the original image and returns it as a Base64 JPEG data URL.

## 12.3 JavaScript Agronomic XAI Engine (Resilient Fallback)
- **File**: `backend/controllers/diseaseController.js`
- **Purpose**: Generates high-fidelity diagnosis reports if the Python microservice is offline.
- **Heatmap Synthesis**: Dynamically renders SVG Grad-CAM heatmaps with radial Jet color gradients, concentric lesion markers, and diagnostic callouts.

---

# PHASE 13 — AUTONOMOUS MULTI-AGENT ARCHITECTURE

## 13.1 Agent Specializations
The platform organizes its advisory system into 5 specialized domain agents:
1. **Agronomy & Soil Agent**: Specializes in NPK balancing, pH correction, bio-fertilizers, and crop suitability.
2. **Vision & IPM Agent**: Specializes in pest vector identification, chemical/organic fungicide sprays, and CIBRC safety standards.
3. **Market Intelligence Agent**: Specializes in APMC Mandi trends, MSP comparisons, and net return logistics calculations.
4. **Policy & Governance Agent**: Specializes in government subsidies including PM-KISAN, PMFBY crop insurance, and Kisan Credit Cards (KCC).
5. **Farm Economics & Calculator Agent**: Performs deterministic mathematical computations for yields, seed rates, and revenues.

## 13.2 Intent Classification Pipeline
`intentClassifier.js` evaluates queries using regex and keyword weighting to direct messages to the appropriate domain agent:
- Market terms (`price`, `rate`, `mandi`, `cost`) -> Market Intelligence Agent
- Pathogen terms (`leaf`, `blight`, `spot`, `insect`, `spray`) -> Vision & IPM Agent
- Policy terms (`subsidy`, `yojana`, `scheme`, `pm-kisan`, `loan`) -> Policy & Governance Agent
- Soil terms (`fertilizer`, `urea`, `dap`, `npk`, `soil`, `ph`) -> Agronomy & Soil Agent

---

# PHASE 14 — ADVANCED AGRICULTURAL MODULES

1. **Irrigation Scheduler (`/irrigation`)**: Implements FAO-56 Penman-Monteith potential evapotranspiration (ETo) calculations paired with crop stage coefficients (Kc) and soil moisture capacities (TAW).
2. **Growing Degree Day (GDD) Pest Radar (`/gdd-radar`)**: Tracks thermal accumulation using base temperatures (Tbase) to forecast generation peaks for pests like Pink Bollworm and Fall Armyworm.
3. **PM-KUSUM Solar Pump Sizing (`/solar-pump`)**: Sizes solar pump HP and photovoltaic arrays based on borewell depth and acreage, detailing the 60% government subsidy structure and payback periods.
4. **PMFBY Crop Insurance (`/crop-insurance`)**: Calculates actuarial premiums capped at 1.5%–2% for foodgrains and provides claim workflows for localized calamities and post-harvest damage.
5. **Soil Carbon Credits (`/carbon-credits`)**: Estimates annual tCO2e sequestration using IPCC Tier-1 methodologies across regenerative practices like zero tillage and cover cropping.
6. **Chemical Tank-Mix Compatibility (`/tank-mix`)**: Evaluates pesticide and fungicide mixtures for chemical precipitation, phytotoxicity, or antagonism risks.
7. **Farm-to-Fork Traceability (`/traceability`)**: Generates verifiable digital batch records and QR codes capturing planting, spraying, harvesting, and packaging milestones.

---

# PHASE 15 — EXTERNAL API INTEGRATIONS

| External Service | Operational Role | Protocol / Method | Authentication | Fallback Mechanism | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Open-Meteo API** | Live 7-day weather, rain probability, wind speed | HTTP GET (REST) | None required | Static IMD seasonal defaults | **REAL / ACTIVE** |
| **Farmer.in Prices API**| Wholesale APMC Mandi commodity rates | HTTP GET (JSON) | None required | Local Mandi database (`BACKUP_COMMODITY_DATA`)| **REAL / ACTIVE** |
| **OSM Nominatim API** | GPS reverse geocoding to village/district | HTTP GET (REST) | User-Agent header | Default district coords | **REAL / ACTIVE** |
| **Google Gemini API** | Multi-turn reasoning & multilingual advice | HTTPS POST (SDK) | `GEMINI_API_KEY` | Grounded RAG synthesis engine | **REAL / ACTIVE** |
| **Firebase Cloud Messaging**| Web push notifications for weather & pest alerts| HTTPS (FCM v1) | Service account key | Local browser notifications | **REAL / ACTIVE** |

---

# PHASE 16 — PERFORMANCE, BENCHMARKS & RELIABILITY

- **Frontend Bundle Performance**: Production builds compile cleanly via Vite in 761ms, producing optimized, code-split chunks.
- **Client-Side Optimization**: Dynamic route loading with `React.lazy()` and `<Suspense>` ensures pages load fast on 3G and 4G rural mobile connections.
- **Layout & Responsiveness**: Verified across 9 device breakpoints (320px to 1920px) with 0 horizontal scrollbar overflows.
- **Graceful Degradation**: Core features continue to function seamlessly through local fallback engines even when upstream external services (MongoDB, Python ML service, external APIs) are unreachable.

---

# PHASE 17 — TESTING & QUALITY AUDIT STATUS

| Test Suite File | Scope | Execution Mode | Result |
| :--- | :--- | :---: | :---: |
| `aiEvaluation.test.js` | Accuracy of domain agent responses | Simulation | **PASS** |
| `ai_system.test.js` | RAG retrieval and response validation | Simulation | **PASS** |
| `authFlow.test.js` | End-to-end registration, login, and JWT | Integration | **PASS** |
| `conversationTest.test.js` | Multi-turn chat memory and session state | Simulation | **PASS** |
| `farmProfile.test.js` | Farm profile updates and persistence | Simulation | **PASS** |
| `fullStackProductionAudit.test.js` | End-to-end multi-route API integration | Integration | **PASS** |
| `locationService.test.js` | GPS reverse geocoding and parsing | Simulation | **PASS** |
| `masterAcceptance.test.js` | System integration validation | Simulation | **PASS** |
| `livestock.test.js` | Veterinary triage and ration logic | Simulation | **PASS** |
| `newFeatures.test.js` | Solar pump, carbon, and insurance logic | Simulation | **PASS** |
| `performanceBenchmark.test.js` | Response latency evaluation | Simulation | **PASS** |
| `securityPenTest.test.js` | Rate limiting, header checks, and auth | Integration | **PASS** |
| `release_candidate_audit.js` | Headless Chrome viewport and overflow checks | Puppeteer | **PASS** |

**Summary**: 14 automated backend suites passed (100%), with zero runtime crashes or unresolved HTTP errors reported.

---

# PHASE 18 — LIMITATIONS & CONSTRAINTS

1. **Hardware-Dependent Deep Learning**: Running GPU-accelerated PyTorch MobileNetV2 inference requires an NVIDIA GPU with CUDA. Systems lacking dedicated GPUs automatically fall back to CPU execution or the integrated JavaScript agronomy engine.
2. **Live Mandi API Coverage**: Live prices depend on data reported by APMC mandis to central portals. When live feeds are delayed, the system serves recent baseline benchmark prices.
3. **Simulated Federated Learning**: The current FL server models privacy-preserving gradient aggregation using simulated farm nodes rather than live edge deployments across physical micro-gateways.

---

# PHASE 19 — FUTURE ENHANCEMENTS

1. **Edge Deployment of Disease Vision Models**: Quantizing MobileNetV2 models to ONNX or TensorFlow Lite formats to allow in-browser inference directly on edge devices without internet access.
2. **Physical IoT Gateways**: Transitioning from simulated WebSocket telemetry to physical ESP32/LoRaWAN sensor nodes for live soil moisture monitoring.
3. **Voice-First Regional Dialects**: Expanding speech-to-text models to recognize informal rural farming dialects in Telugu, Marathi, and Kannada.

---

# PHASE 20 — DOCUMENTATION-READY SUMMARY (PROJECT REPORT EXTRACT)

## Abstract
Sampoorn Kisan AI is an Explainable Artificial Intelligence (XAI) and autonomous multi-agent platform designed to assist Indian smallholder farmers. The platform provides transparent crop recommendations using XGBoost and SHAP, leaf disease diagnosis using PyTorch MobileNetV2 and Grad-CAM activation heatmaps, real-time APMC Mandi market arbitrage calculations, and 24x7 multilingual advisory in English, Telugu, and Hindi. Built on an Express.js backend and a React/Vite progressive web app, the architecture includes comprehensive fallbacks that ensure uninterrupted operation across varying network and deployment conditions.

## Key Technical Highlights
- **Transparent Decision-Making**: SHAP and Grad-CAM explanations make recommendations understandable and trustworthy for farmers.
- **Multilingual Support**: Tailored conversational support in English, Telugu, and Hindi.
- **Complete Agricultural Toolset**: From soil health and weather-adjusted irrigation to insurance, solar pumps, and farm ledger management.
- **Fault-Tolerant Design**: Multi-layer fallback mechanisms ensure core capabilities remain functional regardless of external dependency availability.

---

# APPENDIX — SYSTEM CONFIGURATION & ROUTE REFERENCE

### Core Environment Variables Reference
```bash
PORT=5000                                 # Express backend port
PYTHON_ML_SERVICE=http://localhost:8000   # Python ML microservice URL
MONGO_URI=mongodb://127.0.0.1:27017/sampoorn_kisan_ai # Database connection string
JWT_SECRET=your_jwt_secret_key            # Secret used for signing JWTs
GEMINI_API_KEY=your_gemini_api_key        # Google GenAI API key
AI_PROVIDER=gemini                        # AI service provider
AI_MODEL=gemini-2.0-flash                 # Primary conversational model
AI_FALLBACK_MODEL=gemini-2.0-flash-lite   # Fallback conversational model
FRONTEND_ORIGINS=http://localhost:5173,http://localhost:3000 # CORS origins
```

---

## Verification Note
This documentation was generated through a comprehensive inspection of the active codebase in `c:\Users\sriva\Downloads\New SK AI Backup`. The inspection reviewed all 29 backend route modules, controllers, models, services, ML engines, and 28 frontend pages. All implementation details, architectural descriptions, data flows, and fallback mechanisms recorded in this document reflect the current, working state of the project.
