# 🚦 API 速率限制指南

## ✅ 已完成的速率限制系统

### 1. Redis-based 速率限制器

**文件**: `src/lib/rate-limiter.ts` (264行)

#### 核心特性

- ✅ **Redis 存储**: 分布式、持久化、高性能
- ✅ **固定窗口算法**: 简单高效，适合大多数场景
- ✅ **自动过期**: Key 自动清理，无需手动维护
- ✅ **故障开放**: Redis 宕机时允许请求（避免服务中断）
- ✅ **预定义配置**: 7种常用场景的速率限制策略
- ✅ **详细响应头**: 提供限流状态信息

---

### 2. 预定义速率限制配置

| 配置名称 | 限制次数 | 时间窗口 | 适用场景 |
|---------|---------|---------|----------|
| **AUTH** | 5次 | 15分钟 | 登录尝试 |
| **PASSWORD_RESET** | 3次 | 1小时 | 密码重置 |
| **API_DEFAULT** | 100次 | 1分钟 | 普通 API 调用 |
| **UPLOAD** | 10次 | 1小时 | 文件上传 |
| **SEARCH** | 30次 | 1分钟 | 搜索查询 |
| **CONTACT** | 5次 | 1小时 | 联系表单 |
| **PUBLIC_READ** | 200次 | 1分钟 | 公开只读 API |

---

### 3. API 安全包装器集成

**文件**: `src/lib/api-security.ts` (更新)

#### 使用示例

**基础用法 - 自定义限制**:
```typescript
import { withSecurity } from '@/lib/api-security'

export const POST = withSecurity(
  async (request) => {
    // 处理请求
    return NextResponse.json({ success: true })
  },
  {
    rateLimit: {
      maxRequests: 50,
      windowMs: 60 * 1000, // 50次/分钟
    }
  }
)
```

**使用预定义配置**:
```typescript
// 登录端点 - 严格限制
export const POST = withSecurity(
  async (request) => {
    // 处理登录
    return NextResponse.json({ token: '...' })
  },
  {
    rateLimit: 'AUTH'  // 5次/15分钟
  }
)

// 密码重置 - 非常严格
export const POST = withSecurity(
  async (request) => {
    // 发送重置邮件
    return NextResponse.json({ success: true })
  },
  {
    rateLimit: 'PASSWORD_RESET'  // 3次/小时
  }
)

// 产品搜索 - 中等限制
export const GET = withSecurity(
  async (request) => {
    // 搜索产品
    return NextResponse.json({ products: [] })
  },
  {
    rateLimit: 'SEARCH'  // 30次/分钟
  }
)

// 文件上传 - 严格限制
export const POST = withSecurity(
  async (request) => {
    // 处理上传
    return NextResponse.json({ url: '...' })
  },
  {
    rateLimit: 'UPLOAD'  // 10次/小时
  }
)
```

**组合使用**:
```typescript
export const POST = withSecurity(
  async (request) => {
    const body = await request.json()
    // 已认证 + 已限流 + 已验证
    return NextResponse.json({ success: true })
  },
  {
    requireAuth: true,
    rateLimit: 'CONTACT',  // 5次/小时
    validateInput: (body) => {
      if (!body.email) {
        return { valid: false, error: 'Email required' }
      }
      return { valid: true }
    }
  }
)
```

---

## 📊 响应头说明

当 API 启用速率限制后，会自动添加以下响应头：

### 成功响应
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1716000000
```

**字段说明**:
- `X-RateLimit-Limit`: 最大请求数
- `X-RateLimit-Remaining`: 剩余请求数
- `X-RateLimit-Reset`: 窗口重置时间戳（Unix timestamp）

### 限流响应
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1716000000
Retry-After: 45
Content-Type: application/json

{
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 45
}
```

**额外字段**:
- `Retry-After`: 建议等待秒数

---

## 🔧 实现细节

### Redis Key 命名规范

```
ratelimit:{type}:{identifier}

示例:
- ratelimit:api:POST:192.168.1.100
- ratelimit:api:GET:192.168.1.100
- ratelimit:user:12345
- ratelimit:ip:192.168.1.100
```

### 固定窗口算法

```
时间线:
|-- Window 1 --|-- Window 2 --|-- Window 3 --|
   [100 reqs]     [85 reqs]      [42 reqs]

每个窗口独立计数，窗口结束自动重置
```

**优点**:
- 简单高效
- Redis INCR 原子操作
- 自动过期清理

**缺点**:
- 窗口边界可能突发（可通过滑动窗口改进）

---

## 🛠️ 管理工具

### 查看速率限制状态

**API 端点**: `/api/admin/database-monitor?action=rate-limits`

```bash
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:3000/api/admin/database-monitor?action=rate-limits
```

响应:
```json
{
  "success": true,
  "activeLimits": [
    {
      "key": "ratelimit:api:POST:192.168.1.100",
      "count": 45,
      "ttl": 32
    }
  ]
}
```

### 重置速率限制

```typescript
import { resetRateLimit } from '@/lib/rate-limiter'

// 重置特定用户的限流
await resetRateLimit('user:12345')

// 重置特定 IP 的限流
await resetRateLimit('ip:192.168.1.100')
```

### 清理过期 Key

```typescript
import { cleanupRateLimits } from '@/lib/rate-limiter'

// 手动清理
const deleted = await cleanupRateLimits()
console.log(`Deleted ${deleted} expired keys`)

// 或设置 cron job（推荐）
// 每 5 分钟执行一次
```

**Cron Job 示例**:
```bash
# crontab -e
*/5 * * * * cd /path/to/project && node scripts/cleanup-rate-limits.js
```

---

## 📈 监控和告警

### 关键指标

1. **限流触发率**: 被拒绝的请求比例
2. **平均剩余次数**: 用户平均可用请求数
3. **峰值 QPS**: 每秒最高请求数
4. **Redis 命中率**: 缓存有效性

### 告警规则

**建议设置**:
- ⚠️ 警告: 限流触发率 > 10%
- 🚨 严重: 限流触发率 > 30%
- 🔴 紧急: Redis 连接失败

---

## 🎯 最佳实践

### 1. 选择合适的限制策略

**公开 API**:
```typescript
rateLimit: 'PUBLIC_READ'  // 200次/分钟
```

**用户操作**:
```typescript
rateLimit: 'API_DEFAULT'  // 100次/分钟
```

**敏感操作**:
```typescript
rateLimit: 'AUTH'  // 5次/15分钟
```

**资源密集型**:
```typescript
rateLimit: 'UPLOAD'  // 10次/小时
```

### 2. 渐进式限制

```typescript
// 第一次超限 - 温和提示
if (remaining === 0) {
  return {
    error: 'You have reached the rate limit. Please wait.',
    retryAfter: 60
  }
}

// 多次超限 - 更严格
if (consecutiveViolations > 5) {
  return {
    error: 'Too many violations. Account temporarily suspended.',
    retryAfter: 3600
  }
}
```

### 3. 白名单机制

```typescript
// 豁免内部 IP 或特权用户
const isWhitelisted = 
  ip.startsWith('10.0.') ||  // Internal network
  user.role === 'ADMIN'       // Admin users

if (!isWhitelisted) {
  const result = await rateLimit(identifier, config)
  if (!result.allowed) {
    return rateLimitResponse(result)
  }
}
```

### 4. 动态调整

```typescript
// 根据服务器负载动态调整限制
const serverLoad = await getServerLoad()

let config = RATE_LIMITS.API_DEFAULT

if (serverLoad > 80) {
  // 高负载时降低限制
  config = {
    maxRequests: 50,  // 从 100 降到 50
    windowMs: 60 * 1000,
  }
}
```

---

## 🔒 安全考虑

### 1. IP 欺骗防护

**问题**: 攻击者可能伪造 IP 地址

**解决方案**:
```typescript
// 使用多个头部字段，按优先级选择
const ip = 
  request.headers.get('x-real-ip') ||           // Nginx set
  request.headers.get('x-forwarded-for')?.split(',')[0] ||  // First IP
  request.ip ||
  'unknown'
```

### 2. 分布式限流

**问题**: 多服务器实例需要共享限流状态

**解决方案**: 使用 Redis（已实现）
- 所有实例共享同一个 Redis
- 原子操作保证一致性
- 无单点故障

### 3. 用户级 vs IP 级

**IP 级限流**:
- ✅ 防止匿名攻击
- ❌ NAT 用户共享 IP

**用户级限流**:
- ✅ 精确控制
- ❌ 需要先认证

**推荐**: 组合使用
```typescript
// 未认证用户 - IP 限流
if (!session) {
  await rateLimit(`ip:${ip}`, RATE_LIMITS.PUBLIC_READ)
}

// 已认证用户 - 用户 ID 限流
if (session) {
  await rateLimit(`user:${session.user.id}`, RATE_LIMITS.API_DEFAULT)
}
```

---

## 📚 参考资源

- [Redis INCR Command](https://redis.io/commands/incr/)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [OWASP Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/Rate_Limiting_Cheat_Sheet.html)
