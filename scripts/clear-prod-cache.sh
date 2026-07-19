#!/bin/bash

set -e

echo "=========================================="
echo "    CLEAR PRODUCTION REDIS CACHE"
echo "=========================================="
echo ""

PROJECT_DIR="/var/www/chinahuib2b"
SSH_KEY="$HOME/.ssh/id_rsa_prod"
SERVER_IP="167.99.134.217"
SERVER_USER="sardenesy"

echo "[1/3] Connecting to production server..."
echo "Server: $SERVER_USER@$SERVER_IP"
echo ""

echo "[2/3] Clearing category cache..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << 'EOF'
  echo "Connected to production server"
  
  # 检查Redis连接
  echo ""
  echo "Checking Redis connection..."
  redis-cli ping
  
  # 查看当前分类缓存键
  echo ""
  echo "Current category cache keys:"
  redis-cli keys "categories:*"
  
  # 清除分类缓存
  echo ""
  echo "Clearing category caches..."
  redis-cli DEL categories:tree
  redis-cli KEYS "categories:tree:*" | xargs redis-cli DEL 2>/dev/null || true
  redis-cli KEYS "category:*" | xargs redis-cli DEL 2>/dev/null || true
  
  # 验证清除结果
  echo ""
  echo "After clearing - category cache keys:"
  redis-cli keys "categories:*"
  
  echo ""
  echo "✅ Cache clearing completed!"
EOF

echo ""
echo "[3/3] Refreshing server-side cache..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << 'EOF'
  cd /var/www/chinahuib2b
  
  # 重启应用以确保新代码生效
  echo "Restarting application..."
  pm2 restart chinahuib2b-next
  
  echo ""
  echo "✅ Application restarted!"
EOF

echo ""
echo "=========================================="
echo "    CACHE CLEARING COMPLETED"
echo "=========================================="