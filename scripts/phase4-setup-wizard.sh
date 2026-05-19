#!/bin/bash

# 第四阶段优化 - 交互式配置向导
# 用途: 引导用户完成 CDN 和监控系统的注册与配置

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   第四阶段优化 - 配置向导                  ║${NC}"
echo -e "${BLUE}║   Phase 4 Optimization Setup Wizard        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# 检查是否在正确的项目目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误: 请在 chinahuib2b 项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${CYAN}本向导将帮助您完成以下配置:${NC}"
echo "  1. Cloudflare CDN 全球加速"
echo "  2. Google Analytics 4 (GA4)"
echo "  3. Sentry 错误追踪和性能监控"
echo ""
echo -e "${YELLOW}⏱️  预计耗时: 15-20 分钟${NC}"
echo ""

read -p "$(echo -e ${GREEN}是否开始配置? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}已取消配置${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  步骤 1: Cloudflare CDN 配置${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${CYAN}Cloudflare 提供:${NC}"
echo "  ✅ 全球 CDN 加速（速度提升 50-70%）"
echo "  ✅ DDoS 防护"
echo "  ✅ SSL/TLS 自动管理"
echo "  ✅ 带宽成本降低 80%"
echo ""

echo -e "${YELLOW}请选择操作:${NC}"
echo "  1) 我已有 Cloudflare 账户"
echo "  2) 我需要注册新账户"
echo "  3) 跳过 Cloudflare 配置"
echo ""

read -p "请输入选项 (1/2/3): " cf_choice

case $cf_choice in
    1)
        echo ""
        echo -e "${GREEN}请提供以下信息:${NC}"
        read -p "Cloudflare API Token: " CF_API_TOKEN
        read -p "chinahuib2b.top Zone ID: " CHINAHUIB_ZONE_ID
        read -p "fixr2026.com Zone ID: " FIXTURER_ZONE_ID
        
        # 保存到环境变量文件
        echo "" >> .env.local
        echo "# Cloudflare Configuration" >> .env.local
        echo "CLOUDFLARE_API_TOKEN=$CF_API_TOKEN" >> .env.local
        echo "CHINAHUIB_ZONE_ID=$CHINAHUIB_ZONE_ID" >> .env.local
        echo "FIXTURER_ZONE_ID=$FIXTURER_ZONE_ID" >> .env.local
        
        echo -e "${GREEN}✅ Cloudflare 配置已保存${NC}"
        ;;
    2)
        echo ""
        echo -e "${CYAN}请访问以下链接注册 Cloudflare:${NC}"
        echo "  https://dash.cloudflare.com/sign-up"
        echo ""
        echo -e "${YELLOW}注册步骤:${NC}"
        echo "  1. 使用邮箱注册（免费套餐即可）"
        echo "  2. 添加域名: chinahuib2b.top"
        echo "  3. 添加域名: fixr2026.com"
        echo "  4. 按照提示修改 DNS 记录"
        echo "  5. 获取 API Token 和 Zone IDs"
        echo ""
        echo -e "${YELLOW}获取 API Token:${NC}"
        echo "  1. 登录后点击右上角头像 → My Profile"
        echo "  2. 左侧菜单选择 API Tokens"
        echo "  3. 点击 Create Token"
        echo "  4. 使用 Edit zone DNS 模板"
        echo "  5. 复制生成的 Token"
        echo ""
        echo -e "${YELLOW}获取 Zone ID:${NC}"
        echo "  1. 在 Dashboard 中选择域名"
        echo "  2. 右侧 Overview 页面底部可见 Zone ID"
        echo ""
        
        read -p "$(echo -e ${GREEN}完成注册后按回车继续...${NC})" 
        
        echo ""
        read -p "Cloudflare API Token: " CF_API_TOKEN
        read -p "chinahuib2b.top Zone ID: " CHINAHUIB_ZONE_ID
        read -p "fixr2026.com Zone ID: " FIXTURER_ZONE_ID
        
        echo "" >> .env.local
        echo "# Cloudflare Configuration" >> .env.local
        echo "CLOUDFLARE_API_TOKEN=$CF_API_TOKEN" >> .env.local
        echo "CHINAHUIB_ZONE_ID=$CHINAHUIB_ZONE_ID" >> .env.local
        echo "FIXTURER_ZONE_ID=$FIXTURER_ZONE_ID" >> .env.local
        
        echo -e "${GREEN}✅ Cloudflare 配置已保存${NC}"
        ;;
    3)
        echo -e "${YELLOW}⏭️  跳过 Cloudflare 配置${NC}"
        ;;
esac

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  步骤 2: Google Analytics 4 配置${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${CYAN}GA4 提供:${NC}"
echo "  ✅ PV/UV 统计"
echo "  ✅ 用户行为分析"
echo "  ✅ 转化追踪"
echo "  ✅ 流量来源分析"
echo ""

echo -e "${YELLOW}请选择操作:${NC}"
echo "  1) 我已有 GA4 账户"
echo "  2) 我需要注册新账户"
echo "  3) 跳过 GA4 配置"
echo ""

read -p "请输入选项 (1/2/3): " ga_choice

case $ga_choice in
    1)
        echo ""
        read -p "GA4 测量 ID (格式: G-XXXXXXXXXX): " GA_ID
        
        echo "" >> .env.local
        echo "# Google Analytics 4" >> .env.local
        echo "NEXT_PUBLIC_GA_ID=$GA_ID" >> .env.local
        
        echo -e "${GREEN}✅ GA4 配置已保存${NC}"
        ;;
    2)
        echo ""
        echo -e "${CYAN}请访问以下链接注册 GA4:${NC}"
        echo "  https://analytics.google.com/"
        echo ""
        echo -e "${YELLOW}注册步骤:${NC}"
        echo "  1. 使用 Google 账号登录"
        echo "  2. 点击 '开始衡量'"
        echo "  3. 创建账号: Chinahuib2b"
        echo "  4. 创建媒体资源:"
        echo "     - 名称: chinahuib2b.top"
        echo "     - 报告时区: Asia/Shanghai"
        echo "     - 货币: CNY"
        echo "  5. 获取测量 ID (G-XXXXXXXXXX)"
        echo ""
        
        read -p "$(echo -e ${GREEN}完成注册后按回车继续...${NC})" 
        
        echo ""
        read -p "GA4 测量 ID (格式: G-XXXXXXXXXX): " GA_ID
        
        echo "" >> .env.local
        echo "# Google Analytics 4" >> .env.local
        echo "NEXT_PUBLIC_GA_ID=$GA_ID" >> .env.local
        
        echo -e "${GREEN}✅ GA4 配置已保存${NC}"
        ;;
    3)
        echo -e "${YELLOW}⏭️  跳过 GA4 配置${NC}"
        ;;
esac

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  步骤 3: Sentry 配置${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${CYAN}Sentry 提供:${NC}"
echo "  ✅ 错误追踪和告警"
echo "  ✅ 性能监控（Web Vitals）"
echo "  ✅ 会话回放"
echo "  ✅ 发布追踪"
echo ""

echo -e "${YELLOW}请选择操作:${NC}"
echo "  1) 我已有 Sentry 账户"
echo "  2) 我需要注册新账户"
echo "  3) 跳过 Sentry 配置"
echo ""

read -p "请输入选项 (1/2/3): " sentry_choice

case $sentry_choice in
    1)
        echo ""
        read -p "Sentry DSN: " SENTRY_DSN
        read -p "Sentry Organization: " SENTRY_ORG
        read -p "Sentry Project Name: " SENTRY_PROJECT
        read -p "Sentry Auth Token: " SENTRY_AUTH_TOKEN
        
        echo "" >> .env.local
        echo "# Sentry Configuration" >> .env.local
        echo "NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN" >> .env.local
        echo "SENTRY_DSN=$SENTRY_DSN" >> .env.local
        echo "SENTRY_ORG=$SENTRY_ORG" >> .env.local
        echo "SENTRY_PROJECT=$SENTRY_PROJECT" >> .env.local
        echo "SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN" >> .env.local
        
        echo -e "${GREEN}✅ Sentry 配置已保存${NC}"
        ;;
    2)
        echo ""
        echo -e "${CYAN}请访问以下链接注册 Sentry:${NC}"
        echo "  https://sentry.io/signup/"
        echo ""
        echo -e "${YELLOW}注册步骤:${NC}"
        echo "  1. 使用邮箱或 GitHub 注册（免费套餐）"
        echo "  2. 创建新项目:"
        echo "     - 平台: Next.js"
        echo "     - 项目名称: chinahuib2b"
        echo "  3. 获取 DSN (https://xxx@oxxx.ingest.sentry.io/xxx)"
        echo "  4. 获取 Organization 名称"
        echo "  5. 获取 Auth Token:"
        echo "     - Settings → Developer Settings"
        echo "     - Create New Token"
        echo "     - 勾选 project:write 权限"
        echo ""
        
        read -p "$(echo -e ${GREEN}完成注册后按回车继续...${NC})" 
        
        echo ""
        read -p "Sentry DSN: " SENTRY_DSN
        read -p "Sentry Organization: " SENTRY_ORG
        read -p "Sentry Project Name: " SENTRY_PROJECT
        read -p "Sentry Auth Token: " SENTRY_AUTH_TOKEN
        
        echo "" >> .env.local
        echo "# Sentry Configuration" >> .env.local
        echo "NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN" >> .env.local
        echo "SENTRY_DSN=$SENTRY_DSN" >> .env.local
        echo "SENTRY_ORG=$SENTRY_ORG" >> .env.local
        echo "SENTRY_PROJECT=$SENTRY_PROJECT" >> .env.local
        echo "SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN" >> .env.local
        
        echo -e "${GREEN}✅ Sentry 配置已保存${NC}"
        ;;
    3)
        echo -e "${YELLOW}⏭️  跳过 Sentry 配置${NC}"
        ;;
esac

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  步骤 4: 安装依赖${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

read -p "$(echo -e ${GREEN}是否现在安装依赖? [Y/n]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    echo -e "${YELLOW}📦 正在安装依赖...${NC}"
    
    # 安装 Sentry
    npm install @sentry/nextjs
    
    # 安装 Lighthouse CI
    npm install --save-dev @lhci/cli
    
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
else
    echo -e "${YELLOW}⏭️  稍后手动运行: npm install @sentry/nextjs && npm install --save-dev @lhci/cli${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  步骤 5: 初始化 Sentry${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

read -p "$(echo -e ${GREEN}是否初始化 Sentry 配置? [Y/n]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    echo -e "${YELLOW}🔧 正在初始化 Sentry...${NC}"
    npx @sentry/wizard@latest -i nextjs --skip-connect || true
    echo -e "${GREEN}✅ Sentry 初始化完成${NC}"
else
    echo -e "${YELLOW}⏭️  稍后手动运行: npx @sentry/wizard@latest -i nextjs${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ 配置完成！                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}已保存的配置:${NC}"
if grep -q "CLOUDFLARE_API_TOKEN" .env.local 2>/dev/null; then
    echo "  ✅ Cloudflare CDN"
fi
if grep -q "NEXT_PUBLIC_GA_ID" .env.local 2>/dev/null; then
    echo "  ✅ Google Analytics 4"
fi
if grep -q "NEXT_PUBLIC_SENTRY_DSN" .env.local 2>/dev/null; then
    echo "  ✅ Sentry"
fi

echo ""
echo -e "${CYAN}下一步操作:${NC}"
echo "  1. 提交代码: git add -A && git commit -m 'feat: Add monitoring config' && git push"
echo "  2. 重新构建: npm run build"
echo "  3. 重启服务: pm2 restart all"
echo "  4. 验证数据:"
echo "     - GA4: https://analytics.google.com/"
echo "     - Sentry: https://sentry.io/"
echo ""

echo -e "${YELLOW}运行自动化脚本:${NC}"
echo "  ./scripts/setup-monitoring.sh  # 完整部署"
echo "  ./scripts/cdn-manager.sh verify  # 验证 CDN"
echo ""
