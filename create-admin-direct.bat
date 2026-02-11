@echo off
echo ========================================
echo   Creating Admin User Directly
echo ========================================
echo.

echo Creating admin user in database...
docker exec ideahub-postgres psql -U postgres -d ideahub -c "INSERT INTO users (id, email, password, name, role, created_at, updated_at) VALUES (gen_random_uuid(), 'admin@ideahub.com', '$2b$10$K7L/MtJ15r8hRihWudy8zu52BrBI8KH0W5UfcHKRGmg4GKO4ys5S2', 'Admin User', 'admin', NOW(), NOW()) ON CONFLICT (email) DO NOTHING RETURNING email, name, role;"

echo.
echo ========================================
echo   Admin User Ready!
echo ========================================
echo.
echo Login credentials:
echo   Email: admin@ideahub.com
echo   Password: admin123
echo.
echo Go to: http://localhost:3000/login
echo.
pause
