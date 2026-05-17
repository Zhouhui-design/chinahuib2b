# 🔒 安全防护指南

## ✅ 已完成的安全措施

### 1. CSRF (跨站请求伪造) 防护

**文件**: `src/lib/security.ts` + `src/middleware.ts`

#### 实现方式

**CSRF Token 生成和验证**:
```typescript
// 中间件自动生成 CSRF token
const csrfToken = generateCSRFToken()
response.cookies.set('csrf-token', csrfToken, {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24, // 24 hours
})
```

**API 请求携带 CSRF Token**:
```typescript
// 前端发送请求时
fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': document.cookie.match(/csrf-token=([^;]+)/)?.[1]
  },
  body: JSON.stringify(data)
})
```

**后端验证**:
```typescript
// 自动在 securityMiddleware 中验证
if (!verifyCSRFToken(request)) {
  return NextResponse.json(
    { error: 'Invalid CSRF token' },
    { status: 403 }
  )
}
```

---

### 2. XSS (跨站脚本攻击) 防护

**文件**: `src/lib/security.ts`

#### Content Security Policy (CSP)

```typescript
response.headers.set(
  'Content-Security-Policy',
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "img-src 'self' data: https: blob:; " +
  "font-src 'self' https://fonts.gstatic.com; " +
  "connect-src 'self' https://api.* wss://*; " +
  "frame-ancestors 'none'; " +
  "base-uri 'self'; " +
  "form-action 'self';"
)
```

**CSP 规则说明**:
- `default-src 'self'`: 默认只允许同源资源
- `script-src`: 限制脚本来源
- `style-src`: 限制样式来源
- `img-src`: 允许图片从 HTTPS 加载
- `frame-ancestors 'none'`: 禁止被嵌入 iframe（防点击劫持）
- `form-action 'self'`: 表单只能提交到同源

#### HTML 转义

```typescript
// 自动转义用户输入
const sanitized = sanitizeHTML(userInput)
// <script>alert('XSS')</script> → &lt;script&gt;alert('XSS')&lt;/script&gt;
```

---

### 3. 安全头 (Security Headers)

**文件**: `src/middleware.ts`

#### 已配置的安全头

| 头部 | 值 | 作用 |
|------|-----|------|
| **X-Frame-Options** | DENY | 禁止 iframe 嵌入（防点击劫持） |
| **X-Content-Type-Options** | nosniff | 禁止 MIME 类型嗅探 |
| **Referrer-Policy** | strict-origin-when-cross-origin | 控制 Referrer 信息 |
| **Permissions-Policy** | camera=(), microphone=() | 禁用敏感 API |
| **Cross-Origin-Opener-Policy** | same-origin | 隔离浏览上下文 |
| **Cross-Origin-Resource-Policy** | same-origin | 限制跨域资源加载 |
| **Cross-Origin-Embedder-Policy** | require-corp | 要求跨域资源有 CORP 头 |
| **Content-Security-Policy** | (见上文) | 内容安全策略 |

---

### 4. 输入验证和清理

**文件**: `src/lib/api-security.ts`

#### 内置验证器

**邮箱验证**:
```typescript
import { validators } from '@/lib/api-security'

const result = validators.email('user@example.com')
if (!result.valid) {
  return NextResponse.json({ error: result.error }, { status: 400 })
}
```

**密码强度验证**:
```typescript
const result = validators.password('SecurePass123')
// 要求：至少 8 位，包含大小写字母和数字
```

**产品名称验证**:
```typescript
const result = validators.productName('Wireless Headphones')
// 要求：3-200 字符
```

**URL 验证**:
```typescript
const result = validators.url('https://example.com')
```

#### 输入清理

```typescript
import { sanitizeRequestBody } from '@/lib/api-security'

const cleanData = sanitizeRequestBody(body, ['title', 'description', 'name'])
// 自动去除 HTML 标签、trim、限制长度
```

---

### 5. API 安全包装器

**文件**: `src/lib/api-security.ts`

#### 使用示例

**基础用法**:
```typescript
import { withSecurity } from '@/lib/api-security'

export const POST = withSecurity(
  async (request) => {
    const body = await request.json()
    // 处理请求...
    return NextResponse.json({ success: true })
  },
  {
    requireAuth: true,  // 需要登录
  }
)
```

**管理员权限**:
```typescript
export const DELETE = withSecurity(
  async (request, { params }) => {
    // 只有管理员可以删除
    return NextResponse.json({ success: true })
  },
  {
    requireAuth: true,
    requireAdmin: true,
  }
)
```

**速率限制**:
```typescript
export const POST = withSecurity(
  async (request) => {
    // 处理询价提交
    return NextResponse.json({ success: true })
  },
  {
    rateLimit: {
      maxRequests: 10,  // 最多 10 次
      windowMs: 60 * 1000,  // 每分钟
    }
  }
)
```

**输入验证**:
```typescript
export const POST = withSecurity(
  async (request) => {
    const body = await request.json()
    // body 已经通过验证
    return NextResponse.json({ success: true })
  },
  {
    validateInput: (body) => {
      if (!body.title || body.title.length < 3) {
        return { valid: false, error: 'Title is required (min 3 chars)' }
      }
      return { valid: true }
    }
  }
)
```

**组合使用**:
```typescript
export const POST = withSecurity(
  async (request) => {
    //  authenticated + rate limited + validated
    return NextResponse.json({ success: true })
  },
  {
    requireAuth: true,
    rateLimit: { maxRequests: 5, windowMs: 60 * 1000 },
    validateInput: (body) => validators.email(body.email)
  }
)
```

---

## 🛡️ 其他安全措施

### 1. SQL 注入防护

**Prisma ORM 自动防护**:
```typescript
// Prisma 使用参数化查询，自动防止 SQL 注入
const user = await prisma.user.findUnique({
  where: { email: userInput }  // 安全
})

// 不要使用原始查询，除非必要
// ❌ 危险
await prisma.$queryRaw`SELECT * FROM users WHERE email = '${userInput}'`

// ✅ 安全
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`
```

### 2. 路径遍历防护

```typescript
// 验证文件路径
const fileName = path.basename(userProvidedPath)
const safePath = path.join('/uploads', fileName)

// 确保路径在允许的目录内
if (!safePath.startsWith('/uploads')) {
  throw new Error('Invalid path')
}
```

### 3. 文件上传安全

**已实现的措施**:
- ✅ 文件大小限制（20MB）
- ✅ 文件类型白名单（JPG, PNG, WebP, PDF）
- ✅ 唯一文件名生成（UUID）
- ✅ 图片优化和转换（Sharp）
- ✅ 存储在公共目录外（可选）

**建议增强**:
```typescript
// 检查文件魔数（file magic numbers）
function validateFileMagic(buffer: Buffer, expectedType: string): boolean {
  const signatures = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'application/pdf': [0x25, 0x50, 0x44, 0x46],
  }
  
  const signature = signatures[expectedType]
  if (!signature) return false
  
  return signature.every((byte, i) => buffer[i] === byte)
}
```

### 4. 认证和授权

**NextAuth v5**:
- ✅ JWT token 加密
- ✅ Session 管理
- ✅ 角色-based 访问控制（BUYER, SELLER, ADMIN）

**权限检查**:
```typescript
const session = await auth()

if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

if (session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

## 📊 安全测试清单

### 自动化测试

```bash
# 安装安全扫描工具
npm install -g npm-audit-resolver

# 检查依赖漏洞
npm audit

# 修复自动可修复的问题
npm audit fix
```

### 手动测试

**CSRF 测试**:
1. 登录应用
2. 在其他标签页打开恶意网站
3. 尝试通过恶意网站提交表单
4. 应该被 CSRF token 阻止

**XSS 测试**:
1. 在产品标题中输入: `<script>alert('XSS')</script>`
2. 保存并查看
3. 应该显示为纯文本，不执行脚本

**SQL 注入测试**:
1. 在搜索框输入: `' OR '1'='1`
2. 应该返回空结果或错误，不泄露数据

**路径遍历测试**:
1. 尝试访问: `/uploads/../../../etc/passwd`
2. 应该被拒绝

---

## 🔧 部署建议

### 1. 环境变量安全

**.env.local** (不要提交到 Git):
```env
# 数据库
DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="https://chinahuib2b.top"

# DigitalOcean Spaces
DO_SPACES_ACCESS_KEY="your-access-key"
DO_SPACES_SECRET_KEY="your-secret-key"

# Redis
REDIS_URL="redis://localhost:6379"
```

**.gitignore**:
```gitignore
.env*
!.env.example
```

### 2. HTTPS 强制

**Nginx 配置**:
```nginx
server {
    listen 80;
    server_name chinahuib2b.top www.chinahuib2b.top;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name chinahuib2b.top www.chinahuib2b.top;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
}
```

### 3. 防火墙配置

```bash
# 只开放必要端口
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 4. 定期更新

```bash
# 每周更新系统
sudo apt update && sudo apt upgrade -y

# 每月更新 Node.js 依赖
npm outdated
npm update
```

---

## 🚨 应急响应

### 发现安全漏洞时

1. **立即行动**:
   - 撤销泄露的密钥/token
   - 重置受影响用户的密码
   - 启用额外的监控

2. **调查范围**:
   - 检查日志确定影响范围
   - 评估数据泄露程度
   - 记录时间线

3. **修复漏洞**:
   - 修补代码漏洞
   - 更新依赖
   - 加强安全措施

4. **通知相关方**:
   - 通知受影响的用户
   - 报告给监管机构（如需要）
   - 发布安全公告

5. **事后分析**:
   - 根本原因分析
   - 改进安全措施
   - 更新应急预案

---

## 📚 参考资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
