<#
.SYNOPSIS
    Publishes the functional-test host into ./publish for the container bind mount.

.DESCRIPTION
    The app is built on the HOST rather than inside the container so the edit -> test loop
    stays in the seconds range. The containers bind-mount ./publish at /app, so after this
    script completes a `docker compose restart` picks up the new build with no image rebuild.

.EXAMPLE
    ./publish.ps1
    ./publish.ps1 -Configuration Debug
#>
[CmdletBinding()]
param(
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Release'
)

$ErrorActionPreference = 'Stop'

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$project = Join-Path $here '..\Shesha.CacheTests.Host\Shesha.CacheTests.Host.csproj'
$outDir = Join-Path $here 'publish'

Write-Host "Publishing ($Configuration) -> $outDir" -ForegroundColor Cyan

# App_Data is a per-instance docker volume at runtime; clearing it here keeps stale logs
# from the previous build out of the bind mount.
if (Test-Path (Join-Path $outDir 'App_Data')) {
    Remove-Item -Recurse -Force (Join-Path $outDir 'App_Data')
}

dotnet publish $project -c $Configuration -o $outDir

if ($LASTEXITCODE -ne 0) {
    throw "dotnet publish failed with exit code $LASTEXITCODE"
}

$sha = (git -C $here rev-parse --short HEAD 2>$null)
if ($sha) {
    Set-Content -Path (Join-Path $outDir 'BUILD_SHA.txt') -Value $sha -Encoding utf8
    Write-Host "Build SHA: $sha" -ForegroundColor DarkGray
}

Write-Host "Publish complete." -ForegroundColor Green
Write-Host "Next: docker compose restart   (or ./up.ps1 for a cold start)" -ForegroundColor DarkGray
