@echo off
chcp 65001 >nul
echo.
echo   ✨ Prompt Enhancer 配置面板
echo   ─────────────────────────────
echo.

:: 检查是否有 bun
where bun >nul 2>&1
if %errorlevel%==0 (
    echo   🚀 使用 Bun 启动配置服务器...
    echo   🌐 浏览器将自动打开 http://localhost:19827
    echo   按 Ctrl+C 停止
    echo.
    bun run "%~dp0config-server.ts"
    goto :eof
)

:: 检查是否有 npx (Node.js)
where npx >nul 2>&1
if %errorlevel%==0 (
    echo   🚀 使用 npx tsx 启动配置服务器...
    echo   🌐 浏览器将自动打开 http://localhost:19827
    echo   按 Ctrl+C 停止
    echo.
    npx tsx "%~dp0config-server.ts"
    goto :eof
)

:: --- 都没有，尝试自动安装 ---
echo   ⚠️  未检测到 Bun 或 Node.js
echo.
echo   需要安装运行环境才能启动配置服务器。
echo   请选择安装方式：
echo.
echo     [1] 安装 Bun（推荐，速度快体积小）
echo     [2] 安装 Node.js（通过 winget）
echo     [3] 跳过，以离线模式打开 GUI
echo.
set /p choice="   请输入选项 (1/2/3): "

if "%choice%"=="1" goto :install_bun
if "%choice%"=="2" goto :install_node
if "%choice%"=="3" goto :offline_mode
goto :offline_mode

:install_bun
echo.
echo   📦 正在安装 Bun...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "irm bun.sh/install.ps1 | iex"
if %errorlevel% neq 0 (
    echo.
    echo   ❌ Bun 安装失败，请检查网络或手动安装: https://bun.sh
    echo.
    pause
    exit /b 1
)
echo.
echo   ✅ Bun 安装完成！

:: 刷新环境变量（Bun 安装后会设置 BUN_INSTALL）
set "BUN_INSTALL=%USERPROFILE%\.bun"
set "PATH=%BUN_INSTALL%\bin;%PATH%"

:: 验证安装
where bun >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo   ⚠️  Bun 已安装但当前终端未生效。
    echo   请关闭此窗口，重新打开终端再运行此脚本。
    echo.
    pause
    exit /b 0
)

echo   🚀 使用 Bun 启动配置服务器...
echo   🌐 浏览器将自动打开 http://localhost:19827
echo   按 Ctrl+C 停止
echo.
bun run "%~dp0config-server.ts"
goto :eof

:install_node
echo.
:: 先检查 winget 是否可用
where winget >nul 2>&1
if %errorlevel% neq 0 (
    echo   ❌ 未检测到 winget 包管理器。
    echo.
    echo   请手动安装 Node.js：
    echo     https://nodejs.org/
    echo.
    echo   或者安装 Bun（不依赖 winget）：
    echo     选项 [1]
    echo.
    pause
    exit /b 1
)
echo   📦 正在通过 winget 安装 Node.js LTS...
echo.
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
if %errorlevel% neq 0 (
    echo.
    echo   ❌ Node.js 安装失败，请手动安装: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo.
echo   ✅ Node.js 安装完成！
echo.
echo   ⚠️  请关闭此窗口，重新打开终端再运行此脚本以加载环境变量。
echo.
pause
exit /b 0

:offline_mode
echo.
echo   📂 直接在浏览器中打开 GUI（离线模式）
echo   💡 保存设置时会下载配置文件，请手动放到插件目录
echo.
start "" "%~dp0gui\index.html"
