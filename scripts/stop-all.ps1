# ============================================================================
# Sampoorn Kisan AI - Windows Service Shutdown Supervisor
# ============================================================================
# Terminates active development services across:
#   1. Python FastAPI ML Microservice (port 8000)
#   2. Node.js Express Backend API (port 5000)
#   3. Vite React Frontend Dashboard (port 5173)
# ============================================================================

[CmdletBinding()]
param(
    [switch]$Force
)

$Ports = @(8000, 5000, 5173)

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   STOPPING SAMPOORN KISAN AI SERVICES" -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Cyan

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

$anyStopped = $false

foreach ($Port in $Ports) {
    $procId = Get-PortPID $Port
    if ($procId) {
        $anyStopped = $true
        $procName = "Unknown"
        try {
            $p = Get-Process -Id $procId -ErrorAction SilentlyContinue
            if ($p) { $procName = $p.ProcessName }
        } catch {}
        
        Write-Host "Stopping $procName on port $Port (PID: $procId)..." -ForegroundColor Yellow
        try {
            & taskkill.exe /pid $procId /t /f *>$null
        } catch {}
        try {
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        } catch {}

        # Verify port release
        Start-Sleep -Milliseconds 600
        $check = Get-PortPID $Port
        if ($null -eq $check) {
            Write-Host "   [OK] Terminated PID $procId. Port $Port is now FREE." -ForegroundColor Green
        } else {
            Write-Host "   [WARN] Port $Port still occupied by PID $check." -ForegroundColor Red
        }
    } else {
        Write-Host "Port $Port is already inactive." -ForegroundColor DarkGray
    }
}

Write-Host ""
if ($anyStopped) {
    Write-Host "All active Sampoorn Kisan AI development services have been stopped." -ForegroundColor Green
} else {
    Write-Host "No active Sampoorn Kisan AI services were running." -ForegroundColor Gray
}
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
