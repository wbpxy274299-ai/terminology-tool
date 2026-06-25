@echo off
chcp 65001 >nul
title 游戏术语校对工具
echo ============================================
echo   游戏术语校对工具 - 启动中...
echo ============================================
echo.

:: 尝试用 Python 启动（最常见）
where python >nul 2>&1
if %errorlevel%==0 (
    echo [OK] 找到 Python，启动本地服务...
    python -m http.server 8080
    goto :end
)

:: 尝试 python3
where python3 >nul 2>&1
if %errorlevel%==0 (
    echo [OK] 找到 Python3，启动本地服务...
    python3 -m http.server 8080
    goto :end
)

:: 尝试 Node.js
where npx >nul 2>&1
if %errorlevel%==0 (
    echo [OK] 找到 Node.js，启动本地服务...
    npx http-server -p 8080 -o
    goto :end
)

echo [ERROR] 未找到 Python 或 Node.js
echo 请安装 Python 后重试：https://www.python.org/downloads/
echo.
pause

:end
