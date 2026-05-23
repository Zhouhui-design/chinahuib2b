#!/bin/bash

# 部署脚本 - 使用开发模式（因为 Next.js 15.5.x 有构建 bug）

echo "=========================================="
echo "开始部署 chinahuib2b (开发模式)"
echo "=========================================="

# 进入项目目录
cd /var/www/chinahuib2b || exit 1

# 拉取最新代码
echo "1. 拉取最新代码..."
git pull origin main || { echo "Git pull 失败"; exit 1; }

# 安装依赖
echo "2. 安装依赖..."
npm install || { echo "npm install 失败"; exit 1; }

# 停止现有服务
echo "3. 停止现有服务..."
pm2 stop chinahuib2b-next 2>/dev/null || true
pm2 delete chinahuib2b-next 2>/dev/null || true

# 启动开发模式
echo "4. 启动开发模式..."
pm2 start "npm run dev -- -p 3000" --name "chinahuib2b-dev"

# 等待服务启动
echo "5. 等待服务启动..."
sleep 5

# 检查服务状态
echo "6. 检查服务状态..."
pm2 status

echo ""
echo "=========================================="
echo "部署完成！"
echo "访问地址: http://localhost:3000"
echo "注意: 当前使用开发模式，性能略低于生产构建"
echo "=========================================="
