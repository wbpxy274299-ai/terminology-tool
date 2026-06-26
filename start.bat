@echo off
chcp 65001 >nul
title Terminology Tool

echo.
echo ============================================
echo   Starting server...
echo ============================================
echo.

cd /d "%~dp0"

:: Try python (Windows 11 built-in or user installed)
python --version >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Python found
    echo Open browser: http://localhost:8080
    echo Press Ctrl+C to stop
    echo.
    start http://localhost:8080
    python -m http.server 8080
    goto :end
)

:: Try python3
python3 --version >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Python3 found
    echo Open browser: http://localhost:8080
    echo Press Ctrl+C to stop
    echo.
    start http://localhost:8080
    python3 -m http.server 8080
    goto :end
)

:: Try py (Windows Python launcher)
py --version >nul 2>&1
if %errorlevel%==0 (
    echo [OK] py found
    echo Open browser: http://localhost:8080
    echo Press Ctrl+C to stop
    echo.
    start http://localhost:8080
    py -m http.server 8080
    goto :end
)

:: Try node
node --version >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Node.js found
    echo Open browser: http://localhost:8080
    echo Press Ctrl+C to stop
    echo.
    start http://localhost:8080
    npx -y http-server -p 8080
    goto :end
)

echo [ERROR] No Python or Node.js found!
echo.
echo Please install Python:
echo https://www.python.org/ftp/python/3.12.4/python-3.12.4-amd64.exe
echo.
echo Download and install, check "Add Python to PATH" during install.
echo Then double-click start.bat again.
echo.
pause

:end
