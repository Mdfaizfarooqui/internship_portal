@echo off
echo ==========================================
echo   Internship Portal Backend Starter
echo ==========================================

echo [1/2] Starting MySQL Server (minimized)...
start /min "MySQL Server" "C:\xampp\mysql_start.bat"

echo Waiting 5 seconds for Database to initialize...
timeout /t 5 /nobreak >nul

echo [2/2] Starting PHP Development Server...
echo Server running at http://localhost:8000
echo Press Ctrl+C to stop the server.
"C:\xampp\php\php.exe" -S localhost:8000 index.php
