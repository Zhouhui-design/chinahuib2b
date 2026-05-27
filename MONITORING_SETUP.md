# 监控完善指南

**日期**: 2026-05-28
**状态**: ⚡ 代码已部署，等待 API 凭据

---

## 推荐的监控工具

### 1. 错误追踪 - Sentry ✅ 已集成

Sentry 是最流行的错误追踪工具，可以实时捕获和报告生产环境的错误。

#### 状态: 代码已完成 (2026-05-28)

| 文件 | 说明 |
|------|------|
| `src/instrumentation-client.ts` | 客户端 SDK 初始化 + Session Replay |
| `src/sentry.server.config.ts` | 服务端 SDK 初始化 |
| `src/sentry.edge.config.ts` | Edge Runtime SDK 初始化 |
| `src/instrumentation.ts` | Next.js Instrumentation Hook |
| `next.config.ts` | withSentryConfig 包裹 |
| `.env.local` | `NEXT_PUBLIC_SENTRY_DSN` 占位符 |

#### ⚠️ 待完成: 获取 DSN

1. 用 `sardenesy@gmail.com` 注册 https://sentry.io/signup/
2. 创建项目名 `chinahuib2b`，选择 Next.js 平台
3. 复制 DSN (格式: `https://xxx@xxx.ingest.sentry.io/xxx`)
4. 填入 `.env.local` 的 `NEXT_PUBLIC_SENTRY_DSN`
5. 重新构建并部署

#### 已配置特性
- ✅ Error Monitoring
- ✅ Tracing (dev: 100%, prod: 10%)
- ✅ Session Replay (10% sessions, 100% on error)
- ✅ Logs 集成
- ✅ Router Transition Tracking

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

### 3. Uptime 监控 - UptimeRobot ⚡ 脚本已就绪

#### 状态: 自动化脚本完成 (2026-05-28)

脚本位置: `scripts/setup-uptimerobot.sh`

#### ⚠️ 待完成: 获取 API Key

1. 用 `sardenesy@gmail.com` 注册 https://uptimerobot.com/signup
2. Dashboard → My Settings → API Keys → 创建 Read-Write API Key
3. 运行: `bash scripts/setup-uptimerobot.sh YOUR_API_KEY`

#### 监控端点
```
https://chinahuib2b.top/
https://chinahuib2b.top/api/health
```
- 检查间隔: 5 分钟
- 超时: 30 秒
- 告警: 需在 Dashboard 手动配置邮箱通知

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

- [x] 安装和配置 @sentry/nextjs
- [ ] 注册 Sentry 账号并获取 DSN (需 sardenesy@gmail.com)
- [x] UptimeRobot 自动化脚本
- [ ] 注册 UptimeRobot 获取 API Key (需 sardenesy@gmail.com)
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
