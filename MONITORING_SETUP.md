# 监控完善指南

**日期**: 2026-05-28
**状态**: 待实施

---

## 推荐的监控工具

### 1. 错误追踪 - Sentry

Sentry 是最流行的错误追踪工具，可以实时捕获和报告生产环境的错误。

#### 安装步骤

```bash
# 安装 Sentry SDK
npm install @sentry/nextjs
```

#### 配置

创建 `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
});
```

#### 环境变量

```bash
# 在 .env.local 中添加
NEXT_PUBLIC_SENTRY_DSN=您的Sentry DSN
```

---

### 2. 性能监控 - Vercel Analytics

如果使用 Vercel 部署，可以直接启用 Analytics。

#### 配置

在 `layout.tsx` 中添加:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

### 3. Uptime 监控 - UptimeRobot

免费的 uptime 监控服务，可以监控网站可用性。

#### 设置步骤

1. 注册 UptimeRobot: https://uptimerobot.com/
2. 添加监控:
   - 监控类型: HTTP(s)
   - 监控间隔: 每 5 分钟
   - 告警通道: 邮箱、Webhook

#### 推荐监控端点

```
https://chinahuib2b.top/api/health
https://chinahuib2b.top/
```

---

### 4. 日志管理 - LogRocket

记录用户会话和错误，便于调试。

#### 安装

```bash
npm install logrocket
```

#### 配置

```typescript
import LogRocket from 'logrocket';

if (typeof window !== 'undefined') {
  LogRocket.init('your-app-id');
}
```

---

### 5. 实时告警 - PagerDuty

用于关键业务告警和值班管理。

#### 集成

1. 在 PagerDuty 中创建 Service
2. 获取 Integration Key
3. 在 Sentry 或 UptimeRobot 中配置 Webhook

---

## 快速部署清单

- [ ] 注册 Sentry 账号并获取 DSN
- [ ] 安装和配置 @sentry/nextjs
- [ ] 设置 UptimeRobot 监控
- [ ] 配置告警通道（邮件、Slack 等）
- [ ] 测试告警是否正常工作

---

## 关键指标监控

### 应用指标

- ✅ 错误率 (目标: < 1%)
- ✅ 页面加载时间 (目标: < 3s)
- ✅ API 响应时间 (目标: < 500ms)
- ✅ 用户活跃度

### 系统指标

- ✅ CPU 使用率 (目标: < 70%)
- ✅ 内存使用率 (目标: < 80%)
- ✅ 磁盘使用率 (目标: < 85%)
- ✅ 数据库连接数

### 业务指标

- ✅ 注册用户数
- ✅ 活跃卖家数
- ✅ 产品发布数
- ✅ 订单成交量

---

## 紧急响应流程

1. **告警触发** → PagerDuty/邮件通知
2. **值班人员响应** → 确认问题
3. **问题分类** → 前端/后端/数据库
4. **快速修复** → 回滚或热修复
5. **事后复盘** → 记录和学习
