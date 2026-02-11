@echo off
echo ========================================
echo   Creating Admin User
echo ========================================
echo.

cd packages\backend
node ..\..\create-admin-user.js

echo.
pause
