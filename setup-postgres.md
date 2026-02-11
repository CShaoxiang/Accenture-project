# PostgreSQL Setup Guide for Windows

## Option 1: Install PostgreSQL (Recommended)

### Download and Install
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Set password for postgres user: `postgres` (or remember what you set)
   - Port: `5432` (default)
   - Install pgAdmin 4 (GUI tool)

### Create Database
After installation, open **pgAdmin 4** or **SQL Shell (psql)**:

**Using pgAdmin 4:**
1. Open pgAdmin 4
2. Connect to PostgreSQL (password: `postgres`)
3. Right-click "Databases" → Create → Database
4. Name: `ideahub`
5. Click Save

**Using SQL Shell (psql):**
```sql
CREATE DATABASE ideahub;
```

## Option 2: Use Docker (Alternative)

If you have Docker installed:

```bash
docker run --name ideahub-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ideahub -p 5432:5432 -d postgres:15
```

## Verify Connection

Test if PostgreSQL is running:

```bash
# In packages/backend folder
npx prisma db pull
```

If successful, you're connected!

## Update Connection String (if needed)

If you used a different password or port, update `packages/backend/.env`:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ideahub?schema=public"
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password.
