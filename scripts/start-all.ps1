# ============================================================================
# Sampoorn Kisan AI - Windows Service Startup Supervisor
# ============================================================================
# Coordinates local development across:
#   1. Python FastAPI ML Microservice (port 8000)
#   2. Node.js Express Backend API (port 5000)
#   3. React / Vite Frontend Dashboard (port 5173)
# ============================================================================

[CmdletBinding()]
param(
    [switch]$NoFrontend,
    [switch]$NoML,
    [switch]$Restart,
    [switch]$Force,
    [switch]$Detached,
    [switch]$NoBrowser,
    [int]$TimeoutSeconds = 30
)

try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

if ($Force) { $Restart = $true }

$ErrorActionPreference = "Continue"

# Resolve Project Root reliably
$ScriptPath = $MyInvocation.MyCommand.Path
if (-not $ScriptPath) {
    $ProjectRoot = (Get-Location).Path
} else {
    $Dir = Split-Path -Parent $ScriptPath
    if (Test-Path (Join-Path $Dir "backend\server.js")) {
        $ProjectRoot = $Dir
    } else {
        $ProjectRoot = Split-Path -Parent $Dir
    }
}

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   SAMPOORN KISAN AI - FULL-STACK STARTUP SUPERVISOR" -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host " Project Root : $ProjectRoot" -ForegroundColor Gray
Write-Host " Supervisor   : Interactive (Visible console logs & Ctrl+C cleanup)" -ForegroundColor Gray
if ($Restart) { Write-Host " Mode         : Fresh Restart (cleaning existing port listeners)" -ForegroundColor Yellow }
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# Helper: Port Inspection
function Get-PortPID([int]$Port) {
    try {
        $matches = netstat -ano | Select-String ":$Port\s+.*LISTENING\s+(\d+)"
        if ($matches) {
            $firstMatch = $matches | Select-Object -First 1
            $tokens = ($firstMatch.Line.Trim() -split '\s+')
            $pidNum = [int]$tokens[-1]
            if ($pidNum -gt 0) { return $pidNum }
        }
    } catch {}
    return $null
}

function Get-PortProcessInfo([int]$Port) {
    $procId = Get-PortPID $Port
    if ($procId) {
        $name = "Unknown"
        try {
            $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
            if ($proc) { $name = $proc.ProcessName }
        } catch {}
        return [PSCustomObject]@{
            Port        = $Port
            PID         = $procId
            ProcessName = $name
        }
    }
    return $null
}

function Stop-PortProcess([int]$Port) {
    $procId = Get-PortPID $Port
    if ($procId) {
        Write-Host "   Stopping existing process on port $Port (PID: $procId)..." -ForegroundColor Yellow
        try { & taskkill.exe /pid $procId /t /f *>$null } catch {}
        try { Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue } catch {}
        
        for ($i = 0; $i -lt 6; $i++) {
            Start-Sleep -Milliseconds 400
            if (-not (Get-PortPID $Port)) { break }
        }
    }
}

function Stop-ProcessTree([int]$ProcessId) {
    if ($ProcessId -gt 0) {
        try { & taskkill.exe /pid $ProcessId /t /f *>$null } catch {}
        try { Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue } catch {}
    }
}

# Helper: Health Probing
function Test-RestHealth([string]$Url, [int]$TimeoutSec = 25) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $lastErr = ""
    while ($sw.Elapsed.TotalSeconds -lt $TimeoutSec) {
        try {
            $resp = Invoke-RestMethod -Uri $Url -TimeoutSec 3 -ErrorAction Stop
            if ($resp) {
                return @{
                    Success = $true
                    Data = $resp
                    Elapsed = [math]::Round($sw.Elapsed.TotalSeconds, 1)
                }
            }
        } catch {
            $lastErr = $_.Exception.Message
            Start-Sleep -Milliseconds 600
        }
    }
    return @{
        Success = $false
        Error = $lastErr
        Elapsed = [math]::Round($sw.Elapsed.TotalSeconds, 1)
    }
}

function Test-WebHealth([string]$Url, [int]$TimeoutSec = 25) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $lastErr = ""
    while ($sw.Elapsed.TotalSeconds -lt $TimeoutSec) {
        try {
            $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) {
                return @{
                    Success = $true
                    StatusCode = $resp.StatusCode
                    Elapsed = [math]::Round($sw.Elapsed.TotalSeconds, 1)
                }
            }
        } catch {
            $lastErr = $_.Exception.Message
            Start-Sleep -Milliseconds 600
        }
    }
    return @{
        Success = $false
        Error = $lastErr
        Elapsed = [math]::Round($sw.Elapsed.TotalSeconds, 1)
    }
}

# -----------------------------------------------------------------------------
# Pre-Startup: Handle -Restart / -Force cleanup
# -----------------------------------------------------------------------------
if ($Restart) {
    Write-Host "[PRE-STARTUP] Cleaning occupied ports before fresh launch..." -ForegroundColor Yellow
    if (-not $NoML) { Stop-PortProcess 8000 }
    Stop-PortProcess 5000
    if (-not $NoFrontend) { Stop-PortProcess 5173 }
    Start-Sleep -Milliseconds 500
}

$spawnedProcesses = @()
$mlProc = $null
$backendProc = $null
$frontendProc = $null

$mlHealthData = $null
$backendHealthData = $null
$frontendStatus = "NOT_STARTED"

$startupFailed = $false
$keepRunning = $false

try {
    # =========================================================================
    # STEP 1: Python FastAPI ML Microservice (Port 8000)
    # =========================================================================
    if (-not $NoML) {
        Write-Host "------------------------------------------------------------------------" -ForegroundColor DarkGray
        Write-Host "[1/3] Checking Python FastAPI ML Microservice (Port 8000)..." -ForegroundColor White

        # Locate Python Virtual Environment
        $MlVenvPy = Join-Path $ProjectRoot "ml_service\.venv\Scripts\python.exe"
        if (Test-Path $MlVenvPy) {
            $pyRuntime = $MlVenvPy
            Write-Host "   Using Python Virtualenv: $MlVenvPy" -ForegroundColor DarkGray
        } else {
            Write-Host "   [WARN] .venv not found at $MlVenvPy. Attempting system python..." -ForegroundColor Yellow
            $pyRuntime = "python"
        }

        # Check existing port listener
        $port8000Info = Get-PortProcessInfo 8000
        $needStartML = $true

        if ($port8000Info) {
            Write-Host "   Port 8000 occupied by PID $($port8000Info.PID) ($($port8000Info.ProcessName)). Probing /health..." -ForegroundColor Yellow
            $probe = Test-RestHealth "http://127.0.0.1:8000/health" 3
            if ($probe.Success) {
                Write-Host "   [OK] Active ML service responded healthy on port 8000. Reusing instance." -ForegroundColor Green
                $mlHealthData = $probe.Data
                $needStartML = $false
            } else {
                Write-Host "   [WARN] Port 8000 occupied by unresponsive process. Terminating stale zombie..." -ForegroundColor Yellow
                Stop-PortProcess 8000
            }
        }

        if ($needStartML) {
            Write-Host "   Launching ML Microservice in visible window..." -ForegroundColor Cyan
            $mlDir = Join-Path $ProjectRoot "ml_service"
            $mlTitle = "Sampoorn Kisan AI - ML Service (Port 8000)"
            $mlCmd = "`$host.UI.RawUI.WindowTitle = '$mlTitle'; cd '$mlDir'; Write-Host '=== SAMPOORN KISAN AI - ML SERVICE (PORT 8000) ===' -ForegroundColor Cyan; & '$pyRuntime' -m uvicorn app:app --host 127.0.0.1 --port 8000"

            $mlProc = Start-Process powershell.exe -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $mlCmd -PassThru -WindowStyle Normal
            $spawnedProcesses += @{ Name = "ML Service (FastAPI)"; Proc = $mlProc; Port = 8000 }

            Write-Host "   Waiting for ML Engine readiness on http://127.0.0.1:8000/health (Timeout: ${TimeoutSeconds}s)..." -ForegroundColor Gray
            $mlHealth = Test-RestHealth "http://127.0.0.1:8000/health" $TimeoutSeconds

            if ($mlHealth.Success) {
                $mlHealthData = $mlHealth.Data
                Write-Host "   [OK] ML Engine is ONLINE in $($mlHealth.Elapsed)s (PID: $($mlProc.Id))!" -ForegroundColor Green
            } else {
                $startupFailed = $true
                Write-Host "   [ERROR] ML Engine failed to respond within ${TimeoutSeconds}s!" -ForegroundColor Red
                if ($mlProc.HasExited) {
                    Write-Host "   [DIAGNOSTIC] Process exited prematurely with ExitCode: $($mlProc.ExitCode)" -ForegroundColor Red
                }
                Write-Host "   [TROUBLESHOOTING] Check the '[ML Service (Port 8000)]' console window for Python exception tracebacks." -ForegroundColor Yellow
                Write-Host "   To test manually: cd ml_service; .\.venv\Scripts\python.exe -m uvicorn app:app --port 8000" -ForegroundColor DarkGray
            }
        }
    } else {
        Write-Host "[1/3] Skipping ML Microservice (-NoML specified)." -ForegroundColor DarkGray
    }

    # =========================================================================
    # STEP 2: Node.js Express Backend API (Port 5000)
    # =========================================================================
    Write-Host "------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "[2/3] Checking Node.js Express Backend Gateway (Port 5000)..." -ForegroundColor White

    $port5000Info = Get-PortProcessInfo 5000
    $needStartBackend = $true

    if ($port5000Info) {
        Write-Host "   Port 5000 occupied by PID $($port5000Info.PID) ($($port5000Info.ProcessName)). Probing /health..." -ForegroundColor Yellow
        $probe = Test-RestHealth "http://127.0.0.1:5000/health" 3
        if ($probe.Success) {
            Write-Host "   [OK] Active Backend responded healthy on port 5000. Reusing instance." -ForegroundColor Green
            $backendHealthData = $probe.Data
            $needStartBackend = $false
        } else {
            Write-Host "   [WARN] Port 5000 occupied by unresponsive process. Terminating stale zombie..." -ForegroundColor Yellow
            Stop-PortProcess 5000
        }
    }

    if ($needStartBackend) {
        Write-Host "   Launching Express Backend in visible window..." -ForegroundColor Cyan
        $backendDir = Join-Path $ProjectRoot "backend"
        $backendTitle = "Sampoorn Kisan AI - Express Backend (Port 5000)"
        $backendCmd = "`$host.UI.RawUI.WindowTitle = '$backendTitle'; cd '$backendDir'; Write-Host '=== SAMPOORN KISAN AI - BACKEND GATEWAY (PORT 5000) ===' -ForegroundColor Cyan; node server.js"

        $backendProc = Start-Process powershell.exe -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $backendCmd -PassThru -WindowStyle Normal
        $spawnedProcesses += @{ Name = "Backend API (Express)"; Proc = $backendProc; Port = 5000 }

        Write-Host "   Waiting for Backend API readiness on http://127.0.0.1:5000/health (Timeout: ${TimeoutSeconds}s)..." -ForegroundColor Gray
        $backendHealth = Test-RestHealth "http://127.0.0.1:5000/health" $TimeoutSeconds

        if ($backendHealth.Success) {
            $backendHealthData = $backendHealth.Data
            Write-Host "   [OK] Node.js Backend is ONLINE in $($backendHealth.Elapsed)s (PID: $($backendProc.Id))!" -ForegroundColor Green
        } else {
            $startupFailed = $true
            Write-Host "   [ERROR] Backend Gateway failed to respond within ${TimeoutSeconds}s!" -ForegroundColor Red
            if ($backendProc.HasExited) {
                Write-Host "   [DIAGNOSTIC] Process exited prematurely with ExitCode: $($backendProc.ExitCode)" -ForegroundColor Red
            }
            Write-Host "   [TROUBLESHOOTING] Check the '[Express Backend (Port 5000)]' console window for error logs." -ForegroundColor Yellow
            Write-Host "   To test manually: cd backend; node server.js" -ForegroundColor DarkGray
        }
    }

    # =========================================================================
    # STEP 3: Vite React Frontend Dashboard (Port 5173)
    # =========================================================================
    if (-not $NoFrontend) {
        Write-Host "------------------------------------------------------------------------" -ForegroundColor DarkGray
        Write-Host "[3/3] Checking Vite React Frontend Dashboard (Port 5173)..." -ForegroundColor White

        $port5173Info = Get-PortProcessInfo 5173
        $needStartFrontend = $true

        if ($port5173Info) {
            Write-Host "   Port 5173 occupied by PID $($port5173Info.PID) ($($port5173Info.ProcessName)). Probing HTTP..." -ForegroundColor Yellow
            $probe = Test-WebHealth "http://localhost:5173" 3
            if ($probe.Success) {
                Write-Host "   [OK] Active Vite Frontend responded on port 5173. Reusing instance." -ForegroundColor Green
                $frontendStatus = "ONLINE"
                $needStartFrontend = $false
            } else {
                Write-Host "   [WARN] Port 5173 occupied by unresponsive process. Terminating stale zombie..." -ForegroundColor Yellow
                Stop-PortProcess 5173
            }
        }

        if ($needStartFrontend) {
            Write-Host "   Launching Vite Frontend in visible window..." -ForegroundColor Cyan
            $frontendDir = Join-Path $ProjectRoot "frontend"
            $frontendTitle = "Sampoorn Kisan AI - Vite Frontend (Port 5173)"
            $frontendCmd = "`$host.UI.RawUI.WindowTitle = '$frontendTitle'; cd '$frontendDir'; Write-Host '=== SAMPOORN KISAN AI - FRONTEND DASHBOARD (PORT 5173) ===' -ForegroundColor Cyan; npm run dev"

            $frontendProc = Start-Process powershell.exe -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $frontendCmd -PassThru -WindowStyle Normal
            $spawnedProcesses += @{ Name = "Frontend (Vite)"; Proc = $frontendProc; Port = 5173 }

            Write-Host "   Waiting for Vite Dev Server on http://localhost:5173 (Timeout: ${TimeoutSeconds}s)..." -ForegroundColor Gray
            $frontHealth = Test-WebHealth "http://localhost:5173" $TimeoutSeconds

            if ($frontHealth.Success) {
                $frontendStatus = "ONLINE"
                Write-Host "   [OK] Frontend is ONLINE in $($frontHealth.Elapsed)s (PID: $($frontendProc.Id))!" -ForegroundColor Green
            } else {
                $frontendStatus = "FAILED"
                $startupFailed = $true
                Write-Host "   [ERROR] Frontend failed to respond on http://localhost:5173 within ${TimeoutSeconds}s!" -ForegroundColor Red
                if ($frontendProc.HasExited) {
                    Write-Host "   [DIAGNOSTIC] Process exited prematurely with ExitCode: $($frontendProc.ExitCode)" -ForegroundColor Red
                }
                Write-Host "   [TROUBLESHOOTING] Check the '[Vite Frontend (Port 5173)]' console window for bundler errors." -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "[3/3] Skipping Frontend Dashboard (-NoFrontend specified)." -ForegroundColor DarkGray
        $frontendStatus = "SKIPPED"
    }

    # =========================================================================
    # SYSTEM DIAGNOSTIC SUMMARY REPORT
    # (Transparent status of all subservices, databases, and external APIs)
    # =========================================================================
    Write-Host ""
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "   SAMPOORN KISAN AI - SYSTEM STATUS & DIAGNOSTICS" -ForegroundColor Green
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host " CORE SERVICE ENDPOINTS:" -ForegroundColor White
    if (-not $NoML) {
        $mlText = if ($mlHealthData) { "ONLINE (FastAPI)" } else { "UNAVAILABLE" }
        Write-Host "   * ML Vision & Agronomy : http://127.0.0.1:8000   [$mlText]" -ForegroundColor $(if ($mlHealthData) { "Green" } else { "Red" })
    }
    $beText = if ($backendHealthData) { "ONLINE (Express)" } else { "UNAVAILABLE" }
    Write-Host "   * Backend API Gateway  : http://127.0.0.1:5000   [$beText]" -ForegroundColor $(if ($backendHealthData) { "Green" } else { "Red" })
    if (-not $NoFrontend) {
        Write-Host "   * Web Dashboard Client : http://localhost:5173   [$frontendStatus]" -ForegroundColor $(if ($frontendStatus -eq "ONLINE") { "Green" } else { "Yellow" })
    }

    Write-Host ""
    Write-Host " SUBSYSTEM & EXTERNAL DEPENDENCY TRANSPARENCY:" -ForegroundColor White

    # 1. Database Transparency
    if ($backendHealthData -and $backendHealthData.services -and $backendHealthData.services.database) {
        $dbStat = $backendHealthData.services.database.status
        if ($dbStat -eq "online") {
            Write-Host "   * Database Layer       : ONLINE (MongoDB active & connected)" -ForegroundColor Green
        } elseif ($dbStat -eq "in_memory_mode") {
            Write-Host "   * Database Layer       : LOCAL FALLBACK (Persistent disk store active; MongoDB offline)" -ForegroundColor Yellow
        } else {
            Write-Host "   * Database Layer       : $dbStat" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   * Database Layer       : Pending verification" -ForegroundColor DarkGray
    }

    # 2. AI Reasoning Transparency
    if ($backendHealthData -and $backendHealthData.services -and $backendHealthData.services.ai) {
        $aiInfo = $backendHealthData.services.ai
        if ($aiInfo.status -eq "online") {
            Write-Host "   * AI Engine (Gemini)   : ONLINE (Provider: $($aiInfo.provider), Model: $($aiInfo.model))" -ForegroundColor Green
        } else {
            Write-Host "   * AI Engine (Gemini)   : FALLBACK MODE (Deterministic agronomic reasoning active; GEMINI_API_KEY required for live AI)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   * AI Engine (Gemini)   : Pending verification" -ForegroundColor DarkGray
    }

    # 3. Weather API Transparency
    if ($backendHealthData -and $backendHealthData.services -and $backendHealthData.services.weather_api) {
        $wStat = $backendHealthData.services.weather_api.status
        if ($wStat -eq "online") {
            Write-Host "   * Weather Service      : ONLINE (Open-Meteo live atmospheric telemetry)" -ForegroundColor Green
        } else {
            Write-Host "   * Weather Service      : DEGRADED (Open-Meteo unreachable or rate-limited; check internet/firewall)" -ForegroundColor Yellow
        }
    }

    # 4. Market / Mandi API Transparency
    if ($backendHealthData -and $backendHealthData.services -and $backendHealthData.services.market_api) {
        $mStat = $backendHealthData.services.market_api.status
        if ($mStat -eq "online") {
            Write-Host "   * Market / Mandi Rates : ONLINE (Farmer.in open market telemetry)" -ForegroundColor Green
        } else {
            Write-Host "   * Market / Mandi Rates : DEGRADED (External market endpoint unreachable or responding slowly)" -ForegroundColor Yellow
        }
    }

    # 5. ML Models & Device
    if ($mlHealthData) {
        $dev = if ($mlHealthData.selected_device) { $mlHealthData.selected_device.ToUpper() } else { "CPU" }
        Write-Host "   * ML Compute Engine    : ONLINE (Device: $dev, PyTorch MobileNetV2 + XGBoost)" -ForegroundColor Green
    }

    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host ""

    if ($startupFailed) {
        Write-Host "[ERROR] One or more core services failed to start properly." -ForegroundColor Red
        Write-Host "Stopping all partially launched services..." -ForegroundColor Yellow
        exit 1
    }

    # Auto-open browser if frontend is online and not suppressed
    if (-not $NoBrowser -and -not $NoFrontend -and $frontendStatus -eq "ONLINE") {
        try {
            Start-Process "http://localhost:5173"
        } catch {}
    }

    # If -Detached was specified, mark $keepRunning and exit cleanly
    if ($Detached) {
        $keepRunning = $true
        Write-Host "Services started in detached mode (-Detached specified)." -ForegroundColor Cyan
        Write-Host "To shut down services later, run: .\stop-all.ps1" -ForegroundColor Yellow
        exit 0
    }

    # =========================================================================
    # SUPERVISOR MONITORING & CTRL+C CLEANUP LOOP
    # =========================================================================
    Write-Host "SUPERVISOR ACTIVE: Press [Ctrl+C] in this terminal to stop all services." -ForegroundColor Cyan
    Write-Host "Logs are streaming in each service window. Do not close this supervisor.`n" -ForegroundColor Gray

    $tick = 0
    while ($true) {
        Start-Sleep -Seconds 2
        $tick++

        # Check process vitality
        foreach ($procItem in $spawnedProcesses) {
            $p = $procItem.Proc
            if ($p -and $p.HasExited) {
                Write-Host "[ALERT] $($procItem.Name) terminated unexpectedly (ExitCode: $($p.ExitCode))!" -ForegroundColor Red
            }
        }

        # Periodic health heartbeat every 40s
        if ($tick % 20 -eq 0) {
            $ts = Get-Date -Format "HH:mm:ss"
            Write-Host "[$ts] Supervisor Heartbeat: All registered services monitored." -ForegroundColor DarkGray
        }
    }

} finally {
    # Ensure graceful cleanup on Ctrl+C or script termination
    if (-not $keepRunning) {
        Write-Host ""
        Write-Host "========================================================================" -ForegroundColor Yellow
        Write-Host "   STOPPING ALL SAMPOORN KISAN AI SERVICES (Graceful Cleanup)..." -ForegroundColor Yellow
        Write-Host "========================================================================" -ForegroundColor Yellow

        # 1. Terminate spawned process trees
        foreach ($procItem in $spawnedProcesses) {
            if ($procItem.Proc -and -not $procItem.Proc.HasExited) {
                Write-Host "Terminating $($procItem.Name) (PID: $($procItem.Proc.Id))..." -ForegroundColor DarkGray
                Stop-ProcessTree $procItem.Proc.Id
            }
        }

        # 2. Release ports 8000, 5000, 5173 if still bound
        Start-Sleep -Milliseconds 400
        if (-not $NoML) { Stop-PortProcess 8000 }
        Stop-PortProcess 5000
        if (-not $NoFrontend) { Stop-PortProcess 5173 }

        Write-Host ""
        Write-Host "All Sampoorn Kisan AI development services stopped cleanly." -ForegroundColor Green
        Write-Host "========================================================================" -ForegroundColor Cyan
        Write-Host ""
    }
}
