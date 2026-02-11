@echo off
echo Checking Docker Desktop status...
echo.

docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Desktop is NOT running
    echo.
    echo Please:
    echo 1. Open Docker Desktop from Start Menu
    echo 2. Wait for the whale icon to appear in system tray
    echo 3. Wait until it says "Docker Desktop is running"
    echo 4. Then run start-all.bat again
    echo.
) else (
    echo ✅ Docker Desktop is running!
    echo.
    echo You can now run: start-all.bat
    echo.
)

pause
