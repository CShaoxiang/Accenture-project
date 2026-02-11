@echo off
echo ========================================
echo   Starting Docker Containers Only
echo ========================================
echo.

echo Starting PostgreSQL and Redis...
docker-compose up -d

echo.
echo Waiting 30 seconds for containers to be ready...
echo (This is normal on first run)
timeout /t 30 /nobreak

echo.
echo Checking container status...
docker-compose ps

echo.
echo ========================================
echo   Containers Started!
echo ========================================
echo.
echo Next steps:
echo 1. Open a terminal and run: cd packages\backend
echo 2. Run: npx prisma generate
echo 3. Run: npx prisma migrate dev --name init
echo 4. Run: npm run dev
echo.
echo 5. Open ANOTHER terminal and run: cd packages\frontend
echo 6. Run: npm run dev
echo.
echo Or see MANUAL-START.md for detailed instructions
echo.
pause
