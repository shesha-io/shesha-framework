<#
.SYNOPSIS
    Brings up the 3-instance cache test rig with correct cold-start sequencing.

.DESCRIPTION
    Instance 1 owns the database migration. The framework guards seeding with a Redis
    distributed lock (SheshaNHibernateModule.cs:268), but that lock only waits 10s while a
    cold migration takes far longer -- so instances 2 and 3 are held back until instance 1
    is serving, and they run with skipMigrations/skipBootstrappers set.

.EXAMPLE
    ./up.ps1                 # publish output is baked into the image on every start
    ./up.ps1 -Rebuild        # accepted for compatibility; the image is always rebuilt
    ./up.ps1 -Loadtest       # also start nginx on :22020 for the throughput test
#>
[CmdletBinding()]
param(
    [switch]$Rebuild,
    [switch]$Loadtest,
    [int]$MigrationTimeoutSeconds = 600
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $here

# Docker writes progress and status to stderr even on success. Windows PowerShell 5.1
# promotes any native stderr output to a terminating NativeCommandError while
# $ErrorActionPreference is 'Stop', so calls are funnelled through this helper which
# suppresses that promotion and reports the real exit code instead.
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

function Wait-ForInstance {
    param([string]$Name, [string]$Url, [int]$TimeoutSeconds)

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $lastStatus = ''
    Write-Host "  waiting for $Name at $Url ..." -NoNewline

    while ((Get-Date) -lt $deadline) {
        try {
            $resp = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            if ($resp.StatusCode -eq 200) {
                Write-Host " ready" -ForegroundColor Green
                return $true
            }
            $lastStatus = "HTTP $($resp.StatusCode)"
        }
        catch {
            $code = $_.Exception.Response.StatusCode.value__
            $lastStatus = if ($code) { "HTTP $code" } else { $_.Exception.Message.Split([Environment]::NewLine)[0] }
        }
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 3
    }

    Write-Host ""
    Write-Warning "$Name did not become ready within ${TimeoutSeconds}s (last: $lastStatus)"
    Write-Host "  logs: docker compose logs $Name --tail 60" -ForegroundColor DarkGray
    return $false
}

try {
    # --- preflight -------------------------------------------------------------------
    if (-not (Test-Path 'publish\Shesha.CacheTests.Host.dll')) {
        throw "publish/ is empty or incomplete. Run ./publish.ps1 first."
    }

    # .env is optional now: the stack ships its own SQL Server seeded from the checked-in
    # bacpac. It is only needed to point the instances at a different database.
    if ((Test-Path '.env') -and ((Get-Content '.env' -Raw) -match 'CHANGE_ME')) {
        throw ".env still contains the placeholder password. Set a real password or delete .env to use the bundled SQL container."
    }

    if ((Invoke-Docker info --format '{{.ServerVersion}}') -ne 0) {
        throw "Docker does not appear to be running. Start Docker Desktop and retry."
    }

    # Always build: the app is COPYed into the image (the bind mount was dropped because Docker
    # Desktop served stale content), so skipping the build would run whatever was baked last time.
    # The COPY is the final layer, so this is quick when nothing changed.
    $buildArgs = @('--build')

    # --- database ----------------------------------------------------------------------
    # sql-init imports the bacpac and exits; compose blocks the api services on its success.
    Write-Host "`n[1/4] Starting SQL Server and importing the bacpac..." -ForegroundColor Cyan
    Write-Host "  (first run builds the importer image and takes a few minutes)" -ForegroundColor DarkGray
    if ((Invoke-Docker compose up @buildArgs --exit-code-from sql-init sql-init) -ne 0) {
        throw "bacpac import failed -- see: docker compose logs sql-init"
    }

    # --- redis -----------------------------------------------------------------------
    Write-Host "`n[2/4] Starting Redis..." -ForegroundColor Cyan
    if ((Invoke-Docker compose up -d @buildArgs redis) -ne 0) { throw "failed to start redis" }

    # --- instance 1 (migrates) -------------------------------------------------------
    Write-Host "`n[3/4] Starting api-1 (owns migration)..." -ForegroundColor Cyan
    if ((Invoke-Docker compose up -d @buildArgs api-1) -ne 0) { throw "failed to start api-1" }

    $ok = Wait-ForInstance -Name 'api-1' -Url 'http://localhost:22021/api/cache-diagnostics/instance' `
                           -TimeoutSeconds $MigrationTimeoutSeconds
    if (-not $ok) { throw "api-1 failed to start; not starting api-2/api-3." }

    # --- instances 2 and 3 -----------------------------------------------------------
    Write-Host "`n[4/4] Starting api-2 and api-3 (migrations skipped)..." -ForegroundColor Cyan
    if ((Invoke-Docker compose up -d api-2 api-3) -ne 0) { throw "failed to start api-2/api-3" }

    $r2 = Wait-ForInstance -Name 'api-2' -Url 'http://localhost:22022/api/cache-diagnostics/instance' -TimeoutSeconds 180
    $r3 = Wait-ForInstance -Name 'api-3' -Url 'http://localhost:22023/api/cache-diagnostics/instance' -TimeoutSeconds 180

    if ($Loadtest) {
        Write-Host "`nStarting nginx (loadtest profile)..." -ForegroundColor Cyan
        Invoke-Docker compose --profile loadtest up -d nginx | Out-Null
    }

    Write-Host "`n--- cluster ready ---" -ForegroundColor Green
    Write-Host "  api-1   http://localhost:22021"
    Write-Host "  api-2   http://localhost:22022"
    Write-Host "  api-3   http://localhost:22023"
    Write-Host "  redis   localhost:6379"
    Write-Host "  sql     localhost:21433 (sa / Cache@Test1)"
    if ($Loadtest) { Write-Host "  nginx   http://localhost:22020  (round-robin)" }

    if (-not ($r2 -and $r3)) {
        Write-Warning "One or more secondary instances are not ready -- coherence tests will fail."
    }
}
finally {
    Pop-Location
}
