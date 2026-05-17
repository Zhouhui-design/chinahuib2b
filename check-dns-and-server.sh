#!/bin/bash

# DNS and Server Health Check Script for chinahuib2b.top
# Usage: ./check-dns-and-server.sh

set -e

echo "========================================="
echo "🔍 chinahuib2b.top 诊断工具"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Current server IP
CURRENT_IP=$(curl -s https://api.ipify.org)
echo "📍 当前服务器 IP: $CURRENT_IP"
echo ""

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "========================================="
echo "1️⃣  DNS 解析检查"
echo "========================================="

# Check DNS resolution
DNS_RESULT=$(dig chinahuib2b.top +short 2>/dev/null || echo "FAILED")

if [ "$DNS_RESULT" == "FAILED" ] || [ -z "$DNS_RESULT" ]; then
    print_status 1 "DNS 解析失败"
    print_warning "需要更新 DigitalOcean DNS 记录"
    echo ""
    echo "📋 操作步骤:"
    echo "   1. 访问: https://cloud.digitalocean.com/networking/domains"
    echo "   2. 找到 chinahuib2b.top"
    echo "   3. 更新 A 记录 (@ 和 www) 到: $CURRENT_IP"
    echo "   4. 等待 5-30 分钟让 DNS 传播"
else
    print_status 0 "DNS 解析成功: $DNS_RESULT"
    
    if [ "$DNS_RESULT" != "$CURRENT_IP" ]; then
        print_warning "DNS 指向错误的 IP: $DNS_RESULT"
        print_warning "应该指向: $CURRENT_IP"
        echo ""
        echo "📋 需要更新 DNS 记录到正确的 IP"
    fi
fi

echo ""
echo "========================================="
echo "2️⃣  Nginx 状态检查"
echo "========================================="

# Check if Nginx is installed
if command -v nginx &> /dev/null; then
    print_status 0 "Nginx 已安装"
    
    # Check if Nginx is running
    if sudo systemctl is-active --quiet nginx 2>/dev/null; then
        print_status 0 "Nginx 正在运行"
        
        # Check Nginx config
        if sudo nginx -t 2>&1 | grep -q "successful"; then
            print_status 0 "Nginx 配置正确"
        else
            print_status 1 "Nginx 配置有错误"
            sudo nginx -t 2>&1 | tail -5
        fi
    else
        print_status 1 "Nginx 未运行"
        echo "   启动命令: sudo systemctl start nginx"
    fi
else
    print_status 1 "Nginx 未安装"
    echo "   安装命令: sudo apt install nginx -y"
fi

echo ""
echo "========================================="
echo "3️⃣  应用状态检查 (PM2)"
echo "========================================="

# Check if PM2 is installed
if command -v pm2 &> /dev/null; then
    print_status 0 "PM2 已安装"
    
    # Check if app is running
    PM2_STATUS=$(pm2 list 2>/dev/null | grep chinahuib2b || echo "")
    
    if [ -n "$PM2_STATUS" ] && echo "$PM2_STATUS" | grep -q "online"; then
        print_status 0 "chinahuib2b 应用正在运行"
        pm2 list | grep chinahuib2b
    else
        print_status 1 "chinahuib2b 应用未运行"
        echo ""
        echo "📋 启动应用:"
        echo "   cd /home/sardenesy/projects/chinahuib2b"
        echo "   npm run build"
        echo "   pm2 start npm --name 'chinahuib2b' -- start"
        echo "   pm2 save"
    fi
else
    print_status 1 "PM2 未安装"
    echo "   安装命令: npm install -g pm2"
fi

echo ""
echo "========================================="
echo "4️⃣  端口检查"
echo "========================================="

# Check port 80 (HTTP)
if sudo lsof -i :80 &> /dev/null; then
    print_status 0 "端口 80 (HTTP) 已被占用"
    sudo lsof -i :80 | head -3
else
    print_status 1 "端口 80 (HTTP) 未被占用"
fi

# Check port 443 (HTTPS)
if sudo lsof -i :443 &> /dev/null; then
    print_status 0 "端口 443 (HTTPS) 已被占用"
    sudo lsof -i :443 | head -3
else
    print_status 1 "端口 443 (HTTPS) 未被占用"
fi

# Check port 3000 (Next.js)
if sudo lsof -i :3000 &> /dev/null; then
    print_status 0 "端口 3000 (Next.js) 已被占用"
    sudo lsof -i :3000 | head -3
else
    print_status 1 "端口 3000 (Next.js) 未被占用"
fi

echo ""
echo "========================================="
echo "5️⃣  SSL 证书检查"
echo "========================================="

# Check if SSL certificate exists
if [ -f "/etc/letsencrypt/live/chinahuib2b.top/fullchain.pem" ]; then
    print_status 0 "SSL 证书存在"
    
    # Check expiry
    if command -v openssl &> /dev/null; then
        EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/chinahuib2b.top/fullchain.pem 2>/dev/null | cut -d= -f2)
        if [ -n "$EXPIRY" ]; then
            echo "   过期时间: $EXPIRY"
        fi
    fi
else
    print_status 1 "SSL 证书不存在"
    echo "   安装命令: sudo certbot --nginx -d chinahuib2b.top -d www.chinahuib2b.top"
fi

echo ""
echo "========================================="
echo "6️⃣  防火墙状态"
echo "========================================="

# Check UFW status
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status 2>/dev/null | head -1)
    echo "   UFW 状态: $UFW_STATUS"
    
    # Check if HTTP/HTTPS allowed
    if sudo ufw status 2>/dev/null | grep -q "Nginx Full"; then
        print_status 0 "Nginx Full (80, 443) 已允许"
    else
        print_warning "Nginx Full 未在防火墙中允许"
        echo "   添加规则: sudo ufw allow 'Nginx Full'"
    fi
else
    print_warning "UFW 未安装"
fi

echo ""
echo "========================================="
echo "7️⃣  网络连接测试"
echo "========================================="

# Test local connectivity
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    print_status 0 "本地应用可访问 (localhost:3000)"
else
    print_status 1 "本地应用不可访问"
fi

# Test from external (if DNS is working)
if [ "$DNS_RESULT" == "$CURRENT_IP" ]; then
    if curl -sI https://chinahuib2b.top > /dev/null 2>&1; then
        print_status 0 "外部可访问 (https://chinahuib2b.top)"
    else
        print_status 1 "外部不可访问"
    fi
else
    print_warning "DNS 未正确配置，跳过外部访问测试"
fi

echo ""
echo "========================================="
echo "📊 总结和建议"
echo "========================================="
echo ""

# Generate recommendations
ISSUES=0

if [ "$DNS_RESULT" == "FAILED" ] || [ -z "$DNS_RESULT" ]; then
    echo "${RED}🔴 紧急: 需要更新 DNS 记录${NC}"
    echo "   访问: https://cloud.digitalocean.com/networking/domains"
    echo "   将 A 记录 (@ 和 www) 更新为: $CURRENT_IP"
    ISSUES=$((ISSUES + 1))
elif [ "$DNS_RESULT" != "$CURRENT_IP" ]; then
    echo "${RED}🔴 紧急: DNS 指向错误的 IP${NC}"
    echo "   当前: $DNS_RESULT"
    echo "   应该: $CURRENT_IP"
    ISSUES=$((ISSUES + 1))
fi

if ! command -v nginx &> /dev/null || ! sudo systemctl is-active --quiet nginx 2>/dev/null; then
    echo "${RED}🔴 紧急: 需要安装并启动 Nginx${NC}"
    echo "   sudo apt install nginx -y"
    echo "   sudo systemctl start nginx"
    ISSUES=$((ISSUES + 1))
fi

if ! pm2 list 2>/dev/null | grep -q "chinahuib2b.*online"; then
    echo "${RED}🔴 紧急: 需要启动应用${NC}"
    echo "   cd /home/sardenesy/projects/chinahuib2b"
    echo "   npm run build"
    echo "   pm2 start npm --name 'chinahuib2b' -- start"
    ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -eq 0 ]; then
    echo "${GREEN}✅ 所有检查通过！网站应该可以正常访问。${NC}"
    echo ""
    echo "🌐 访问: https://chinahuib2b.top"
else
    echo ""
    echo "${YELLOW}⚠️  发现 $ISSUES 个需要解决的问题${NC}"
    echo ""
    echo "📖 详细指南: 查看 DNS_FIX_GUIDE.md"
fi

echo ""
echo "========================================="
echo "诊断完成！"
echo "========================================="
