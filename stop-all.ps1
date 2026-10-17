# ============================================================================
# Sampoorn Kisan AI - Root Single-Command Shutdown Script
# ============================================================================
# Run this from the project root:
#   .\stop-all.ps1
#
# Terminates processes on ports 8000, 5000, and 5173.
# ============================================================================

[CmdletBinding()]
param(
    [switch]$Force
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ScriptDir) { $ScriptDir = (Get-Location).Path }
$TargetScript = Join-Path $ScriptDir "scripts\stop-all.ps1"

if (-not (Test-Path $TargetScript)) {
    Write-Error "Could not find shutdown script at: $TargetScript"
    exit 1
}

& $TargetScript @PSBoundParameters
