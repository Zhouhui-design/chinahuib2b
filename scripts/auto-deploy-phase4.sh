#!/bin/bash

# Auto-configure Cloudflare and monitoring services
# This script will help complete the Phase 4 deployment

set -e

echo "🚀 Starting Phase 4 Deployment..."
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found"
    exit 1
fi

echo "📋 Current Configuration Status:"
echo ""

# Check Cloudflare config
if grep -q "CLOUDFLARE_API_KEY=YOUR_API_KEY_HERE" .env.local; then
    echo "⏳ Cloudflare API Key: NEEDS UPDATE"
else
    echo "✅ Cloudflare API Key: Configured"
fi

if grep -q "CHINAHUIB_ZONE_ID=" .env.local; then
    echo "✅ Chinahuib2b Zone ID: Configured"
else
    echo "⏳ Chinahuib2b Zone ID: Missing"
fi

if grep -q "FIXTURER_ZONE_ID=" .env.local; then
    echo "✅ Fixturer Zone ID: Configured"
else
    echo "⏳ Fixturer Zone ID: Missing"
fi

# Check GA4 config
if grep -q "NEXT_PUBLIC_GA_ID=" .env.local && ! grep -q "NEXT_PUBLIC_GA_ID=$" .env.local; then
    echo "✅ Google Analytics: Configured"
else
    echo "⏳ Google Analytics: Missing"
fi

# Check Sentry config
if grep -q "NEXT_PUBLIC_SENTRY_DSN=" .env.local && ! grep -q "NEXT_PUBLIC_SENTRY_DSN=$" .env.local; then
    echo "✅ Sentry: Configured"
else
    echo "⏳ Sentry: Missing"
fi

echo ""
echo "=================================="
echo ""

# If all configured, proceed with deployment
if grep -q "CLOUDFLARE_API_KEY=YOUR_API_KEY_HERE" .env.local || \
   ! grep -q "CHINAHUIB_ZONE_ID=" .env.local || \
   ! grep -q "NEXT_PUBLIC_GA_ID=" .env.local || \
   ! grep -q "NEXT_PUBLIC_SENTRY_DSN=" .env.local; then
    
    echo "⚠️  Some configurations are missing."
    echo ""
    echo "Please provide the following information:"
    echo "1. Cloudflare registered email"
    echo "2. Zone IDs for both domains"
    echo "3. GA4 Measurement ID"
    echo "4. Sentry DSN and credentials"
    echo ""
    echo "Or skip this step and continue with AI integration."
    echo ""
    
    read -p "Do you want to skip Cloudflare setup and continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please update .env.local with the required information."
        exit 0
    fi
fi

echo "📦 Installing dependencies..."
npm install @sentry/nextjs
npm install --save-dev @lhci/cli

echo ""
echo "🔧 Initializing Sentry..."
npx @sentry/wizard@latest -i nextjs --skip-connect || true

echo ""
echo "🏗️  Building project..."
npm run build

echo ""
echo "🔄 Restarting services..."
pm2 restart all || true

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Visit https://chinahuib2b.top to verify"
echo "2. Check GA4 Realtime: https://analytics.google.com/"
echo "3. Check Sentry: https://sentry.io/"
echo ""
