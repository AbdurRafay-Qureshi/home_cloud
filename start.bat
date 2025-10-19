@echo off
title Home Cloud Storage Server
color 0A

REM Change to the directory where this batch file is located
cd /d "%~dp0"

echo ========================================
echo   Home Cloud Storage Server
echo ========================================
echo.
echo [INFO] Multi-user cloud storage system
echo [INFO] Storage location: E:\cloud
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo.
    echo Please install Python 3.8 or higher from:
    echo https://www.python.org/downloads/
    echo.
    echo Make sure to check "Add Python to PATH" during installation!
    pause
    exit /b 1
)

echo [1/6] Python detected successfully
python --version
echo.

REM Check if pip is available
pip --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pip is not available!
    echo.
    echo Please ensure pip is installed with Python.
    pause
    exit /b 1
)

echo [2/6] pip is available
echo.

REM Check if requirements.txt exists
if not exist "requirements.txt" (
    echo [ERROR] requirements.txt not found!
    echo.
    echo Expected location: %cd%\requirements.txt
    echo.
    echo Please make sure all project files are in the same directory.
    pause
    exit /b 1
)

echo [3/6] Installing/Updating dependencies...
echo.
pip install -r requirements.txt --upgrade --quiet
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies!
    echo.
    echo Trying again with verbose output...
    echo.
    pip install -r requirements.txt --upgrade
    pause
    exit /b 1
)

echo [4/6] Dependencies installed successfully
echo.

REM Check if main.py exists
if not exist "main.py" (
    echo [ERROR] main.py not found!
    echo.
    echo Expected location: %cd%\main.py
    pause
    exit /b 1
)

REM Check and create project structure
echo [5/6] Verifying project structure...

if not exist "templates" (
    echo [WARNING] templates folder not found! Creating...
    mkdir templates
)

if not exist "static" (
    echo [WARNING] static folder not found! Creating...
    mkdir static
)

REM Check required template files
if not exist "templates\index.html" (
    echo [WARNING] templates\index.html not found!
)

if not exist "templates\login.html" (
    echo [WARNING] templates\login.html not found!
)

if not exist "templates\register.html" (
    echo [WARNING] templates\register.html not found!
)

REM Check required static files
if not exist "static\style.css" (
    echo [WARNING] static\style.css not found!
)

if not exist "static\auth.css" (
    echo [WARNING] static\auth.css not found!
)

if not exist "static\main.js" (
    echo [WARNING] static\main.js not found!
)

echo.
echo Project structure verified.
echo.

echo [6/6] Starting Flask server...
echo.
echo ========================================
echo   Server Configuration
echo ========================================
echo.
echo Storage Path: E:\cloud
echo Local Access: http://127.0.0.1:5000
echo Network Access: http://YOUR_LOCAL_IP:5000
echo.
echo ========================================
echo   Features
echo ========================================
echo.
echo - Multi-user authentication
echo - Multiple file upload support
echo - Folder upload support
echo - Isolated user storage
echo.
echo First time? Register a new account!
echo Already registered? Login to access your files.
echo.
echo ========================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul

REM Start Flask server and open browser
start "" "http://127.0.0.1:5000/login"
python main.py

echo.
echo ========================================
echo   Server Stopped
echo ========================================
echo.
echo Server has been stopped.
echo Your files are safe in E:\cloud
echo.
pause
