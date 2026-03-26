@echo off
echo Testing Next.js startup...
echo.
echo Current directory: %CD%
echo.
echo Node version:
node --version
echo.
echo NPM version:
npm --version
echo.
echo Next.js version:
npx next --version
echo.
echo Starting Next.js dev server...
echo.
npm run dev
echo.
echo If you see this, the server has stopped.
pause
