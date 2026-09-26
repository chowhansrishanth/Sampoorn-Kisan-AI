# 🚀 Sampoorn Kisan AI — Production Deployment & Operations Guide

## 1. System Architecture & Topology

Sampoorn Kisan AI is designed as a distributed, high-availability agricultural intelligence platform:
- **Frontend SPA**: React 18 + Vite, client-side route code-splitting, accessible PWA-ready responsive UI.
- **Node.js Core Backend**: Express.js API gateway, multi-agent AI orchestrator, in-flight deduplication cache, location geocoder, atomic disk storage fallback.
- **Python ML Vision Engine**: FastAPI + PyTorch MobileNetV2 with Explainable AI (Grad-CAM heatmaps).
- **Federated Learning Server**: Flower FL coordinator for edge-training aggregation.
- **Primary Database**: MongoDB (v6.0+) with automatic resilient local disk-persistence fallback.

---

## 2. Service Startup Order

For reliable container orchestration, start services in the following order:
1. **MongoDB**: Initialized first; must pass healthcheck (`mongosh --eval "db.adminCommand('ping')"`).
2. **Python ML Service (`ml_service`)**: Initializes PyTorch vision model on port 8000.
3. **Node.js API Backend (`backend`)**: Connects to MongoDB, probes ML service, loads disk store cache on port 5000.
4. **Federated Learning Coordinator (`fl_server`)**: Optional background aggregation node on port 8080.
5. **Frontend Web Server (`frontend`)**: Serves optimized production SPA on ports 80 / 5173.

When using Docker Compose:
```bash
docker compose up -d --build
```
`docker-compose.yml` natively orchestrates this order via healthchecks and `depends_on`.

---

## 3. Required Environment Variables

Configure these in `backend/.env` (or via your cloud secret manager):

| Variable Name | Required? | Purpose | Default / Example |
|---|---|---|---|
| `PORT` | Optional | Backend HTTP listener port | `5000` |
| `NODE_ENV` | Recommended | Application environment mode | `production` |
| `MONGO_URI` | Required for DB | MongoDB connection string | `mongodb://localhost:27017/sampoorn_kisan_ai` |
| `JWT_SECRET` | **CRITICAL** | Signing secret for authentication tokens | Secure 64-char random string |
| `GEMINI_API_KEY` | Recommended | Google GenAI API key for LLM advisory | Real Google AI Studio key |
| `AI_PROVIDER` | Optional | LLM provider backend | `gemini` |
| `AI_MODEL` | Optional | Primary AI model identifier | `gemini-2.0-flash` |
| `AI_FALLBACK_MODEL` | Optional | Fallback AI model identifier | `gemini-2.0-flash-lite` |
| `PYTHON_ML_SERVICE`| Optional | FastAPI Vision Engine URL | `http://localhost:8000` |
| `FRONTEND_ORIGINS` | Recommended | Allowed CORS origins (comma-separated) | `https://kisan.ai,http://localhost:5173` |

> [!WARNING]
> Never commit actual API keys or JWT secrets to version control. Use `.env` or cloud secret managers.

---

## 4. Graceful Fallback & Degradation Matrix

| External Dependency | Status: Healthy | Status: Down / Timeout | Graceful Fallback Behavior |
|---|---|---|---|
| **MongoDB Atlas** | Full collection persistence | Connection restricted / offline | Seamlessly activates local atomic disk stores (`users_store.json`, `session_memory.json`). Zero crashes. |
| **Google Gemini API** | Live LLM contextual generation | 404 / 401 / Quota / Timeout | Bypasses LLM; routes through APMC cache, ICAR rule base, and pre-compiled agronomic guidelines. |
| **Python Vision Engine**| Real MobileNetV2 Grad-CAM inference | Unreachable / Exception | Synthesizes ICAR CIBRC diagnostic report with dynamic SVG neural attention heatmap. |
| **APMC Mandi Feeds** | Real-time government portal prices | Network failure / Timeout | Serves verified historical APMC benchmark modal prices with explicit trust badges. |
| **Open-Meteo Weather** | Live satellite & radar telemetry | API degraded / Unreachable | Serves location-cached meteorological forecast with simulated telemetry radar. |

---

## 5. Development vs. Production Startup

### Development Mode:
```bash
# 1. Start Python Vision Engine (Terminal 1)
cd ml_service
pip install -r requirements.txt
uvicorn app:app --port 8000 --reload

# 2. Start Backend API Gateway (Terminal 2)
cd backend
npm install
npm run dev

# 3. Start Frontend UI (Terminal 3)
cd frontend
npm install
npm run dev
```

### Production Mode (Docker):
```bash
docker compose up -d --build
```
Inspect logs:
```bash
docker compose logs -f backend
```

---

## 6. Health Checks & Diagnostic Endpoints

| Endpoint | Target Component | Expected Healthy Response |
|---|---|---|
| `GET /health` | Backend & Service Mesh | `{"status":"ok","db":"online"|"in_memory_mode","ai":"online"}` |
| `GET /api/ai/health` | AI Provider Engine | `{"status":"online","provider":"gemini","primary_model":"gemini-2.0-flash"}` |
| `GET /api/fl/status` | Federated Learning Node | `{"status":"online","round":1}` |
| `GET :8000/health` | Python FastAPI ML Engine | `{"status":"healthy","model_loaded":true}` |

---

## 7. Production Backup & Disaster Recovery Strategy

1. **MongoDB Database Backup**:
   - Execute daily automated mongodump snapshots:
     ```bash
     mongodump --uri="mongodb://..." --gzip --archive=/backups/kisan_$(date +%Y%m%d).gz
     ```
   - Store compressed dumps in encrypted object storage (S3 / GCS) with 30-day lifecycle retention.
2. **Local Atomic Disk Store Backup**:
   - In single-node / edge environments where the disk store is active, back up:
     - `backend/data/users_store.json`
     - `backend/data/session_memory.json`
   - Atomic temporary swapping (`.tmp` -> rename) ensures snapshots never copy half-written or corrupted JSON.
3. **Restoration Protocol**:
   - To restore MongoDB:
     ```bash
     mongorestore --uri="mongodb://..." --gzip --archive=/backups/kisan_target.gz --drop
     ```

---

## 8. Observability & Production Monitoring

Production operators should configure alerts for:
- **API Latency**: Alert if 95th percentile latency on `/api/ai/chat` exceeds 1500ms.
- **Error Rates**: Alert if HTTP 5xx errors exceed 1% over a 5-minute rolling window.
- **Disk Utilization**: Monitor `backend/uploads/` volume to ensure auto-pruning maintains clean storage.
- **AI Fallback Frequency**: Track `cachedHealth.value.aiStatus` in Prometheus/Datadog to detect external Gemini API exhaustion.

---

## 9. Verification Boundaries

- **Verified Locally**:
  - Full automated backend test suite (14/14 suites passing, 100%).
  - Performance SLAs: pure-code calculations (<1ms), query routing (<100ms), geocoding cache (<10ms).
  - Clean production frontend build (Vite v8.1.5, 184.77 kB initial bundle).
  - Atomic persistence file locking and concurrency safety.
  - Server-side multi-user profile authorization.
  - Upload security (path traversal prevention, 15MB limit, auto-cleanup).
  - Graceful shutdown listeners on SIGTERM and SIGINT.
- **Requires Production Deployment Configuration**:
  - Production MongoDB cluster write concern (`w: majority`).
  - Production HTTPS certificate termination and reverse proxy (e.g. Nginx / Cloudflare).
  - Production cloud firewall rules, domain DNS routing, and secret management.
