@echo off
echo 🔍 Fixr Server Diagnostic Tool
echo ==============================
echo.

echo 📍 Current Directory:
cd
echo.

echo 📦 Node.js Version:
node --version
echo.

echo 📦 NPM Version:
npm --version
echo.

echo 📦 Next.js Version:
npx next --version
echo.

echo 📁 Checking App Structure:
if exist "app" (
    echo ✅ app/ directory exists
) else (
    echo ❌ app/ directory missing
)

if exist "app\layout.tsx" (
    echo ✅ app\layout.tsx exists
) else (
    echo ❌ app\layout.tsx missing
)

if exist "app\page.tsx" (
    echo ✅ app\page.tsx exists
) else (
    echo ❌ app\page.tsx missing
)
echo.

echo 📁 Checking Configuration Files:
if exist "package.json" (
    echo ✅ package.json exists
) else (
    echo ❌ package.json missing
)

if exist "next.config.js" (
    echo ✅ next.config.js exists
) else (
    echo ❌ next.config.js missing
)

if exist ".env.local" (
    echo ✅ .env.local exists
) else (
    echo ⚠️ .env.local missing ^(may be needed^)
)
echo.

echo 📦 Checking Dependencies:
if exist "node_modules" (
    echo ✅ node_modules exists
) else (
    echo ❌ node_modules missing - run npm install
)

echo Checking Next.js in node_modules...
if exist "node_modules\next" (
    echo ✅ Next.js installed
) else (
    echo ❌ Next.js not installed
)
echo.

echo 🔍 Checking Port 3000:
netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo ⚠️ Port 3000 is in use
) else (
    echo ✅ Port 3000 is free
)
echo.

echo 🚀 Attempting to start Next.js...
echo If this fails, the error message will appear below:
echo.

rem Try to start Next.js with timeout
timeout /t 3 /nobreak >nul
echo Starting Next.js...
npm run dev

echo.
echo 📊 Diagnostic complete!
pause
