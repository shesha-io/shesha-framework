@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  Configuration
REM ============================================================
set "CONFIGURATION=Release"
set "OUTPUT_DIR=%~dp0..\artifacts\packages"
set "LOCAL_FEED=%~dp0..\artifacts\local-feed"

REM Optional: bump version here, or read from a file, or pass as %1
set "VERSION=0.47.0"

REM Paths to the projects to pack (space-separated)
rem add Shesha.Redis after merge
set "PROJECTS=Shesha.Application,Shesha.Common,Shesha.Core,Shesha.Elmah,Shesha.FluentMigrator,Shesha.Framework,Shesha.GraphQL,Shesha.Import,Shesha.MongoRepository,Shesha.NHibernate,Shesha.NHibernate.PostGis,Shesha.RestSharp,Shesha.Scheduler,Shesha.Sms.Clickatell,Shesha.Web.FormsDesigner"

REM ============================================================
REM  Prepare folders
REM ============================================================
if exist "%OUTPUT_DIR%" rmdir /s /q "%OUTPUT_DIR%"
mkdir "%OUTPUT_DIR%" 2>nul

if not exist "%LOCAL_FEED%" mkdir "%LOCAL_FEED%" 2>nul

echo.
echo ============================================================
echo  Building NuGet packages
echo  Configuration : %CONFIGURATION%
echo  Version       : %VERSION%
echo  Output        : %OUTPUT_DIR%
echo  Local feed    : %LOCAL_FEED%
echo ============================================================
echo.

REM ============================================================
REM  Locate dotnet
REM ============================================================
where dotnet >nul 2>nul
if errorlevel 1 (
    echo [ERROR] dotnet CLI not found in PATH.
    exit /b 1
)

REM ============================================================
REM  Clean + Restore (optional but recommended)
REM ============================================================
echo [1/3] Restoring packages...
dotnet restore || goto :error

REM ============================================================
REM  Pack each project
REM ============================================================
echo.
echo [2/3] Packing projects...

for %%P in (%PROJECTS%) do (
    echo   - Packing %%P
	dotnet build ".\src\%%P\%%P.csproj" ^
        --configuration %CONFIGURATION% ^
        --no-restore ^
        -p:Version=%VERSION% ^
        -p:PackageVersion=%VERSION% ^
        -p:ContinuousIntegrationBuild=true ^
        || goto :error
    dotnet pack ".\src\%%P\%%P.csproj" ^
        --configuration %CONFIGURATION% ^
        --no-restore ^
        --output "%OUTPUT_DIR%" ^
        -p:Version=%VERSION% ^
        -p:PackageVersion=%VERSION% ^
        -p:ContinuousIntegrationBuild=true ^
        || goto :error
)

REM ============================================================
REM  Copy to local feed (preserving existing packages)
REM ============================================================
echo.
echo [3/3] Publishing to local feed "%LOCAL_FEED%"...

copy /y "%OUTPUT_DIR%\*.nupkg" "%LOCAL_FEED%\" >nul
if errorlevel 1 (
    echo [ERROR] Failed to copy packages to local feed.
    goto :error
)

REM Also copy symbol packages if present
copy /y "%OUTPUT_DIR%\*.snupkg" "%LOCAL_FEED%\" >nul 2>nul

echo.
echo ============================================================
echo  Done.
echo  Packages in : %OUTPUT_DIR%
echo  Local feed  : %LOCAL_FEED%
echo ============================================================
echo.
echo To consume the feed, add it to nuget.config:
echo   ^<add key="local" value="%LOCAL_FEED%" /^>
echo.
exit /b 0

:error
echo.
echo [FAILED] Build aborted with error %errorlevel%.
exit /b %errorlevel%