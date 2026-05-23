#!/bin/bash

echo "🚀 Deploying TDK Admin Panel to production server..."

SERVER="root@139.59.108.156"
REMOTE_PATH="/var/www/chinahuib2b"

# 1. Create directories
echo "📁 Creating directories..."
ssh ${SERVER} "mkdir -p ${REMOTE_PATH}/src/app/\(dashboard\)/admin/seo"
ssh ${SERVER} "mkdir -p ${REMOTE_PATH}/src/app/api/admin/seo-configs"

# 2. Upload files
echo "📤 Uploading TDK admin panel..."
scp "src/app/(dashboard)/admin/seo/page.tsx" ${SERVER}:${REMOTE_PATH}/src/app/\(dashboard\)/admin/seo/page.tsx
scp src/app/api/admin/seo-configs/route.ts ${SERVER}:${REMOTE_PATH}/src/app/api/admin/seo-configs/route.ts

# 3. Restart services
echo "🔄 Restarting services..."
ssh ${SERVER} "cd ${REMOTE_PATH} && pm2 restart chinahuib2b && sleep 15"

echo "✅ Deployment complete!"
echo "🌐 TDK Admin Panel: https://chinahuib2b.top/admin/seo"
echo "🔐 Requires ADMIN role to access"
