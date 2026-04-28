#!/bin/bash

# 手动部署脚本 - Seller Dashboard 增强功能
# 由于 Git 推送遇到网络问题，使用此脚本手动部署

echo "================================"
echo "Seller Dashboard 增强功能部署"
echo "================================"
echo ""

# 检查本地代码
echo "1. 检查本地提交..."
cd /home/sardenesy/projects/chinahuib2b
git log --oneline -3

echo ""
echo "2. 尝试推送到 GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ 推送成功！"
else
    echo "❌ 推送失败，将直接部署到服务器"
fi

echo ""
echo "3. 部署到生产服务器..."
ssh root@139.59.108.156 << 'EOF'
cd /var/www/chinahuib2b

# 拉取最新代码
echo "正在拉取最新代码..."
git pull origin main

if [ $? -eq 0 ]; then
    echo "✅ 代码拉取成功"
else
    echo "⚠️  代码拉取失败，使用现有代码"
fi

# 重启服务
echo "正在重启服务..."
pm2 restart chinahuib2b

# 等待服务启动
sleep 5

# 检查服务状态
echo ""
echo "服务状态："
pm2 status chinahuib2b

# 测试关键路由
echo ""
echo "测试关键路由..."
curl -I http://localhost:3000/seller 2>&1 | grep HTTP
curl -I http://localhost:3000/seller/guide 2>&1 | grep HTTP

echo ""
echo "================================"
echo "部署完成！"
echo "================================"
echo ""
echo "请访问以下 URL 测试新功能："
echo "1. Seller Dashboard: https://chinahuib2b.top/seller"
echo "2. 操作说明书: https://chinahuib2b.top/seller/guide"
echo "3. 语言切换器：在 Seller Dashboard 顶部"
echo "4. 初学者指引：首次访问自动显示（左下角浮动按钮）"
EOF

echo ""
echo "部署脚本执行完毕！"
