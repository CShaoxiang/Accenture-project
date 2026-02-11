@echo off
echo ========================================
echo   Idea Hub - Complete Startup
echo ========================================
echo.

echo [1/4] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Desktop is not running!
    echo.
    echo Please start Docker Desktop and wait for it to fully start.
    echo Look for the whale icon in your system tray.
    echo.
    echo Then run this script again.
    pause
    exit /b 1
)

echo Docker is running! Starting containers...
docker-compose up -d
echo.
echo Waiting for PostgreSQL to be ready...
echo This may take 20-30 seconds on first run...
timeout /t 20 /nobreak >nul

echo Checking if PostgreSQL is accepting connections...
:wait_for_postgres
docker exec ideahub-postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    echo Still waiting for PostgreSQL...
    timeout /t 3 /nobreak >nul
    goto wait_for_postgres
)
echo PostgreSQL is ready!
echo.

echo [2/4] Setting up backend database...
cd packages\backend
call npx prisma generate
call npx prisma migrate dev --name init
echo.

echo [3/4] Starting backend server...
start "Idea Hub Backend" cmd /k "npm run dev"
cd ..\..
timeout /t 3 /nobreak >nul
echo.

echo [4/4] Starting frontend server...
cd packages\frontend
start "Idea Hub Frontend" cmd /k "npm run dev"
cd ..\..
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to view logs or close this window...
pause >nul

docker-compose logs -f
