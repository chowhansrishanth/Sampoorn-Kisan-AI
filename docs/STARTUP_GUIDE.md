# Sampoorn Kisan AI — Startup & Operations Guide

## 1. Quick Start Command

From the root project directory (`C:\Users\chowh\Downloads\SK AI REDESIGNED`), run:

```powershell
.\start-all.ps1
```

Or via npm:
```bash
npm start
```

If your system restricts PowerShell scripts (`ExecutionPolicy Restricted`), run:
```powershell
powershell -ExecutionPolicy Bypass -File .\start-all.ps1
```

To stop all services at any time:
- Press **`Ctrl+C`** in the supervisor terminal, OR
- Run:
  ```powershell
  .\stop-all.ps1
  ```
  (or `npm stop`)

---

## 2. Architecture & Service Ports

The startup supervisor orchestrates the complete 3-tier architecture:

| Tier | Service | Port | Health Endpoint | Runtime / Technology |
|---|---|---|---|---|
| **Tier 1** | **Python ML Engine** | `8000` | `http://127.0.0.1:8000/health` | FastAPI / PyTorch MobileNetV2 / XGBoost / `.venv` |
| **Tier 2** | **Express Backend Gateway** | `5000` | `http://127.0.0.1:5000/health` | Node.js / Express 5 / MongoDB / Local JSON fallback |
| **Tier 3** | **React Frontend Client** | `5173` | `http://localhost:5173` | React 19 / Vite 8 / Single Page App |

---

## 3. Supervisor Features

### A. Live Log Visibility
- Launches each service in a dedicated, clearly titled console window:
  - `[Sampoorn Kisan AI] ML Service (Port 8000)`
  - `[Sampoorn Kisan AI] Express Backend (Port 5000)`
  - `[Sampoorn Kisan AI] Vite Frontend (Port 5173)`
- Logs, API traces, error stacks, and compilation outputs remain visible in real time.
- Windows are configured with `-NoExit` so if an unexpected error occurs, the window does not abruptly disappear.

### B. Occupied Port & Duplicate Instance Detection
- Before booting any service, the supervisor uses `netstat -ano` to inspect ports `8000`, `5000`, and `5173`.
- **Healthy Active Instance**: If an existing instance is already responding to `/health`, the supervisor reuses it without spawning duplicates.
- **Unresponsive Zombie Process**: If a port is occupied by a hung or dead process that fails health checks, the supervisor automatically terminates the stale process tree (`taskkill /t /f`) and releases the port before starting a fresh instance.
- **Fresh Restart Mode (`-Restart`)**: Forcefully terminates any processes on all target ports before starting.

### C. Health Probing & Startup Failure Diagnostics
- Probes `/health` endpoints with a configurable timeout (default 30 seconds).
- Displays exact elapsed startup seconds for each service.
- If a service fails to initialize within the timeout:
  - Detects if the process exited prematurely and prints its `ExitCode`.
  - Provides targeted troubleshooting guidance.
  - Automatically rolls back and terminates any partially launched services so ports are not left in an inconsistent state.

### D. Subsystem & Dependency Transparency
The supervisor does not claim external services work merely because a server started. It parses the actual `/health` diagnostic response and reports:
- **Database Layer**: Confirms whether MongoDB is active (`online`) or using local resilient JSON store fallback (`in_memory_mode`).
- **AI Reasoning**: Confirms whether Gemini API is active (`online`) with model details, or operating in deterministic rule-based fallback (`fallback_mode`).
- **Weather Telemetry**: Reports Open-Meteo connection status (`online` or `degraded`).
- **Market / Mandi Telemetry**: Reports Agmarknet/Farmer.in price feed status (`online` or `degraded`).
- **ML Hardware & Models**: Reports CPU/CUDA device and PyTorch/XGBoost model readiness.

### E. Graceful Ctrl+C Cleanup
- The supervisor runs an active heartbeat loop.
- Pressing `Ctrl+C` triggers PowerShell's `finally` handler:
  - Terminates all child process trees (`Stop-ProcessTree` using `taskkill /pid $procId /t /f`).
  - Releases ports `8000`, `5000`, `5173`.
  - Leaves zero orphaned background zombies.

---

## 4. Command-Line Options

| Command | Purpose |
|---|---|
| `.\start-all.ps1` | Standard interactive startup (ML + Backend + Frontend + live supervisor) |
| `.\start-all.ps1 -Restart` | Force terminates any existing instances on 8000/5000/5173 and starts fresh |
| `.\start-all.ps1 -NoFrontend` | Starts only Python ML service (8000) and Express Backend (5000) |
| `.\start-all.ps1 -NoML` | Starts only Express Backend (5000) and Frontend (5173) |
| `.\start-all.ps1 -NoBrowser` | Suppresses automatically opening the default web browser |
| `.\start-all.ps1 -Detached` | Starts all services in separate windows and exits the supervisor |
| `.\start-all.ps1 -TimeoutSeconds 45` | Extends health check probe timeout for slower machines |
| `.\stop-all.ps1` | Stops all running services across ports 8000, 5000, and 5173 |

---

## 5. Troubleshooting & Diagnostics

### Issue 1: `CommandNotFoundException` on `.\start-all.ps1`
- **Cause**: In older project versions, `start-all.ps1` was only located in `scripts/start-all.ps1`.
- **Solution**: The script is now available directly at the root `.\start-all.ps1` and also in `scripts/start-all.ps1`. Both work seamlessly.

### Issue 2: Script Execution Policy Restriction
- **Error**: `File start-all.ps1 cannot be loaded because running scripts is disabled on this system.`
- **Solution**: Run with bypass:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\start-all.ps1
  ```
  Or permanently enable for current user:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### Issue 3: Port 8000, 5000, or 5173 Already Occupied
- **Symptoms**: `Port 5000 occupied by unresponsive process` or `EADDRINUSE`.
- **Solution**: Run the restart switch:
  ```powershell
  .\start-all.ps1 -Restart
  ```
  Or explicitly stop all services first:
  ```powershell
  .\stop-all.ps1
  ```

### Issue 4: Python Virtual Environment Missing or Corrupted
- **Symptoms**: `Virtual environment not found at ml_service\.venv\Scripts\python.exe`.
- **Solution**: Recreate the virtual environment:
  ```powershell
  cd ml_service
  python -m venv .venv
  .\.venv\Scripts\pip install -r requirements.txt
  cd ..
  ```

### Issue 5: Gemini AI Shows "FALLBACK MODE"
- **Reason**: `GEMINI_API_KEY` is missing, expired, or invalid in `backend/.env`.
- **Solution**: Add your valid key to `backend/.env`:
  ```env
  GEMINI_API_KEY=your_actual_gemini_api_key
  AI_PROVIDER=gemini
  AI_MODEL=gemini-2.5-flash
  ```
  *Note: The app will continue running gracefully using deterministic agricultural fallbacks even without an API key.*

### Issue 6: Database Shows "LOCAL FALLBACK"
- **Reason**: Local MongoDB service is not running.
- **Solution**: The backend automatically falls back to `backend/data/users_store.json` so you can login, test, and register without MongoDB installed. To use MongoDB, start the MongoDB service:
  ```powershell
  net start MongoDB
  ```
