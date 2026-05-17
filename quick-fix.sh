#!/bin/bash

# Quick Fix Script for chinahuib2b.top
# This script automates steps 2-6 (after DNS is updated)
# Usage: sudo ./quick-fix.sh

set -e

echo "========================================="
echo "🚀 chinahuib2b.top 快速修复脚本"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ 请使用 sudo 运行此脚本${NC}"
    echo "   sudo ./quick-fix.sh"
    exit 1
fi

echo -e "${BLUE}⚠️  重要提示:${NC}"
echo "   在运行此脚本之前，请确保已更新 DNS 记录！"
echo "   访问: https://cloud.digitalocean.com/networking/domains"
echo "   将 A 记录指向: $(curl -s https://api.ipify.org)"
echo ""
read -p "DNS 是否已更新？(y/n): " dns_updated

if [ "$dns_updated" != "y" ] && [ "$dns_updated" != "Y" ]; then
    echo -e "${YELLOW}⚠️  请先更新 DNS 记录，然后再运行此脚本${NC}"
    exit 1
fi

echo ""
echo "========================================="
echo "步骤 1/5: 安装 Nginx"
echo "========================================="

apt update -qq
apt install nginx -y -qq

systemctl start nginx
systemctl enable nginx

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx 安装并启动成功${NC}"
else
    echo -e "${RED}❌ Nginx 启动失败${NC}"
    exit 1
fi

echo ""
echo "========================================="
echo "步骤 2/5: 配置 Nginx"
echo "========================================="

# Copy nginx config from project
NGINX_CONFIG="/home/sardenesy/projects/chinahuib2b/nginx-chinahuib2b.conf"

if [ -f "$NGINX_CONFIG" ]; then
    cp "$NGINX_CONFIG" /etc/nginx/sites-available/chinahuib2b.top
    echo -e "${GREEN}✅ Nginx 配置文件已复制${NC}"
else
    echo -e "${YELLOW}⚠️  未找到项目配置文件，使用默认配置${NC}"
    
    cat > /etc/nginx/sites-available/chinahuib2b.top << 'EOF'
server {
    listen 80;
    server_name chinahuib2b.top www.chinahuib2b.top;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name chinahuib2b.top www.chinahuib2b.top;

    ssl_certificate     /etc/letsencrypt/live/chinahuib2b.top/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chinahuib2b.top/privkey.pem;
    
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    access_log /var/log/nginx/chinahuib2b-access.log;
    error_log  /var/log/nginx/chinahuib2b-error.log;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
fi

# Enable site
ln -sf /etc/nginx/sites-available/chinahuib2b.top /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload
if nginx -t 2>&1 | grep -q "successful"; then
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx 配置成功${NC}"
else
    echo -e "${RED}❌ Nginx 配置测试失败${NC}"
    nginx -t
    exit 1
fi

echo ""
echo "========================================="
echo "步骤 3/5: 安装 SSL 证书"
echo "========================================="

# Install certbot
apt install certbot python3-certbot-nginx -y -qq

# Get certificate
echo -e "${YELLOW}⚠️  即将获取 SSL 证书...${NC}"
echo "   请准备输入邮箱地址"
echo ""

read -p "输入邮箱地址 (用于证书通知): " email

certbot --nginx \
    -d chinahuib2b.top \
    -d www.chinahuib2b.top \
    --non-interactive \
    --agree-tos \
    -m "$email" \
    --redirect || {
        echo -e "${YELLOW}⚠️  Certbot 自动配置失败，尝试手动模式...${NC}"
        certbot --nginx -d chinahuib2b.top -d www.chinahuib2b.top
    }

if [ -f "/etc/letsencrypt/live/chinahuib2b.top/fullchain.pem" ]; then
    echo -e "${GREEN}✅ SSL 证书安装成功${NC}"
else
    echo -e "${RED}❌ SSL 证书安装失败${NC}"
    echo "   请手动运行: sudo certbot --nginx -d chinahuib2b.top -d www.chinahuib2b.top"
fi

echo ""
echo "========================================="
echo "步骤 4/5: 启动应用"
echo "========================================="

cd /home/sardenesy/projects/chinahuib2b

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  安装依赖...${NC}"
    npm ci --production
fi

# Build application
echo -e "${YELLOW}⚠️  构建应用（这可能需要几分钟）...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 应用构建成功${NC}"
else
    echo -e "${RED}❌ 应用构建失败${NC}"
    exit 1
fi

# Install PM2 if not exists
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  安装 PM2...${NC}"
    npm install -g pm2
fi

# Stop existing app if running
pm2 delete chinahuib2b 2>/dev/null || true

# Start app
pm2 start npm --name "chinahuib2b" -- start

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 应用启动成功${NC}"
    
    # Save and setup startup
    pm2 save
    pm2 startup systemd -u sardenesy --hp /home/sardenesy
    
    # Wait for app to be ready
    sleep 3
    
    # Check if app is responding
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 应用健康检查通过${NC}"
    else
        echo -e "${YELLOW}⚠️  应用可能还在启动中，请稍后检查${NC}"
    fi
else
    echo -e "${RED}❌ 应用启动失败${NC}"
    pm2 logs chinahuib2b --lines 20
    exit 1
fi

echo ""
echo "========================================="
echo "步骤 5/5: 配置防火墙"
echo "========================================="

# Install UFW if not exists
if ! command -v ufw &> /dev/null; then
    apt install ufw -y -qq
fi

# Configure firewall
ufw allow 'Nginx Full' > /dev/null 2>&1
ufw allow OpenSSH > /dev/null 2>&1
ufw --force enable > /dev/null 2>&1

if ufw status | grep -q "active"; then
    echo -e "${GREEN}✅ 防火墙配置成功${NC}"
    echo "   允许的端口: 80, 443, 22"
else
    echo -e "${YELLOW}⚠️  防火墙配置可能有问题，请手动检查${NC}"
fi

echo ""
echo "========================================="
echo "✅ 所有步骤完成！"
echo "========================================="
echo ""

# Final verification
echo "📊 最终检查:"
echo ""

# Check DNS
DNS_RESULT=$(dig chinahuib2b.top +short 2>/dev/null || echo "FAILED")
CURRENT_IP=$(curl -s https://api.ipify.org)

if [ "$DNS_RESULT" == "$CURRENT_IP" ]; then
    echo -e "${GREEN}✅ DNS 解析正确: $DNS_RESULT${NC}"
elif [ "$DNS_RESULT" == "FAILED" ] || [ -z "$DNS_RESULT" ]; then
    echo -e "${RED}❌ DNS 解析失败 - 请确认已在 DigitalOcean 更新 DNS 记录${NC}"
else
    echo -e "${YELLOW}⚠️  DNS 指向错误: $DNS_RESULT (应该是 $CURRENT_IP)${NC}"
fi

# Check services
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx 正在运行${NC}"
else
    echo -e "${RED}❌ Nginx 未运行${NC}"
fi

if pm2 list 2>/dev/null | grep -q "chinahuib2b.*online"; then
    echo -e "${GREEN}✅ 应用正在运行${NC}"
else
    echo -e "${RED}❌ 应用未运行${NC}"
fi

if [ -f "/etc/letsencrypt/live/chinahuib2b.top/fullchain.pem" ]; then
    echo -e "${GREEN}✅ SSL 证书已安装${NC}"
else
    echo -e "${RED}❌ SSL 证书未安装${NC}"
fi

echo ""
echo "========================================="
echo "🎉 部署完成！"
echo "========================================="
echo ""
echo "🌐 访问网站: https://chinahuib2b.top"
echo ""
echo "📋 有用命令:"
echo "   查看应用状态: pm2 list"
echo "   查看应用日志: pm2 logs chinahuib2b"
echo "   重启应用: pm2 restart chinahuib2b"
echo "   查看 Nginx 状态: sudo systemctl status nginx"
echo "   查看 Nginx 日志: sudo tail -f /var/log/nginx/chinahuib2b-error.log"
echo ""
echo "⚠️  如果网站仍无法访问:"
echo "   1. 等待 DNS 传播（最多 30 分钟）"
echo "   2. 清除浏览器缓存"
echo "   3. 检查防火墙设置"
echo "   4. 查看详细指南: QUICK_FIX.md"
echo ""
