@echo off
echo ========================================
echo Updating Authentication Schema
echo ========================================

cd packages\backend

echo.
echo [1/3] Generating Prisma Client...
call npx prisma generate

echo.
echo [2/3] Creating Migration...
call npx prisma migrate dev --name update-user-to-username

echo.
echo [3/3] Migration Complete!
echo.
echo ========================================
echo Authentication schema updated!
echo ========================================
echo.
echo Changes:
echo - Changed 'email' field to 'username'
echo - Passwords are securely hashed with bcrypt
echo.
echo You can now:
echo 1. Start backend: npm run dev
echo 2. Start frontend: npm run dev
echo 3. Register at http://localhost:3000/register
echo.
pause
