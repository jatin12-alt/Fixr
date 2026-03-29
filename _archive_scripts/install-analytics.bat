@echo off
echo 🔧 Installing Analytics Dependencies for Fixr
echo =============================================

echo.
echo 📊 Installing Vercel Analytics...
call npm install @vercel/analytics @vercel/speed-insights

echo.
echo ✅ Analytics dependencies installed!
echo.
echo 📋 Next steps:
echo 1. Deploy to Vercel: vercel --prod
echo 2. Analytics will be automatically enabled
echo 3. Check Vercel Dashboard -^> Analytics for insights
echo.
echo 🎯 Custom event tracking is available in:
echo    - lib/analytics-tracking.ts
echo    - Use trackEvent() for custom tracking
echo.
echo 📈 Analytics features:
echo    - Page view tracking (automatic)
echo    - Core Web Vitals monitoring
echo    - User behavior insights
echo    - Performance metrics
pause
