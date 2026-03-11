@echo off
chcp 65001 >nul
title Prompt Enhancer Config Server
echo.
echo   Prompt Enhancer - Config Panel
echo   ===============================
echo.

:: Check bun
where bun >nul 2>&1
if not %errorlevel%==0 goto :check_npx

echo   Starting with Bun...
echo   Browser will open at http://localhost:19827
echo   Press Ctrl+C to stop
echo.
call bun run "%~dp0config-server.ts"
goto :done

:check_npx
where npx >nul 2>&1
if not %errorlevel%==0 goto :no_runtime

echo   Starting with npx tsx...
echo   Browser will open at http://localhost:19827
echo   Press Ctrl+C to stop
echo.
call npx tsx "%~dp0config-server.ts"
goto :done

:no_runtime
echo   [!] Bun and Node.js not found.
echo.
echo   Choose an option:
echo.
echo     [1] Install Bun (recommended)
echo     [2] Install Node.js (via winget)
echo     [3] Skip, open GUI in offline mode
echo.
set /p choice="   Enter (1/2/3): "

if "%choice%"=="1" goto :install_bun
if "%choice%"=="2" goto :install_node
goto :offline_mode

:install_bun
echo.
echo   Installing Bun...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "irm bun.sh/install.ps1 | iex"
if %errorlevel% neq 0 (
    echo   [ERROR] Bun install failed. Visit https://bun.sh
    goto :done
)
echo   [OK] Bun installed!
set "BUN_INSTALL=%USERPROFILE%\.bun"
set "PATH=%BUN_INSTALL%\bin;%PATH%"
where bun >nul 2>&1
if %errorlevel% neq 0 (
    echo   [!] Please close this window and re-run the script.
    goto :done
)
echo   Starting server...
echo.
call bun run "%~dp0config-server.ts"
goto :done

:install_node
echo.
where winget >nul 2>&1
if %errorlevel% neq 0 (
    echo   [ERROR] winget not found. Install Node.js manually: https://nodejs.org/
    goto :done
)
echo   Installing Node.js LTS via winget...
echo.
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
echo.
echo   [OK] Done. Please close this window and re-run the script.
goto :done

:offline_mode
echo.
echo   Opening GUI in offline mode...
echo   (Config changes will be downloaded as file)
echo.
start "" "%~dp0gui\index.html"
goto :done

:done
echo.
echo   Press any key to close...
pause >nul
