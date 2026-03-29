#!/bin/bash

# Prisma Setup Script for Fixr
echo "🔧 Setting up Prisma for Fixr..."

# Install Prisma dependencies
echo "📦 Installing Prisma dependencies..."
npm install prisma @prisma/client

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

# Create initial migration (if schema exists)
if [ -f "prisma/schema.prisma" ]; then
    echo "🗄️ Creating initial migration..."
    npx prisma migrate dev --name init
else
    echo "❌ Prisma schema not found at prisma/schema.prisma"
    exit 1
fi

echo "✅ Prisma setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure your DATABASE_URL is set in .env.local"
echo "2. Run 'npx prisma migrate deploy' to apply migrations to production"
echo "3. The database client is now available at '@/lib/db'"
