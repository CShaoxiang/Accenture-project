@echo off
echo Fixing database setup...
echo.

echo Enabling UUID extension...
docker exec ideahub-postgres psql -U postgres -d ideahub -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"

echo.
echo Dropping and recreating users table with proper UUID support...
docker exec ideahub-postgres psql -U postgres -d ideahub -c "DROP TABLE IF EXISTS users CASCADE;"
docker exec ideahub-postgres psql -U postgres -d ideahub -c "CREATE TABLE users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, role VARCHAR(50) DEFAULT 'recruiter', created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());"

echo.
echo Checking table structure...
docker exec ideahub-postgres psql -U postgres -d ideahub -c "\d users"

echo.
echo Database fixed!
echo.
echo Now restart your backend server:
echo 1. Press Ctrl+C in the backend terminal
echo 2. Run: npm run dev
echo.
pause
