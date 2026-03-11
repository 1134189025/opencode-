@echo off
title Prompt Enhancer Uninstaller
echo.
echo   ==========================================
echo     Prompt Enhancer - Uninstall Script
echo   ==========================================
echo.

set "TARGET=%USERPROFILE%\.config\opencode\plugins"

:: --- Check if files exist ---
if not exist "%TARGET%\prompt-enhancer.ts" (
    echo   [!] Plugin not found. Nothing to uninstall.
    echo.
    pause
    exit /b 0
)

echo   Will remove plugin files from: %TARGET%
echo.
set /p confirm="   Confirm uninstall? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo   Cancelled.
    pause
    exit /b 0
)

:: --- Remove plugin files only (not the whole plugins dir) ---
del /Q "%TARGET%\prompt-enhancer.ts" 2>nul
del /Q "%TARGET%\config.ts" 2>nul
del /Q "%TARGET%\config-server.ts" 2>nul
del /Q "%TARGET%\start-gui.bat" 2>nul
del /Q "%TARGET%\prompt-enhancer-config.json" 2>nul
del /Q "%TARGET%\prompt-enhancer-history.json" 2>nul
if exist "%TARGET%\gui" rmdir /S /Q "%TARGET%\gui"

echo.
echo   [OK] Prompt Enhancer has been uninstalled.
echo   [i]  Restart OpenCode to take effect.
echo.
pause
