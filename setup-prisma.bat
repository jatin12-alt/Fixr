@echo off
echo 🔧 Setting up Prisma for Fixr...

REM Install Prisma dependencies
echo 📦 Installing Prisma dependencies...
call npm install prisma @prisma/client

REM Generate Prisma client
echo 🔨 Generating Prisma client...
call npx prisma generate

REM Create initial migration (if schema exists)
if exist "prisma\schema.prisma" (
    echo 🗄️ Creating initial migration...
    call npx prisma migrate dev --name init
) else (
    echo ❌ Prisma schema not found at prisma\schema.prisma
    exit /b 1
)

echo ✅ Prisma setup complete!
echo.
echo 📋 Next steps:
echo 1. Make sure your DATABASE_URL is set in .env.local
echo 2. Run 'npx prisma migrate deploy' to apply migrations to production
echo 3. The database client is now available at '@/lib/db'
pause
