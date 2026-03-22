#!/bin/bash

# Script to find common issues in the codebase
# Run this before production deployment

echo "🔍 Finding common code issues in Fixr..."
echo "========================================="

echo ""
echo "📋 1. Finding console.log statements (should use logger instead):"
echo "-------------------------------------------------------------------"
grep -rn "console.log" --include="*.ts" --include="*.tsx" app/ lib/ components/ 2>/dev/null | head -20 || echo "✅ No console.log found in source files"

echo ""
echo "📋 2. Finding <img> tags (should use next/image <Image>):"
echo "-------------------------------------------------------------------"
grep -rn "<img " --include="*.tsx" app/ components/ 2>/dev/null | head -10 || echo "✅ No <img> tags found"

echo ""
echo "📋 3. Finding 'any' type annotations (should use specific types):"
echo "-------------------------------------------------------------------"
grep -rn ": any" --include="*.ts" --include="*.tsx" app/ lib/ components/ 2>/dev/null | head -20 || echo "✅ No 'any' types found"

echo ""
echo "📋 4. Finding TODO/FIXME/HACK comments:"
echo "-------------------------------------------------------------------"
grep -rn "TODO\|FIXME\|HACK" --include="*.ts" --include="*.tsx" app/ lib/ components/ 2>/dev/null | head -20 || echo "✅ No TODO/FIXME comments found"

echo ""
echo "📋 5. Finding unused imports (requires eslint):"
echo "-------------------------------------------------------------------"
if command -v npx &> /dev/null; then
  npx eslint --ext .ts,.tsx app/ lib/ components/ --rule 'unused-imports/no-unused-imports: error' 2>/dev/null | head -20 || echo "ℹ️  Run 'npm run lint' for detailed unused import analysis"
else
  echo "ℹ️  ESLint not available - run 'npm run lint' to check for unused imports"
fi

echo ""
echo "📋 6. Finding missing 'key' props in lists:"
echo "-------------------------------------------------------------------"
grep -rn "\.map(" --include="*.tsx" app/ components/ 2>/dev/null | while read -r line; do
  if [[ ! "$line" == *"key="* ]]; then
    echo "$line"
  fi
done | head -10 || echo "✅ All .map() calls appear to have key props"

echo ""
echo "📋 7. Finding hardcoded localhost URLs:"
echo "-------------------------------------------------------------------"
grep -rn "localhost:3000" --include="*.ts" --include="*.tsx" app/ lib/ components/ 2>/dev/null | head -10 || echo "✅ No hardcoded localhost URLs found"

echo ""
echo "📋 8. Finding potential security issues:"
echo "-------------------------------------------------------------------"
# Check for eval
grep -rn "eval(" --include="*.ts" --include="*.tsx" app/ lib/ components/ 2>/dev/null && echo "⚠️  Found eval() usage - review for security" || echo "✅ No eval() found"

# Check for innerHTML
grep -rn "innerHTML\|dangerouslySetInnerHTML" --include="*.tsx" app/ components/ 2>/dev/null && echo "⚠️  Found innerHTML usage - ensure XSS protection" || echo "✅ No innerHTML usage found"

# Check for hardcoded secrets
grep -rn "password\|secret\|token\|key" --include="*.ts" --include="*.tsx" app/ lib/ components/ 2>/dev/null | grep -v "process.env" | head -10 || echo "✅ No obvious hardcoded secrets found"

echo ""
echo "📋 9. Finding missing error handling:"
echo "-------------------------------------------------------------------"
grep -rn "await " --include="*.ts" --include="*.tsx" app/ lib/ components/ 2>/dev/null | grep -v "try\|catch\|await.*\.catch" | head -15 || echo "ℹ️  Review these async calls for error handling"

echo ""
echo "📋 10. Finding large files (>500 lines):"
echo "-------------------------------------------------------------------"
find app/ lib/ components/ -name "*.tsx" -o -name "*.ts" 2>/dev/null | while read -r file; do
  lines=$(wc -l < "$file")
  if [ "$lines" -gt 500 ]; then
    echo "$file: $lines lines"
  fi
done | head -10 || echo "✅ No large files found"

echo ""
echo "========================================="
echo "✅ Issue scan complete!"
echo ""
echo "Next steps:"
echo "1. Fix any issues found above"
echo "2. Run: npm run lint -- --fix"
echo "3. Run: npm run type-check"
echo "4. Run: npm run test"
