<#
.SYNOPSIS
    Publishes the functional-test host into ./publish for the container bind mount.

.DESCRIPTION
    The app is built on the HOST rather than inside the container, then COPYed into the image.

    Do NOT expect `docker compose restart` to pick up a new build: the publish output is baked
    into the image, so the follow-up is `docker compose up -d --build`. An earlier version of this
    rig bind-mounted ./publish instead, but Docker Desktop served stale files to the running
    container and tests silently ran old code.

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

# Wipe the output directory rather than publishing over it. `dotnet publish` skips files it
# considers up to date, so a hand-edited appsettings.json in the output survives a republish and
# silently gets baked into the image -- which is exactly how an L1-disabling override once leaked
# into a full test run.
if (Test-Path $outDir) {
    Remove-Item -Recurse -Force $outDir
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
Write-Host "Next: docker compose up -d --build   (or ./up.ps1 for a cold start)" -ForegroundColor DarkGray
