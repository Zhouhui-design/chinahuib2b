# 📊 监控告警系统指南

## ✅ 已完成的监控系统

### 1. 错误追踪系统

**文件**: `src/lib/monitoring.ts` (388行)

#### 核心功能

**错误追踪**:
```typescript
import { trackError, ErrorSeverity } from '@/lib/monitoring'

// 手动追踪错误
trackError(
  new Error('Database connection failed'),
  ErrorSeverity.CRITICAL,
  {
    userId: 'user-123',
    url: '/api/products',
    metadata: { query: 'SELECT * FROM products' }
  }
)
```

**自动 API 错误追踪**:
```typescript
import { withErrorTracking } from '@/lib/monitoring'

export const GET = withErrorTracking(
  async (request) => {
    // Your API logic
    return NextResponse.json({ data: [] })
  },
  request
)
```

**错误 severity 级别**:
- `LOW` - 低优先级（警告）
- `MEDIUM` - 中等优先级（一般错误）
- `HIGH` - 高优先级（严重错误）
- `CRITICAL` - 紧急（系统崩溃）

---

### 2. 性能监控

**记录性能指标**:
```typescript
import { recordMetric, measureTime } from '@/lib/monitoring'

// 手动记录
recordMetric({
  name: 'page_load_time',
  value: 1250,
  unit: 'ms',
  tags: { page: 'home' }
})

// 自动测量函数执行时间
const result = await measureTime(
  'database_query',
  async () => {
    return await prisma.product.findMany()
  },
  { table: 'products' }
)
```

**获取性能统计**:
```typescript
import { getMetricStats } from '@/lib/monitoring'

const stats = getMetricStats('api_request', 3600000) // 最近1小时
console.log(stats)
// {
//   count: 1523,
//   avg: 45.2,
//   min: 12,
//   max: 890,
//   p95: 120,
//   p99: 250
// }
```

---

### 3. 健康检查端点

**端点**: `/api/health`

**响应示例**:
```json
{
  "status": "healthy",
  "timestamp": "2026-05-17T10:30:00Z",
  "uptime": 86400,
  "services": {
    "database": "ok",
    "redis": "ok"
  },
  "version": "1.0.0"
}
```

**使用场景**:
- 负载均衡器健康检查
- CI/CD 部署验证
- 监控系统探测
- Kubernetes liveness probe

---

### 4. 监控仪表板 API

**端点**: `/api/admin/monitoring`

#### 可用操作

**1. 获取监控概览**
```bash
GET /api/admin/monitoring?action=overview
```

响应:
```json
{
  "success": true,
  "overview": {
    "errors": {
      "total": 156,
      "bySeverity": {
        "low": 45,
        "medium": 78,
        "high": 28,
        "critical": 5
      },
      "recentTrend": -12,
      "topErrors": [
        { "name": "DatabaseError: Connection timeout", "count": 23 },
        { "name": "ValidationError: Invalid email", "count": 18 }
      ]
    },
    "performance": {
      "apiLatency": {
        "count": 5234,
        "avg": 45.2,
        "p95": 120,
        "p99": 250
      },
      "dbQueries": {
        "count": 8921,
        "avg": 12.5,
        "p95": 35,
        "p99": 78
      }
    }
  }
}
```

**2. 获取最近错误**
```bash
GET /api/admin/monitoring?action=errors&limit=50&severity=HIGH
```

**3. 获取错误统计**
```bash
GET /api/admin/monitoring?action=error-stats
```

**4. 获取性能指标**
```bash
GET /api/admin/monitoring?action=metrics&name=api_request&limit=100
```

**5. 获取指标统计**
```bash
GET /api/admin/monitoring?action=metric-stats&name=db_query&window=3600000
```

**6. 清理旧错误**
```bash
GET /api/admin/monitoring?action=clear-errors&days=7
```

---

## 🔧 集成示例

### 1. API 路由错误追踪

```typescript
import { withErrorTracking } from '@/lib/monitoring'
import { measureTime } from '@/lib/monitoring'

export const GET = withErrorTracking(
  async (request) => {
    // Measure database query time
    const products = await measureTime(
      'db_query_products',
      async () => {
        return await prisma.product.findMany({
          where: { isActive: true },
          take: 20
        })
      }
    )
    
    // Measure total API response time
    return NextResponse.json({ products })
  },
  request
)
```

### 2. 自定义错误处理

```typescript
import { trackError, ErrorSeverity } from '@/lib/monitoring'

try {
  await processPayment(orderId)
} catch (error) {
  // Track payment error as critical
  trackError(
    error instanceof Error ? error : new Error(String(error)),
    ErrorSeverity.CRITICAL,
    {
      userId: session.user.id,
      metadata: { orderId, amount: order.total }
    }
  )
  
  throw error
}
```

### 3. 前端错误边界

```typescript
'use client'

import { useEffect } from 'react'
import { trackError } from '@/lib/monitoring'

export default function ErrorBoundary({ error }: { error: Error }) {
  useEffect(() => {
    // Send error to backend
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    })
  }, [error])
  
  return <div>Something went wrong</div>
}
```

---

## 📈 监控指标

### 关键性能指标 (KPIs)

| 指标 | 目标值 | 告警阈值 |
|------|--------|----------|
| **API P95 延迟** | < 200ms | > 500ms |
| **API P99 延迟** | < 500ms | > 1000ms |
| **数据库查询 P95** | < 50ms | > 100ms |
| **错误率** | < 1% | > 5% |
| **可用性** | > 99.9% | < 99% |

### 业务指标

| 指标 | 说明 |
|------|------|
| **活跃用户数** | DAU/MAU |
| **产品浏览量** | 总浏览次数 |
| **询价转化率** | 浏览到询价的转化 |
| **平均会话时长** | 用户停留时间 |

---

## 🚨 告警配置

### 1. 基于 Webhook 的告警

在 `.env.local` 中配置：

```bash
ERROR_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**Slack 通知示例**:
```typescript
// 自动发送错误到 Slack
if (process.env.ERROR_WEBHOOK_URL) {
  await fetch(process.env.ERROR_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Critical Error: ${error.message}`,
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Error', value: error.name, short: true },
          { title: 'Severity', value: error.severity, short: true },
          { title: 'URL', value: error.context.url, short: false },
        ]
      }]
    })
  })
}
```

### 2. 基于阈值的告警

```typescript
// 检查错误率是否超过阈值
const stats = getErrorStats()
const errorRate = stats.total / totalRequests

if (errorRate > 0.05) { // 5%
  sendAlert(`High error rate: ${(errorRate * 100).toFixed(2)}%`)
}

// 检查 API 延迟
const apiStats = getMetricStats('api_request', 3600000)
if (apiStats.p95 > 500) {
  sendAlert(`High API latency P95: ${apiStats.p95}ms`)
}
```

### 3. 定期报告

设置 cron job 发送每日报告：

```bash
# crontab -e
0 9 * * * curl https://chinahuib2b.top/api/admin/monitoring?action=overview | mail -s "Daily Monitoring Report" admin@example.com
```

---

## 🛠️ 外部集成

### 1. Sentry 集成

安装 Sentry：
```bash
npm install @sentry/nextjs
```

配置 `sentry.client.config.ts`:
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

### 2. LogRocket 集成

```typescript
import LogRocket from 'logrocket'

LogRocket.init('your-app-id')

// 记录用户信息
LogRocket.identify(userId, {
  name: userName,
  email: userEmail,
})
```

### 3. Prometheus + Grafana

导出指标到 Prometheus：
```typescript
import client from 'prom-client'

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
})

// 在 middleware 中记录
httpRequestDuration
  .labels(req.method, req.path, res.statusCode)
  .observe(duration)
```

---

## 📊 监控仪表板

### 推荐的仪表板布局

**1. 系统健康**
- 服务状态（DB, Redis, App）
- CPU/内存使用率
- 磁盘空间

**2. 性能指标**
- API 延迟（P50, P95, P99）
- 数据库查询时间
- 页面加载时间

**3. 错误追踪**
- 错误率趋势图
- Top 10 错误列表
- 错误分布（按 severity）

**4. 业务指标**
- 活跃用户数
- 产品浏览量
- 询价数量

---

## 🔍 故障排查

### 常见问题

**1. 高错误率**

检查步骤:
```bash
# 查看最近错误
curl https://chinahuib2b.top/api/admin/monitoring?action=errors&severity=HIGH

# 查看错误统计
curl https://chinahuib2b.top/api/admin/monitoring?action=error-stats
```

**2. 高延迟**

检查步骤:
```bash
# 查看 API 延迟统计
curl https://chinahuib2b.top/api/admin/monitoring?action=metric-stats&name=api_request

# 查看数据库查询统计
curl https://chinahuib2b.top/api/admin/monitoring?action=metric-stats&name=db_query
```

**3. 服务不可用**

检查步骤:
```bash
# 健康检查
curl https://chinahuib2b.top/api/health

# 检查 PM2 状态
pm2 status

# 查看日志
pm2 logs chinahuib2b --lines 100
```

---

## 📚 参考资源

- [Sentry Documentation](https://docs.sentry.io/)
- [Prometheus Monitoring](https://prometheus.io/docs/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [New Relic APM](https://newrelic.com/products/apm)
