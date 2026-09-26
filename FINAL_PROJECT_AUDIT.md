# Sampoorn Kisan AI — Final Project Audit

Audit date: 2026-09-22

## Scope and preservation

- The existing project was retained in place; no earlier version was restored and no user source was deleted.
- A recoverable pre-audit checkpoint was created at `.audit/checkpoints/Sampoorn-Kisan-AI-pre-audit-2026-09-22.zip` before changes.
- Git metadata is not present in this workspace, so Git status/diff validation was not available.

## Architecture observed

| Layer | Implementation |
| --- | --- |
| Client | React + Vite in `frontend/` |
| API | Express/Node in `backend/` |
| Authentication | Cookie/JWT endpoints with registration, login, password-reset and profile routes |
| Persistence | MongoDB when configured; development file-backed store when MongoDB is unavailable |
| ML services | Python FastAPI crop/disease/yield service expected in `ml_service/`; optional federated coordinator in `fl_server/` |
| External services | Open-Meteo weather, market-data adapter, Firebase integrations and optional satellite provider |

## Changes made

1. Fixed the registration failure UX: connection/server errors are now shown instead of the misleading generic “Please check your details” message.
2. Added root `npm run dev` / `npm run dev:all` support through `scripts/dev.js`, starting the front end and API together.
3. Repaired disease sample selection. The UI now fetches real allowlisted image data, creates a browser `File`, and submits it through the normal diagnosis pathway. It no longer sends a spoofable filename.
4. Added a server-side allowlisted disease-sample endpoint. It serves only known test images and rejects traversal attempts.
5. Corrected the sample labels/crop pairing so the UI does not call corn or grape samples “Rice Blast” or “Cotton Leaf Curl”.
6. Made the dashboard resilient to an absent federated-learning coordinator. Optional FL outages no longer turn the whole dashboard into an error screen.
7. Repaired Knowledge Hub deep links (`/knowledge?tab=articles`), error states, and empty states. Scheme content is now labelled as reference information that must be confirmed with the linked official source, rather than claiming unverified current status.
8. Improved market-price safety: when no market location is supplied, the assistant explicitly says it cannot verify a live price and asks for the missing market instead of implying that a price is available.
9. Added a package-lock override to `uuid@^11.1.1`, resolving the two moderate transitive backend audit findings.
10. Added automated coverage for the disease sample endpoint and its traversal rejection.
11. Updated retired Gemini model identifiers in the local runtime configuration to the provider-recommended current primary and fallback models. A minimal live request succeeded with the current primary model.

## Verification results

| Check | Result |
| --- | --- |
| Front-end lint | PASS — `npm run lint` |
| Production front-end build | PASS — `npm run build` |
| Backend automated suite | PASS — 22/22 suites via `npm test` |
| Auth/profile/reset security and rate limiting | PASS — covered in backend suite |
| Farm profile save/read behavior | PASS — covered by `farmProfile.test.js` and full-stack API tests |
| Disease sample route | PASS — valid PNG returned; encoded traversal request returned 404 |
| Live weather | PASS — local API returned current Open-Meteo data for Hyderabad |
| Knowledge API | PASS — 4 local article records returned; empty history is rendered honestly |
| Configured Gemini chat provider | PASS — live minimal request succeeded with `gemini-3.6-flash` |
| Front-end production dependency audit | PASS — 0 vulnerabilities |
| Backend production dependency audit | PASS — 0 vulnerabilities after lockfile override |

## Remaining external/configuration blockers

These are deliberately not replaced with fabricated values or fake “success” responses.

| Feature | Current status | Required to enable |
| --- | --- | --- |
| Image disease diagnosis | Blocked with an explicit unavailable response | A validated vision checkpoint and `VISION_MODEL_PATH`; Python ML runtime dependencies |
| Crop/yield ML predictions | Not production-ready | Start/configure the Python service, install FastAPI/model dependencies, and configure model paths such as `CROP_MODEL_PATH` |
| Federated learning | Optional coordinator unavailable | A verified coordinator endpoint and credentials/configuration |
| Satellite/NDVI | Explicit 503 when unconfigured | A supported satellite-data provider and credentials |
| MongoDB production persistence | Not connected in this environment | Valid reachable MongoDB credentials/network access; development fallback is not a production database |
| Push notifications | Configuration-dependent | Valid Firebase client/admin configuration and a browser permission flow |

Docker is installed but its daemon was unavailable during audit. The bundled Python runtime was available, but FastAPI was not installed. No model checkpoint for vision diagnosis was found. These conditions are the reason ML features remain transparently unavailable rather than being falsely reported as working.

## Required environment configuration

The local API expects these names (values are intentionally excluded from the delivery archive): `PORT`, `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `AI_PROVIDER`, `AI_MODEL`, `AI_FALLBACK_MODEL`, `AI_TIMEOUT`, `AI_MAX_RETRIES`, `AI_TEMPERATURE`, `PYTHON_ML_SERVICE`, `EMAIL_USER`, `EMAIL_PASS`, `SMS_API_KEY`, `FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_AUTH_DOMAIN`, and `FIREBASE_APP_ID`.

For production, provide these through the deployment secret manager rather than committing a `.env` file. MongoDB, email/SMS, Firebase, Python ML, satellite, and FL values are only required for the corresponding enabled feature; the API now reports unavailable/degraded state rather than inventing output when optional integrations are absent.

## Clean archive contents

The delivery archive contains current source, configuration templates, tests, local reference assets and model artifacts required by source control. It excludes all `.env` files, persisted user/session data, `node_modules`, `.git`, audit/log folders, build output, uploads, and prior archives.

Archive: `Sampoorn-Kisan-AI-LATEST-WORKING-2026-09-22.zip`

## Recommended production follow-up

1. Provision MongoDB, configure its secret only through deployment environment variables, and verify `/ready` becomes healthy.
2. Supply validated crop/disease/yield model files and enable the Python service in the deployment runtime.
3. Configure a real satellite provider, FL coordinator, and Firebase only where their credentials and monitoring are available.
4. Add a CI job for lint, production build, backend test suite and `npm audit --omit=dev`.

## SECOND INTEGRATION/ML/PERSISTENCE PASS

Audit date: 2026-09-22

### Persistence

- `backend/config/db.js` now distinguishes a connected MongoDB socket from an operational database by probing a real collection operation.
- Production account and soil-measurement writes fail closed with HTTP 503 when MongoDB is unavailable/restricted; they do not claim a save against memory or JSON.
- Development fallback remains intentionally available for local tests only.
- Added `SoilMeasurement` Mongo schema with user ownership, bounded numeric fields, source, measurement time, timestamps and an index on `(userId, measuredAt)`.
- Added authenticated `GET /api/soil/latest` and `POST /api/soil` routes. The dashboard reads these records, and the Soil Health Card flow submits its measured N/P/K/pH values to the authenticated persistence path.
- Real MongoDB write/read/restart persistence: **BLOCKED BY MONGODB CREDENTIALS/NETWORK**. The configured instance accepted a connection but rejected collection operations with `Command find requires authentication`.

### ML service

- The existing `ml_service/crop_model.pkl` was loaded with the project’s isolated Python runtime after installing the declared runtime subset (`fastapi`, `uvicorn`, `pydantic`, `joblib`, `scikit-learn`, `xgboost`, `numpy`, `pillow`, `python-multipart`).
- The artifact is an `XGBClassifier` with 7 input features. `label_encoder.pkl` contains the 14 crop labels. The ML loader now uses those labels instead of rejecting the valid numeric model classes.
- FastAPI `/health` reports crop `READY`; `/predict/crop` returned a real trained-model prediction (`paddy`, probability approximately `0.54735`) through the Node `/api/crop/recommend` route.
- Disease model: **BLOCKED BY MISSING MODEL**. No vision checkpoint was present. FastAPI now starts independently when optional torch/vision dependencies are absent and returns a truthful 503 for disease diagnosis.
- Yield, SHAP and LIME remain unavailable because no validated artifacts/explainers are configured.

### Soil pipeline

- Soil N/P/K/pH values now flow from the existing Soil Health Card form to authenticated persistence and back to dashboard cards with source and measurement date.
- Moisture and soil temperature remain unavailable unless a real field sensor or user-provided measurement is supplied; air temperature is not reused as soil temperature.
- No fabricated NPK, pH, moisture or soil-temperature values were added.

### Federated learning and security claims

- The coordinator implementation remains a partial/unconfigured integration. No global accuracy, epsilon budget or node count is generated without a verified coordinator.
- The dashboard no longer claims “AES-256 Privacy Preserved”; it identifies security as coordinator-reported only. Encryption is **UNVERIFIED** until the coordinator proves the relevant data-protection implementation.

### Other integrations

- Gemini: **PASS**; live request succeeded with the current configured model.
- Weather/Open-Meteo: **PASS**; live data verified.
- Market provider: **PARTIALLY VERIFIED**; endpoint and safety behavior work, but availability depends on provider data.
- Satellite: **BLOCKED BY CREDENTIALS/PROVIDER**; no NDVI values are fabricated.
- Firebase/email/SMS: **BLOCKED BY DEPLOYMENT CREDENTIALS**; security-sensitive flows fail safely when delivery is unavailable.

### Regression results

- Backend suite: **23/23 suites PASS**, including new soil persistence validation.
- Frontend lint: **PASS**.
- Frontend production build: **PASS**.
- ML REST validation: **PASS for crop model**, **BLOCKED for disease model**.

## SECOND-PASS DEPLOYMENT GATE

**APPLICATION READY — EXTERNAL CONFIGURATION REQUIRED.** Core web, authentication, weather, Gemini and crop recommendation paths are functional. Production deployment still requires authenticated MongoDB, disease model/torch runtime, and optional coordinator/satellite/Firebase/email/SMS configuration.
