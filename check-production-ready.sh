#!/bin/bash

echo "🔍 Fixr Production Environment Check"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_env_var() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}❌ $1 is not set${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $1 is set${NC}"
        return 0
    fi
}

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 is available${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 is not installed${NC}"
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 does not exist${NC}"
        return 1
    fi
}

echo ""
echo "📋 Checking Required Commands..."
echo "=================================="

check_command "node"
check_command "npm"
check_command "git"
check_command "vercel"

echo ""
echo "📋 Checking Required Files..."
echo "=================================="

check_file "package.json"
check_file "next.config.js"
check_file "vercel.json"
check_file "prisma/schema.prisma"
check_file ".env.example"

echo ""
echo "📋 Checking Environment Variables..."
echo "=================================="

# Check .env.local file
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local found (should not be committed to git)${NC}"
    
    # Source the file (carefully)
    set -a
    source .env.local
    set +a
    
    check_env_var "DATABASE_URL"
    check_env_var "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    check_env_var "CLERK_SECRET_KEY"
    check_env_var "GITHUB_CLIENT_ID"
    check_env_var "GITHUB_CLIENT_SECRET"
    check_env_var "NEXT_PUBLIC_GITHUB_CALLBACK_URL"
else
    echo -e "${YELLOW}⚠️  .env.local not found (create from .env.example)${NC}"
fi

echo ""
echo "📋 Checking Node Modules..."
echo "=================================="

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules exists${NC}"
else
    echo -e "${RED}❌ node_modules not found${NC}"
    echo "   Run: npm install"
fi

echo ""
echo "📋 Checking TypeScript Compilation..."
echo "=================================="

if npm run type-check &> /dev/null; then
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
else
    echo -e "${RED}❌ TypeScript compilation failed${NC}"
    echo "   Run: npm run type-check to see errors"
fi

echo ""
echo "📋 Checking Linting..."
echo "=================================="

if npm run lint &> /dev/null; then
    echo -e "${GREEN}✅ Linting passed${NC}"
else
    echo -e "${RED}❌ Linting failed${NC}"
    echo "   Run: npm run lint to see errors"
fi

echo ""
echo "📋 Checking Build Process..."
echo "=================================="

if npm run build &> /dev/null; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "   Run: npm run build to see errors"
fi

echo ""
echo "📋 Checking Prisma Setup..."
echo "=================================="

if command -v prisma &> /dev/null; then
    echo -e "${GREEN}✅ Prisma CLI available${NC}"
    
    if [ -d "node_modules/.prisma" ]; then
        echo -e "${GREEN}✅ Prisma client generated${NC}"
    else
        echo -e "${RED}❌ Prisma client not generated${NC}"
        echo "   Run: npm run db:prisma:generate"
    fi
else
    echo -e "${RED}❌ Prisma CLI not available${NC}"
    echo "   Run: npm install prisma"
fi

echo ""
echo "📋 Checking Git Status..."
echo "=================================="

if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
    echo "   Commit or stash changes before deploying"
else
    echo -e "${GREEN}✅ Working directory clean${NC}"
fi

echo ""
echo "📋 Checking for Hardcoded URLs..."
echo "=================================="

if grep -r "localhost:3000" app/ --exclude-dir=node_modules &> /dev/null; then
    echo -e "${RED}❌ Hardcoded localhost URLs found${NC}"
    echo "   Replace with environment variables"
else
    echo -e "${GREEN}✅ No hardcoded localhost URLs found${NC}"
fi

echo ""
echo "📋 Summary"
echo "=================================="

echo "🚀 Ready for deployment if all checks pass!"
echo ""
echo "Next steps:"
echo "1. Fix any failed checks above"
echo "2. Run: vercel --prod"
echo "3. Configure environment variables in Vercel dashboard"
echo "4. Update GitHub OAuth and webhook URLs"
echo "5. Test all functionality"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
