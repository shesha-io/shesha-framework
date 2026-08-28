<#
.SYNOPSIS
    Resets cluster state between test runs so measurements are comparable.

.DESCRIPTION
    Default: flushes Redis and restarts the API instances for a genuinely cold cache.
    -Full:   tears down containers and volumes as well. Use before a baseline capture.

    The database is deliberately NOT touched -- dropping it would force a full migration on
    the next start. Reset it manually if a test run has corrupted seed data.

.EXAMPLE
    ./reset.ps1              # flush Redis + restart instances
    ./reset.ps1 -Full        # down -v, then start again with ./up.ps1
#>
[CmdletBinding()]
param(
    [switch]$Full
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $here

# See up.ps1 -- docker writes to stderr on success, which PowerShell 5.1 would otherwise
# promote to a terminating error.
function Invoke-Docker {
    # Deliberately a SIMPLE function (no param block) so the automatic $args collects every
    # argument verbatim. An advanced function with ValueFromRemainingArguments mis-binds the
    # first token here.
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        # Out-Host, not the pipeline: otherwise docker's stdout would be returned alongside
        # the exit code and callers would be comparing an array against 0.
        & docker @args | Out-Host
        return $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previous
    }
}

try {
    if ($Full) {
        Write-Host "Tearing down containers and volumes..." -ForegroundColor Cyan
        Invoke-Docker compose --profile loadtest down -v | Out-Null
        Write-Host "Done. Run ./up.ps1 to start again." -ForegroundColor Green
        return
    }

    Write-Host "Flushing Redis..." -ForegroundColor Cyan
    if ((Invoke-Docker compose exec -T redis redis-cli FLUSHALL) -ne 0) {
        throw "FLUSHALL failed -- is the stack running?"
    }

    # In-process state (once the L1 cache lands) does not survive a restart, so restarting
    # the API instances guarantees every run starts from a genuinely cold cache.
    Write-Host "Restarting API instances for a cold cache..." -ForegroundColor Cyan
    if ((Invoke-Docker compose restart api-1 api-2 api-3) -ne 0) {
        throw "restart failed"
    }

    Write-Host "Reset complete." -ForegroundColor Green
}
finally {
    Pop-Location
}
