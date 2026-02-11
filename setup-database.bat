@echo off
echo ========================================
echo   Setting Up Database
echo ========================================
echo.

echo Current directory: %CD%
echo.

cd /d "%~dp0packages\backend"

if not exist "prisma\schema.prisma" (
    echo ERROR: Cannot find prisma\schema.prisma
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo [1/2] Generating Prisma Client...
call npx prisma generate
echo.

echo [2/2] Running Database Migration...
call npx prisma migrate dev --name init
echo.

if errorlevel 1 (
    echo.
    echo ❌ Database setup failed!
    echo.
    echo This usually means PostgreSQL isn't ready yet.
    echo Wait 10 seconds and run this script again.
    echo.
    pause
    exit /b 1
)

cd /d "%~dp0"

echo ========================================
echo   Database Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: start-backend-only.bat
echo 2. Run: start-frontend-only.bat
echo 3. Open: http://localhost:3000
echo.
pause
