@echo off
echo 🔍 Fixr Production Environment Check
echo ==================================

echo.
echo 📋 Checking Required Commands...
echo ==================================

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ node is available
) else (
    echo ❌ node is not installed
)

where npm >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ npm is available
) else (
    echo ❌ npm is not installed
)

where git >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ git is available
) else (
    echo ❌ git is not installed
)

where vercel >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ vercel is available
) else (
    echo ❌ vercel is not installed
)

echo.
echo 📋 Checking Required Files...
echo ==================================

if exist "package.json" (
    echo ✅ package.json exists
) else (
    echo ❌ package.json does not exist
)

if exist "next.config.js" (
    echo ✅ next.config.js exists
) else (
    echo ❌ next.config.js does not exist
)

if exist "vercel.json" (
    echo ✅ vercel.json exists
) else (
    echo ❌ vercel.json does not exist
)

if exist "prisma\schema.prisma" (
    echo ✅ prisma\schema.prisma exists
) else (
    echo ❌ prisma\schema.prisma does not exist
)

if exist ".env.example" (
    echo ✅ .env.example exists
) else (
    echo ❌ .env.example does not exist
)

echo.
echo 📋 Checking Environment Variables...
echo ==================================

if exist ".env.local" (
    echo ⚠️  .env.local found ^(should not be committed to git^)
    
    REM Check for key environment variables
    findstr /C:"DATABASE_URL=" .env.local >nul
    if %errorlevel% equ 0 (
        echo ✅ DATABASE_URL is set
    ) else (
        echo ❌ DATABASE_URL is not set
    )
    
    findstr /C:"NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=" .env.local >nul
    if %errorlevel% equ 0 (
        echo ✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set
    ) else (
        echo ❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set
    )
    
    findstr /C:"CLERK_SECRET_KEY=" .env.local >nul
    if %errorlevel% equ 0 (
        echo ✅ CLERK_SECRET_KEY is set
    ) else (
        echo ❌ CLERK_SECRET_KEY is not set
    )
    
    findstr /C:"GITHUB_CLIENT_ID=" .env.local >nul
    if %errorlevel% equ 0 (
        echo ✅ GITHUB_CLIENT_ID is set
    ) else (
        echo ❌ GITHUB_CLIENT_ID is not set
    )
    
    findstr /C:"GITHUB_CLIENT_SECRET=" .env.local >nul
    if %errorlevel% equ 0 (
        echo ✅ GITHUB_CLIENT_SECRET is set
    ) else (
        echo ❌ GITHUB_CLIENT_SECRET is not set
    )
) else (
    echo ⚠️  .env.local not found ^(create from .env.example^)
)

echo.
echo 📋 Checking Node Modules...
echo ==================================

if exist "node_modules" (
    echo ✅ node_modules exists
) else (
    echo ❌ node_modules not found
    echo    Run: npm install
)

echo.
echo 📋 Checking TypeScript Compilation...
echo ==================================

npm run type-check >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ TypeScript compilation successful
) else (
    echo ❌ TypeScript compilation failed
    echo    Run: npm run type-check to see errors
)

echo.
echo 📋 Checking Linting...
echo ==================================

npm run lint >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Linting passed
) else (
    echo ❌ Linting failed
    echo    Run: npm run lint to see errors
)

echo.
echo 📋 Checking Build Process...
echo ==================================

npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Build successful
) else (
    echo ❌ Build failed
    echo    Run: npm run build to see errors
)

echo.
echo 📋 Checking Prisma Setup...
echo ==================================

where prisma >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ Prisma CLI available
    
    if exist "node_modules\.prisma" (
        echo ✅ Prisma client generated
    ) else (
        echo ❌ Prisma client not generated
        echo    Run: npm run db:prisma:generate
    )
) else (
    echo ❌ Prisma CLI not available
    echo    Run: npm install prisma
)

echo.
echo 📋 Checking Git Status...
echo ==================================

git status --porcelain >nul 2>&1
if %errorlevel% equ 1 (
    echo ✅ Working directory clean
) else (
    echo ⚠️  Uncommitted changes detected
    echo    Commit or stash changes before deploying
)

echo.
echo 📋 Checking for Hardcoded URLs...
echo ==================================

findstr /S /C:"localhost:3000" app\ >nul 2>&1
if %errorlevel% equ 1 (
    echo ✅ No hardcoded localhost URLs found
) else (
    echo ❌ Hardcoded localhost URLs found
    echo    Replace with environment variables
)

echo.
echo 📋 Summary
echo ==================================

echo 🚀 Ready for deployment if all checks pass!
echo.
echo Next steps:
echo 1. Fix any failed checks above
echo 2. Run: vercel --prod
echo 3. Configure environment variables in Vercel dashboard
echo 4. Update GitHub OAuth and webhook URLs
echo 5. Test all functionality
echo.
echo 📖 See DEPLOYMENT_GUIDE.md for detailed instructions
pause
