#!/bin/bash

echo "🧪 Installing Testing Dependencies for Fixr"
echo "=============================================="

echo ""
echo "📦 Installing Playwright and browsers..."
npm install -D @playwright/test
npx playwright install

echo ""
echo "📦 Installing Jest and React Testing Library..."
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest

echo ""
echo "📦 Installing additional testing utilities..."
npm install -D node-mocks-http @types/jest jest-environment-jsdom

echo ""
echo "✅ Testing dependencies installed!"
echo ""
echo "🎯 Available test commands:"
echo "  npm run test          - Run unit tests"
echo "  npm run test:watch    - Run unit tests in watch mode"
echo "  npm run test:coverage - Run tests with coverage"
echo "  npm run test:e2e      - Run E2E tests"
echo "  npm run test:e2e:ui   - Run E2E tests with UI"
echo "  npm run test:all      - Run all tests"
echo ""
echo "🚀 Load testing (requires k6):"
echo "  npm run load-test     - Run API load test"
echo "  npm run load-test:db  - Run DB load test"
echo ""
echo "🔍 Code quality:"
echo "  npm run find-issues   - Find common code issues"
echo ""
echo "📖 Next steps:"
echo "1. Review LAUNCH_CHECKLIST.md"
echo "2. Run: npm run test"
echo "3. Run: npm run test:e2e"
echo "4. Check: npm run find-issues"
