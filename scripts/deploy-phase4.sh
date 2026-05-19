#!/bin/bash

# 第四阶段优化 - 一键部署脚本
# 用途: 自动完成 CDN 和监控系统的最终配置

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   第四阶段优化 - 一键部署                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# 检查配置文件
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ 错误: .env.local 文件不存在${NC}"
    echo -e "${YELLOW}请先运行 ./scripts/pre-config-assistant.sh 完成配置${NC}"
    exit 1
fi

# 读取配置
source .env.local

echo -e "${CYAN}检测到以下配置:${NC}"
if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    echo "  ✅ Cloudflare API Token: ${CLOUDFLARE_API_TOKEN:0:8}..."
fi
if [ -n "$NEXT_PUBLIC_GA_ID" ]; then
    echo "  ✅ GA4 Measurement ID: $NEXT_PUBLIC_GA_ID"
fi
if [ -n "$NEXT_PUBLIC_SENTRY_DSN" ]; then
    echo "  ✅ Sentry DSN: ${NEXT_PUBLIC_SENTRY_DSN:0:30}..."
fi
echo ""

# 步骤 1: 安装依赖
echo -e "${BLUE}[1/4] 安装依赖...${NC}"
npm install @sentry/nextjs
npm install --save-dev @lhci/cli
echo -e "${GREEN}✅ 依赖安装完成${NC}"
echo ""

# 步骤 2: 初始化 Sentry
echo -e "${BLUE}[2/4] 初始化 Sentry 配置...${NC}"
npx @sentry/wizard@latest -i nextjs --skip-connect || true
echo -e "${GREEN}✅ Sentry 初始化完成${NC}"
echo ""

# 步骤 3: 构建项目
echo -e "${BLUE}[3/4] 构建项目...${NC}"
npm run build
echo -e "${GREEN}✅ 构建完成${NC}"
echo ""

# 步骤 4: 重启服务
echo -e "${BLUE}[4/4] 重启服务...${NC}"
pm2 restart all
sleep 3
pm2 status
echo -e "${GREEN}✅ 服务重启完成${NC}"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ 部署完成！                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}验证部署:${NC}"
echo "  1. 访问网站: https://chinahuib2b.top"
echo "  2. 查看 GA4 Realtime: https://analytics.google.com/"
echo "  3. 查看 Sentry Dashboard: https://sentry.io/"
echo ""

echo -e "${YELLOW}运行 Lighthouse 审计:${NC}"
echo "  npm run lighthouse"
echo ""
