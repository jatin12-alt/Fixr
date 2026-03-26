#!/bin/bash

echo "🔍 Fixr Server Diagnostic Tool"
echo "=============================="
echo ""

echo "📍 Current Directory:"
pwd
echo ""

echo "📦 Node.js Version:"
node --version
echo ""

echo "📦 NPM Version:"
npm --version
echo ""

echo "📦 Next.js Version:"
npx next --version
echo ""

echo "📁 Checking App Structure:"
if [ -d "app" ]; then
    echo "✅ app/ directory exists"
else
    echo "❌ app/ directory missing"
fi

if [ -f "app/layout.tsx" ]; then
    echo "✅ app/layout.tsx exists"
else
    echo "❌ app/layout.tsx missing"
fi

if [ -f "app/page.tsx" ]; then
    echo "✅ app/page.tsx exists"
else
    echo "❌ app/page.tsx missing"
fi
echo ""

echo "📁 Checking Configuration Files:"
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
else
    echo "❌ package.json missing"
fi

if [ -f "next.config.js" ]; then
    echo "✅ next.config.js exists"
else
    echo "❌ next.config.js missing"
fi

if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
else
    echo "⚠️ .env.local missing (may be needed)"
fi
echo ""

echo "📦 Checking Dependencies:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
else
    echo "❌ node_modules missing - run npm install"
fi

echo "Checking Next.js in node_modules..."
if [ -d "node_modules/next" ]; then
    echo "✅ Next.js installed"
else
    echo "❌ Next.js not installed"
fi
echo ""

echo "🔍 Checking Port 3000:"
if lsof -i :3000 >/dev/null 2>&1; then
    echo "⚠️ Port 3000 is in use"
    lsof -i :3000
else
    echo "✅ Port 3000 is free"
fi
echo ""

echo "🚀 Attempting to start Next.js..."
echo "If this fails, the error message will appear below:"
echo ""

# Try to start Next.js with error output
npm run dev 2>&1 | head -20

echo ""
echo "📊 Diagnostic complete!"
