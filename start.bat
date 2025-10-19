@echo off
title Home Cloud Storage Server
color 0A

REM Change to the directory where this batch file is located
cd /d "%~dp0"

echo ========================================
echo   Home Cloud Storage Server
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo [1/4] Python detected successfully
echo.

REM Check if pip is available
pip --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pip is not available!
    pause
    exit /b 1
)

REM Check if requirements.txt exists
if not exist "requirements.txt" (
    echo [ERROR] requirements.txt not found in current directory!
    echo Current directory: %cd%
    echo.
    dir /b
    pause
    exit /b 1
)

echo [2/4] Installing/Updating dependencies...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies!
    echo Trying without --quiet flag to see errors...
    pip install -r requirements.txt
    pause
    exit /b 1
)

echo [3/4] Dependencies installed successfully
echo.

REM Check if main.py exists
if not exist "main.py" (
    echo [ERROR] main.py not found!
    pause
    exit /b 1
)

echo [4/4] Starting Flask server...
echo.
echo Server will start in 3 seconds...
echo Your browser will open automatically.
echo.
echo ========================================
timeout /t 3 /nobreak >nul

REM Start Flask server and open browser
start "" "http://127.0.0.1:5000"
python main.py

pause
