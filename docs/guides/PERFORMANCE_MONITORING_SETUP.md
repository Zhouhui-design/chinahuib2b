# 📊 性能监控系统配置指南

**日期**: 2026-05-19  
**目标**: 为 chinahuib2b.top 和 chat.fixr2026.com 部署性能监控  
**预期收益**: 
- 实时性能指标监控
- 自动告警通知
- 用户体验分析
- 问题快速定位

---

## 🎯 监控方案选择

### 方案对比

| 方案 | 成本 | 功能 | 适用场景 |
|------|------|------|----------|
| **Google Analytics 4** | 免费 | PV/UV、用户行为、转化 | 基础分析 ✅ |
| **Lighthouse CI** | 免费 | 性能审计、SEO检查 | 持续集成 ✅ |
| **Sentry** | 免费(5K事件/月) | 错误追踪、性能监控 | 生产环境 ✅ |
| **New Relic** | $99/月起 | APM、基础设施监控 | 企业级 |
| **Datadog** | $15/主机/月 | 全栈监控 | 大规模部署 |

**推荐组合**: GA4 + Lighthouse CI + Sentry（全部免费或低成本）

---

## 🔧 配置步骤

### 1. Google Analytics 4 (GA4)

#### 1.1 创建 GA4 属性

1. 访问 [Google Analytics](https://analytics.google.com/)
2. 点击 "开始衡量"
3. 创建账号: `Chinahuib2b`
4. 创建媒体资源:
   - 名称: `chinahuib2b.top`
   - 报告时区: `Asia/Shanghai`
   - 货币: `CNY`
5. 获取测量 ID (格式: `G-XXXXXXXXXX`)

#### 1.2 集成到 Next.js

创建 `src/components/analytics/GoogleAnalytics.tsx`:

```typescript
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
```

更新 `src/app/layout.tsx`:

```typescript
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <head>
        {/* ... */}
      </head>
      <body>
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
      </body>
    </html>
  )
}
```

添加环境变量 `.env.local`:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

### 2. Lighthouse CI (自动化性能审计)

#### 2.1 安装依赖

```bash
cd /home/sardenesy/projects/chinahuib2b
npm install --save-dev @lhci/cli
```

#### 2.2 创建配置文件

创建 `lighthouserc.json`:

```json
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
```

#### 2.3 添加到 package.json

```json
{
  "scripts": {
    "lighthouse": "lhci autorun"
  }
}
```

#### 2.4 创建 GitHub Actions 工作流

创建 `.github/workflows/lighthouse.yml`:

```yaml
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
```

---

### 3. Sentry (错误追踪和性能监控)

#### 3.1 创建 Sentry 项目

1. 访问 [Sentry](https://sentry.io/)
2. 注册/登录
3. 创建新项目:
   - 平台: `Next.js`
   - 项目名称: `chinahuib2b`
4. 获取 DSN (格式: `https://xxx@oxxx.ingest.sentry.io/xxx`)

#### 3.2 安装 Sentry

```bash
cd /home/sardenesy/projects/chinahuib2b
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

#### 3.3 配置 Sentry

自动生成的 `sentry.client.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

自动生成的 `sentry.server.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});
```

更新 `next.config.ts`:

```typescript
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  // ... existing config
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: "your-org-name",
  project: "chinahuib2b",
});
```

添加环境变量 `.env.local`:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@oxxx.ingest.sentry.io/xxx
SENTRY_DSN=https://xxx@oxxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your_auth_token
```

#### 3.4 自定义错误捕获

创建 `src/lib/error-tracking.ts`:

```typescript
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
```

使用示例:

```typescript
import { trackError } from '@/lib/error-tracking'

try {
  // Some operation
} catch (error) {
  trackError(error as Error, {
    action: 'fetch_products',
    userId: currentUser.id,
  })
}
```

---

### 4. chat-system 监控配置

#### 4.1 前端监控 (Sentry Browser)

```bash
cd /home/sardenesy/projects/chat-system/client
npm install @sentry/browser @sentry/tracing
```

创建 `src/sentry.js`:

```javascript
import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

在 `index.html` 中引入:

```html
<script src="/sentry.js"></script>
```

#### 4.2 后端监控 (Sentry Node)

```bash
cd /home/sardenesy/projects/chat-system/server
npm install @sentry/node @sentry/tracing
```

更新 `server.js`:

```javascript
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

// 请求追踪中间件
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// 错误处理中间件
app.use(Sentry.Handlers.errorHandler());
```

---

## 📈 监控仪表板

### 关键指标

#### 1. Web Vitals (核心网页指标)

| 指标 | 优秀 | 需要改进 | 差 |
|------|------|----------|-----|
| **LCP** (最大内容绘制) | < 2.5s | 2.5-4s | > 4s |
| **FID** (首次输入延迟) | < 100ms | 100-300ms | > 300ms |
| **CLS** (累积布局偏移) | < 0.1 | 0.1-0.25 | > 0.25 |
| **FCP** (首次内容绘制) | < 1.8s | 1.8-3s | > 3s |
| **TTFB** (首字节时间) | < 800ms | 800-1800ms | > 1800ms |

#### 2. 业务指标

- 页面浏览量 (PV)
- 独立访客 (UV)
- 跳出率
- 平均会话时长
- 转化率

#### 3. 技术指标

- API 响应时间
- 错误率
- WebSocket 连接成功率
- 缓存命中率

---

## 🚨 告警配置

### Sentry 告警规则

1. **错误率突增**
   - 条件: 5分钟内错误率 > 5%
   - 通知: Email + Slack

2. **性能下降**
   - 条件: P95 响应时间 > 2s
   - 通知: Email

3. **服务宕机**
   - 条件: 连续 3 次健康检查失败
   - 通知: Email + SMS

### GA4 自定义告警

1. **流量异常**
   - 条件: 日访问量下降 > 50%
   - 通知: Email

2. **转化率为零**
   - 条件: 24小时内无转化
   - 通知: Email

---

## 📊 数据可视化

### Grafana + Prometheus (可选高级方案)

如果需要更强大的监控，可以部署 Grafana:

```bash
# Docker Compose 配置
version: '3'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3002:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## 🔍 日常维护

### 每周检查清单

- [ ] 查看 GA4 流量趋势
- [ ] 检查 Sentry 错误报告
- [ ] 运行 Lighthouse 审计
- [ ] 分析慢查询日志
- [ ] 检查 CDN 缓存命中率

### 每月优化

- [ ] 清理过期日志
- [ ] 更新监控阈值
- [ ] 分析用户行为漏斗
- [ ] 优化低分页面
- [ ] 生成性能报告

---

## 📝 实施时间表

| 任务 | 预计时间 | 优先级 |
|------|----------|--------|
| GA4 集成 | 30分钟 | P0 ⭐⭐⭐ |
| Sentry 集成 | 1小时 | P0 ⭐⭐⭐ |
| Lighthouse CI | 1小时 | P1 ⭐⭐ |
| 告警配置 | 30分钟 | P1 ⭐⭐ |
| 仪表板定制 | 2小时 | P2 ⭐ |

**总计**: 约 5小时

---

## ✅ 验收标准

- [ ] GA4 正常收集数据
- [ ] Sentry 捕获错误和性能数据
- [ ] Lighthouse CI 在 CI/CD 中运行
- [ ] 所有 Web Vitals 达到"优秀"级别
- [ ] 告警通知正常工作
- [ ] 监控仪表板可视化完整

---

## 🎯 下一步行动

1. **立即执行** (今天):
   - 注册 GA4 和 Sentry 账户
   - 集成到项目中
   - 验证数据收集

2. **本周完成**:
   - 配置 Lighthouse CI
   - 设置告警规则
   - 测试告警通知

3. **下周完成**:
   - 定制监控仪表板
   - 分析首批数据
   - 优化发现的问题

---

**准备好开始了吗？请提供以下信息：**
1. GA4 测量 ID (如果有)
2. Sentry DSN (如果有)
3. 是否需要我帮助注册这些服务？
