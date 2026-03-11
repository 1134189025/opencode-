@echo off
title Prompt Enhancer Installer
echo.
echo   ==========================================
echo     Prompt Enhancer - Install Script
echo   ==========================================
echo.

:: --- Target path (directly under plugins, no subfolder) ---
set "TARGET=%USERPROFILE%\.config\opencode\plugins"
set "SOURCE=%~dp0"

:: --- Check source files ---
if not exist "%SOURCE%prompt-enhancer.ts" (
    echo   [ERROR] Plugin files not found in current directory.
    echo   [TIP]   Make sure this script is in the same folder as prompt-enhancer.ts
    echo.
    pause
    exit /b 1
)

:: --- Create target directory ---
echo   Install to: %TARGET%
echo.

if not exist "%TARGET%" (
    mkdir "%TARGET%"
    echo   [OK] Created plugins directory
)

if not exist "%TARGET%\gui" (
    mkdir "%TARGET%\gui"
)

:: --- Copy core files ---
echo.
echo   Copying plugin files...

copy /Y "%SOURCE%prompt-enhancer.ts" "%TARGET%\prompt-enhancer.ts" >nul
echo       + prompt-enhancer.ts
copy /Y "%SOURCE%config.ts" "%TARGET%\config.ts" >nul
echo       + config.ts
copy /Y "%SOURCE%config-server.ts" "%TARGET%\config-server.ts" >nul
echo       + config-server.ts
copy /Y "%SOURCE%start-gui.bat" "%TARGET%\start-gui.bat" >nul
echo       + start-gui.bat

:: --- Copy GUI files ---
echo.
echo   Copying GUI panel...

copy /Y "%SOURCE%gui\index.html" "%TARGET%\gui\index.html" >nul
echo       + gui/index.html
copy /Y "%SOURCE%gui\style.css" "%TARGET%\gui\style.css" >nul
echo       + gui/style.css
copy /Y "%SOURCE%gui\app.js" "%TARGET%\gui\app.js" >nul
echo       + gui/app.js

if exist "%SOURCE%gui\README.md" (
    copy /Y "%SOURCE%gui\README.md" "%TARGET%\gui\README.md" >nul
    echo       + gui/README.md
)

:: --- Preserve user config ---
if not exist "%TARGET%\prompt-enhancer-config.json" (
    echo.
    echo   [i] Fresh install - will use built-in defaults
) else (
    echo.
    echo   [i] Existing config preserved
)

:: --- Done ---
echo.
echo   ==========================================
echo     Install complete!
echo   ==========================================
echo.
echo   Location: %TARGET%
echo.
echo   Usage:
echo     1. Restart OpenCode to load the plugin
echo     2. Run start-gui.bat to open config panel:
echo        "%TARGET%\start-gui.bat"
echo.
pause
