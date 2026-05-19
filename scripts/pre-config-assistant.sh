#!/bin/bash

# 第四阶段优化 - 自动化预配置助手
# 用途: 帮助用户快速注册和获取必要的配置信息

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   第四阶段优化 - 自动化预配置助手          ║${NC}"
echo -e "${BLUE}║   Phase 4 Pre-configuration Assistant      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}本助手将帮助您:${NC}"
echo "  1. 打开浏览器访问注册页面"
echo "  2. 指导您获取必要的配置信息"
echo "  3. 验证配置是否正确"
echo ""

# 检查是否有图形界面
if command -v xdg-open &> /dev/null; then
    BROWSER_OPEN="xdg-open"
elif command -v open &> /dev/null; then
    BROWSER_OPEN="open"
else
    BROWSER_OPEN=""
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  步骤 1: Cloudflare 注册${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}请在浏览器中打开以下链接:${NC}"
echo -e "${CYAN}  https://dash.cloudflare.com/sign-up${NC}"
echo ""

if [ -n "$BROWSER_OPEN" ]; then
    read -p "$(echo -e ${GREEN}是否自动打开浏览器? [Y/n]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        $BROWSER_OPEN "https://dash.cloudflare.com/sign-up" 2>/dev/null || true
        echo -e "${GREEN}✅ 浏览器已打开${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}注册步骤:${NC}"
echo "  1. 使用邮箱注册（免费套餐）"
echo "  2. 添加域名: chinahuib2b.top"
echo "  3. 添加域名: fixr2026.com"
echo "  4. 按照提示修改 DNS 记录"
echo ""

read -p "$(echo -e ${GREEN}完成注册后按回车继续...${NC})" 

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  步骤 2: 获取 Cloudflare API Token${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}请访问:${NC}"
echo -e "${CYAN}  https://dash.cloudflare.com/profile/api-tokens${NC}"
echo ""

if [ -n "$BROWSER_OPEN" ]; then
    read -p "$(echo -e ${GREEN}是否自动打开? [Y/n]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        $BROWSER_OPEN "https://dash.cloudflare.com/profile/api-tokens" 2>/dev/null || true
    fi
fi

echo ""
echo -e "${YELLOW}获取步骤:${NC}"
echo "  1. 点击 'Create Token'"
echo "  2. 选择 'Edit zone DNS' 模板"
echo "  3. 在 Zone Resources 中选择您的域名"
echo "  4. 点击 'Continue to summary'"
echo "  5. 点击 'Create Token'"
echo "  6. 复制生成的 Token（只显示一次！）"
echo ""

read -p "请输入 Cloudflare API Token: " CF_API_TOKEN

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  步骤 3: 获取 Zone IDs${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}请访问 Chinahuib2b.top 的 Overview 页面:${NC}"
echo -e "${CYAN}  https://dash.cloudflare.com/${NC}"
echo ""

if [ -n "$BROWSER_OPEN" ]; then
    $BROWSER_OPEN "https://dash.cloudflare.com/" 2>/dev/null || true
fi

echo ""
read -p "请输入 chinahuib2b.top 的 Zone ID: " CHINAHUIB_ZONE_ID
read -p "请输入 fixr2026.com 的 Zone ID: " FIXTURER_ZONE_ID

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  步骤 4: Google Analytics 4 注册${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}请访问:${NC}"
echo -e "${CYAN}  https://analytics.google.com/${NC}"
echo ""

if [ -n "$BROWSER_OPEN" ]; then
    read -p "$(echo -e ${GREEN}是否自动打开? [Y/n]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        $BROWSER_OPEN "https://analytics.google.com/" 2>/dev/null || true
    fi
fi

echo ""
echo -e "${YELLOW}注册步骤:${NC}"
echo "  1. 使用 Google 账号登录"
echo "  2. 点击 '开始衡量'"
echo "  3. 创建账号: Chinahuib2b"
echo "  4. 创建媒体资源:"
echo "     - 名称: chinahuib2b.top"
echo "     - 报告时区: Asia/Shanghai"
echo "     - 货币: CNY"
echo "  5. 平台: Web"
echo "  6. 网站 URL: https://chinahuib2b.top"
echo "  7. 获取测量 ID (格式: G-XXXXXXXXXX)"
echo ""

read -p "$(echo -e ${GREEN}完成注册后按回车继续...${NC})" 
read -p "请输入 GA4 测量 ID: " GA_ID

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  步骤 5: Sentry 注册${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}请访问:${NC}"
echo -e "${CYAN}  https://sentry.io/signup/${NC}"
echo ""

if [ -n "$BROWSER_OPEN" ]; then
    read -p "$(echo -e ${GREEN}是否自动打开? [Y/n]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        $BROWSER_OPEN "https://sentry.io/signup/" 2>/dev/null || true
    fi
fi

echo ""
echo -e "${YELLOW}注册步骤:${NC}"
echo "  1. 使用邮箱或 GitHub 注册（免费套餐）"
echo "  2. 创建组织（Organization）"
echo "  3. 创建项目:"
echo "     - 平台: Next.js"
echo "     - 项目名称: chinahuib2b"
echo "  4. 获取 DSN（在项目设置中）"
echo "  5. 获取 Auth Token:"
echo "     - Settings → Developer Settings"
echo "     - Create New Token"
echo "     - 勾选 project:write 权限"
echo ""

read -p "$(echo -e ${GREEN}完成注册后按回车继续...${NC})" 
read -p "请输入 Sentry DSN: " SENTRY_DSN
read -p "请输入 Sentry Organization: " SENTRY_ORG
read -p "请输入 Sentry Project Name: " SENTRY_PROJECT
read -p "请输入 Sentry Auth Token: " SENTRY_AUTH_TOKEN

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  步骤 6: 保存配置${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 备份现有配置
if [ -f ".env.local" ]; then
    cp .env.local .env.local.backup.$(date +%Y%m%d%H%M%S)
    echo -e "${GREEN}✅ 已备份现有配置${NC}"
fi

# 写入配置
cat >> .env.local << EOF

# ============================================
# Phase 4 Optimization Configuration
# Generated on $(date)
# ============================================

# Cloudflare CDN
CLOUDFLARE_API_TOKEN=$CF_API_TOKEN
CHINAHUIB_ZONE_ID=$CHINAHUIB_ZONE_ID
FIXTURER_ZONE_ID=$FIXTURER_ZONE_ID

# Google Analytics 4
NEXT_PUBLIC_GA_ID=$GA_ID

# Sentry
NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN
SENTRY_DSN=$SENTRY_DSN
SENTRY_ORG=$SENTRY_ORG
SENTRY_PROJECT=$SENTRY_PROJECT
SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
EOF

echo -e "${GREEN}✅ 配置已保存到 .env.local${NC}"
echo ""

# 验证配置
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  步骤 7: 验证配置${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${CYAN}已保存的配置:${NC}"
echo "  Cloudflare API Token: ${CF_API_TOKEN:0:8}..."
echo "  Chinahuib2b Zone ID: $CHINAHUIB_ZONE_ID"
echo "  Fixturer Zone ID: $FIXTURER_ZONE_ID"
echo "  GA4 Measurement ID: $GA_ID"
echo "  Sentry DSN: ${SENTRY_DSN:0:30}..."
echo "  Sentry Org: $SENTRY_ORG"
echo "  Sentry Project: $SENTRY_PROJECT"
echo ""

read -p "$(echo -e ${GREEN}配置是否正确? [Y/n]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ -n $REPLY ]]; then
    echo -e "${YELLOW}⚠️  请检查 .env.local 文件并手动修正${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ 预配置完成！                          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}下一步操作:${NC}"
echo "  1. 安装依赖:"
echo "     npm install @sentry/nextjs"
echo "     npm install --save-dev @lhci/cli"
echo ""
echo "  2. 初始化 Sentry:"
echo "     npx @sentry/wizard@latest -i nextjs"
echo ""
echo "  3. 构建项目:"
echo "     npm run build"
echo ""
echo "  4. 重启服务:"
echo "     pm2 restart all"
echo ""
echo "  5. 验证部署:"
echo "     - GA4: https://analytics.google.com/"
echo "     - Sentry: https://sentry.io/"
echo ""

echo -e "${YELLOW}或者运行完整部署脚本:${NC}"
echo "  ./scripts/setup-monitoring.sh"
echo ""
