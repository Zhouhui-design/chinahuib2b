#!/bin/bash

# 性能监控系统自动部署脚本
# 用途: 一键集成 GA4、Sentry、Lighthouse CI

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  性能监控系统部署工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查是否在正确的项目目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 函数: 安装依赖
install_dependencies() {
    echo -e "${YELLOW}📦 安装监控依赖...${NC}"
    
    # Next.js 项目
    if [ -f "next.config.ts" ] || [ -f "next.config.js" ]; then
        echo -e "${BLUE}检测到 Next.js 项目${NC}"
        
        # 安装 Sentry
        npm install @sentry/nextjs
        
        # 安装 Lighthouse CI
        npm install --save-dev @lhci/cli
        
        echo -e "${GREEN}✅ Next.js 依赖安装完成${NC}"
    fi
    
    # Node.js 项目 (chat-system)
    if [ -d "server" ] && [ -d "client" ]; then
        echo -e "${BLUE}检测到 chat-system 项目${NC}"
        
        # 前端
        cd client
        npm install @sentry/browser @sentry/tracing
        cd ..
        
        # 后端
        cd server
        npm install @sentry/node @sentry/tracing @sentry/profiling-node
        cd ..
        
        echo -e "${GREEN}✅ chat-system 依赖安装完成${NC}"
    fi
}

# 函数: 配置 Sentry
setup_sentry() {
    echo -e "${YELLOW}🔧 配置 Sentry...${NC}"
    
    if [ -z "$SENTRY_DSN" ]; then
        echo -e "${YELLOW}请输入 Sentry DSN:${NC}"
        read -r SENTRY_DSN
    fi
    
    if [ -z "$SENTRY_ORG" ]; then
        echo -e "${YELLOW}请输入 Sentry Organization:${NC}"
        read -r SENTRY_ORG
    fi
    
    if [ -z "$SENTRY_PROJECT" ]; then
        echo -e "${YELLOW}请输入 Sentry Project Name:${NC}"
        read -r SENTRY_PROJECT
    fi
    
    # 创建环境变量文件
    if [ ! -f ".env.local" ]; then
        cp .env.example .env.local 2>/dev/null || touch .env.local
    fi
    
    # 添加 Sentry 配置
    echo "" >> .env.local
    echo "# Sentry Configuration" >> .env.local
    echo "NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN" >> .env.local
    echo "SENTRY_DSN=$SENTRY_DSN" >> .env.local
    echo "SENTRY_ORG=$SENTRY_ORG" >> .env.local
    echo "SENTRY_PROJECT=$SENTRY_PROJECT" >> .env.local
    
    echo -e "${GREEN}✅ Sentry 配置完成${NC}"
}

# 函数: 配置 GA4
setup_ga4() {
    echo -e "${YELLOW}🔧 配置 Google Analytics 4...${NC}"
    
    if [ -z "$GA_ID" ]; then
        echo -e "${YELLOW}请输入 GA4 测量 ID (格式: G-XXXXXXXXXX):${NC}"
        read -r GA_ID
    fi
    
    # 添加到环境变量
    echo "" >> .env.local
    echo "# Google Analytics 4" >> .env.local
    echo "NEXT_PUBLIC_GA_ID=$GA_ID" >> .env.local
    
    echo -e "${GREEN}✅ GA4 配置完成${NC}"
}

# 函数: 创建 GA4 组件
create_ga4_component() {
    echo -e "${YELLOW}📝 创建 GA4 组件...${NC}"
    
    mkdir -p src/components/analytics
    
    cat > src/components/analytics/GoogleAnalytics.tsx << 'EOF'
'use client'

import Script from 'next/script'

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}
EOF
    
    echo -e "${GREEN}✅ GA4 组件创建完成${NC}"
}

# 函数: 创建错误追踪工具
create_error_tracking() {
    echo -e "${YELLOW}📝 创建错误追踪工具...${NC}"
    
    mkdir -p src/lib
    
    cat > src/lib/error-tracking.ts << 'EOF'
import * as Sentry from '@sentry/nextjs'

export function trackError(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('extra_info', context)
    }
    Sentry.captureException(error)
  })
}

export function trackMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level)
}

export function setUser(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email: email,
  })
}
EOF
    
    echo -e "${GREEN}✅ 错误追踪工具创建完成${NC}"
}

# 函数: 配置 Lighthouse CI
setup_lighthouse_ci() {
    echo -e "${YELLOW}🔧 配置 Lighthouse CI...${NC}"
    
    cat > lighthouserc.json << 'EOF'
{
  "ci": {
    "collect": {
      "url": [
        "https://chinahuib2b.top/",
        "https://chinahuib2b.top/products",
        "https://chinahuib2b.top/stores"
      ],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "chromeFlags": "--no-sandbox"
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
EOF
    
    # 添加到 package.json scripts
    if command -v jq &> /dev/null; then
        tmp=$(mktemp)
        jq '.scripts["lighthouse"] = "lhci autorun"' package.json > "$tmp" && mv "$tmp" package.json
    else
        echo -e "${YELLOW}⚠️  请手动添加以下脚本到 package.json:${NC}"
        echo '"lighthouse": "lhci autorun"'
    fi
    
    echo -e "${GREEN}✅ Lighthouse CI 配置完成${NC}"
}

# 函数: 创建 GitHub Actions 工作流
create_github_workflow() {
    echo -e "${YELLOW}📝 创建 GitHub Actions 工作流...${NC}"
    
    mkdir -p .github/workflows
    
    cat > .github/workflows/lighthouse.yml << 'EOF'
name: Lighthouse CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Run Lighthouse CI
        run: npm run lighthouse
        env:
          LHCI_TOKEN: ${{ secrets.LHCI_TOKEN }}
EOF
    
    echo -e "${GREEN}✅ GitHub Actions 工作流创建完成${NC}"
}

# 主流程
echo -e "${BLUE}开始部署性能监控系统...${NC}"
echo ""

# 步骤 1: 安装依赖
echo -e "${YELLOW}[1/6] 安装依赖...${NC}"
install_dependencies
echo ""

# 步骤 2: 配置 Sentry
echo -e "${YELLOW}[2/6] 配置 Sentry...${NC}"
setup_sentry
echo ""

# 步骤 3: 配置 GA4
echo -e "${YELLOW}[3/6] 配置 GA4...${NC}"
setup_ga4
echo ""

# 步骤 4: 创建组件和工具
echo -e "${YELLOW}[4/6] 创建组件和工具...${NC}"
create_ga4_component
create_error_tracking
echo ""

# 步骤 5: 配置 Lighthouse CI
echo -e "${YELLOW}[5/6] 配置 Lighthouse CI...${NC}"
setup_lighthouse_ci
create_github_workflow
echo ""

# 步骤 6: 初始化 Sentry (仅 Next.js)
if [ -f "next.config.ts" ] || [ -f "next.config.js" ]; then
    echo -e "${YELLOW}[6/6] 初始化 Sentry 配置...${NC}"
    npx @sentry/wizard@latest -i nextjs --skip-connect || true
    echo ""
fi

# 完成
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ 性能监控系统部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}下一步操作:${NC}"
echo "1. 在 Sentry Dashboard 获取 Auth Token"
echo "2. 将 Auth Token 添加到环境变量: SENTRY_AUTH_TOKEN"
echo "3. 提交代码并推送到 GitHub"
echo "4. 访问 https://analytics.google.com/ 验证 GA4 数据"
echo "5. 访问 Sentry Dashboard 查看错误报告"
echo ""
echo -e "${YELLOW}运行测试:${NC}"
echo "  npm run lighthouse  # 运行 Lighthouse 审计"
echo ""
