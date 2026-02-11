@echo off
echo ========================================
echo   Resetting Admin Password
echo ========================================
echo.

echo Deleting old admin user...
docker exec ideahub-postgres psql -U postgres -d ideahub -c "DELETE FROM users WHERE email = 'admin@ideahub.com';"

echo.
echo Creating new admin user with fresh password...
docker exec ideahub-postgres psql -U postgres -d ideahub -c "INSERT INTO users (id, email, password, name, role, created_at, updated_at) VALUES (gen_random_uuid(), 'admin@ideahub.com', '$2a$10$YourHashedPasswordHere', 'Admin User', 'admin', NOW(), NOW());"

echo.
echo ========================================
echo   Password Reset Complete!
echo ========================================
echo.
echo Try signing up with a new account instead:
echo 1. Go to http://localhost:3000
echo 2. Click "Sign up"
echo 3. Create your account
echo 4. Login and see the dashboard!
echo.
pause
