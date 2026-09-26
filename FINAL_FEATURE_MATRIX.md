# Sampoorn Kisan AI final feature matrix

This matrix records the release-candidate behavior after the final audit on 2026-09-18. `READY` means the local implementation and its contract were verified. `EXTERNAL_REQUIRED` means the application fails closed until a real provider or checkpoint is configured. `INSUFFICIENT_DATA` is a valid market state, not a forecast failure.

| Feature | Frontend | Backend | Tests | External requirement | Status |
|---|---|---|---|---|---|
| Authentication and authorization | Login, profile and protected routes | JWT/session version, ownership checks | `hardening`, `securityPenTest`, `authFlow` | MongoDB in production | READY |
| Password reset | Reset form | Single-use hashed reset token and session revocation | `hardening` | SMTP for delivery | READY |
| Profitability, sensitivity and comparison | `/profitability` | Deterministic calculations and validation | `decisionSupport`, `finalContracts` | Farmer-entered costs/yield/price | READY |
| Irrigation | `/irrigation` with location, flow and deficit inputs | Open-Meteo daily data plus explicit modeled assumptions | `finalContracts` | Coordinates and live weather | READY |
| Fertilizer planning | `/fertilizer` general/soil-test modes | Target-driven N/P2O5/K2O calculator with transparent formulas | `decisionSupport`, `finalContracts` | Validated prescription/rate source | READY |
| Current market data | Dashboard/market pages | Provider data only; no fallback prices | regression contracts | Farmer.in provider/network | EXTERNAL_REQUIRED |
| Market history/forecast | `/mandi-forecast` | Dated observations, quality gate, chronological baseline comparison | `finalContracts` | At least 30 recent observations for one series | INSUFFICIENT_DATA |
| Crop recommendation | Existing crop tool | Configured checkpoint only | full-stack contract | External validated checkpoint | EXTERNAL_REQUIRED |
| Disease diagnosis | Existing image page | Valid image plus configured PyTorch checkpoint only | full-stack contract | External vision checkpoint | EXTERNAL_REQUIRED |
| Weather | Dashboard/weather route | Open-Meteo, explicit unavailable errors | `finalContracts` | Network/provider | EXTERNAL_REQUIRED |
| Knowledge Hub/schemes | Existing pages | Stored knowledge data and safe source labels | AI suites | Review current eligibility with official portals | IMPLEMENTED |
| Crop calendar | Existing calendar | BOM-safe JSON calendar | full-stack contract | None | READY |
| Multi-agent AI | Chat/agent routes | Contracts, structured results, concurrent isolation | `finalContracts`, AI suites | AI provider and domain services | DEGRADED |
| Personalized context | Farm profile and dashboard | Owner-scoped profile/memory | `farmProfile`, `contextRetention` | None | READY |
| XAI/provenance | Existing explanation surfaces | Source and limitation metadata; no fabricated confidence | AI/security suites | Model explainer/checkpoint where applicable | DEGRADED |
| Alerts/offline support | Existing alerts and sync UI | Failed sync actions remain queued; FCM fails closed | security/regression suites | Firebase Admin and browser config | EXTERNAL_REQUIRED |
| Translation | Existing language controls | AI language directive | AI suites | Configured AI provider for generated text | IMPLEMENTED |
| Federated learning/telemetry | Existing panels | No simulated production status; unavailable without service | full-stack contract | Real coordinator/sensors | EXTERNAL_REQUIRED |
| Docker/deployment | Dockerfiles and compose | Loopback-bound local ports, health checks | syntax/build checks | Secrets, Mongo, providers, checkpoints | READY |
| Security regression | N/A | Rate limits, safe errors, ownership and secret handling | `securityPenTest` 28/28 | None locally | READY |
| Production frontend build | Responsive pages including new forms | N/A | ESLint/build | None | READY |

## Verification classification

- Local suites: 23/23 pass.
- Decision contracts: 27/27 pass.
- Live AI evaluation, live geocoding and live model checkpoint checks are opt-in and are skipped unless their external configuration is present.
- The bundled `ml_service/crop_model.pkl` is not claimed as a validated production checkpoint; production inference requires `CROP_MODEL_PATH` and validates the loaded model contract.
