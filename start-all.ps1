# ============================================================================
# Sampoorn Kisan AI - Root Single-Command Startup Script
# ============================================================================
# Run this from the project root:
#   .\start-all.ps1
#
# Available Options:
#   .\start-all.ps1 -Restart      # Force terminate previous instances and restart fresh
#   .\start-all.ps1 -NoFrontend   # Launch ML Service (8000) & Backend API (5000) only
#   .\start-all.ps1 -NoML         # Launch Backend (5000) & Frontend (5173) only
#   .\start-all.ps1 -NoBrowser    # Start without auto-opening default web browser
#   .\start-all.ps1 -Detached     # Start services in separate windows and exit supervisor
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

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ScriptDir) { $ScriptDir = (Get-Location).Path }
$TargetScript = Join-Path $ScriptDir "scripts\start-all.ps1"

if (-not (Test-Path $TargetScript)) {
    Write-Error "Could not find supervisor script at: $TargetScript"
    exit 1
}

& $TargetScript @PSBoundParameters
