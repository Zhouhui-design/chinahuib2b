#!/bin/bash

echo "🚀 Deploying SEO optimization features to production server..."

SERVER="root@139.59.108.156"
REMOTE_PATH="/var/www/chinahuib2b"

# 1. Upload Prisma schema
echo "📤 Uploading Prisma schema..."
scp prisma/schema.prisma ${SERVER}:${REMOTE_PATH}/prisma/schema.prisma

# 2. Upload SEO API
echo "📤 Uploading SEO API..."
ssh ${SERVER} "mkdir -p ${REMOTE_PATH}/src/app/api/admin/seo"
scp src/app/api/admin/seo/route.ts ${SERVER}:${REMOTE_PATH}/src/app/api/admin/seo/route.ts

# 3. Restart services
echo "🔄 Restarting services..."
ssh ${SERVER} "cd ${REMOTE_PATH} && pm2 restart chinahuib2b && sleep 15"

echo "✅ Deployment complete!"
echo "🌐 Testing: https://chinahuib2b.top"
