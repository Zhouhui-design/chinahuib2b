# 🔐 登录问题诊断和修复

**问题**: 用户注册后第二天登录提示"账号没注册"

## 已识别的根本原因

### 1. 邮箱大小写不统一
注册时邮箱没有被标准化为小写，导致：
- 用户注册时使用 `Test@Example.com`
- 数据库存储为 `Test@Example.com`
- 登录时查询 `test@example.com` 找不到用户

### 2. 已应用的修复

#### 修复 1: 注册API邮箱标准化
文件: `/src/app/api/register/route.ts`
- 添加 `normalizedEmail = email.toLowerCase().trim()`
- 检查现有用户时使用 `normalizedEmail`
- 创建用户时使用 `normalizedEmail`

#### 修复 2: 登录API邮箱标准化
文件: `/src/app/api/auth/login/route.ts`
- 查询用户时使用 `email.toLowerCase().trim()`

#### 修复 3: NextAuth 邮箱标准化
文件: `/src/app/api/auth/[...nextauth]/route.ts`
- authorize 函数中使用标准化的邮箱查询

#### 修复 4: 增强调试端点
文件: `/src/app/api/auth/debug-login/route.ts`
- 添加详细的诊断信息
- 数据库健康检查
- 可能的错误原因列表
- 用户存在性检查

## 诊断工具

### 测试用户是否存在

```bash
curl -X POST https://chinahuib2b.top/api/auth/debug-login \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "password": "your-password"}'
```

返回示例:
```json
{
  "exists": true,
  "diagnostics": {
    "timestamp": "2026-05-29T...",
    "receivedEmail": "Test@Example.com",
    "emailNormalized": "test@example.com",
    "databaseHealth": "healthy",
    "userFound": true,
    "userDetails": {
      "email": "Test@Example.com",
      "isActive": true,
      "hasPassword": true
    }
  }
}
```

### 运行邮箱标准化脚本

```bash
npx ts-node scripts/normalize-email-case.ts
```

这个脚本会：
1. 查找所有邮箱大小写不一致的用户
2. 将邮箱标准化为小写
3. 避免与现有用户冲突

## 验证修复

1. 注册新用户测试：
```bash
curl -X POST https://chinahuib2b.top/api/register \
  -H "Content-Type: application/json" \
  -d '{"email": "Test@Example.com", "username": "testuser", "password": "password123", "role": "BUYER"}'
```

2. 立即登录测试：
```bash
curl -X POST https://chinahuib2b.top/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

3. 检查数据库中的用户：
```bash
curl -X POST https://chinahuib2b.top/api/auth/debug-login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 其他可能原因

如果问题仍然存在，检查：

1. **数据库连接**: `curl https://chinahuib2b.top/api/admin/database-monitor`
2. **订阅过期**: 卖家账户订阅过期会导致 `isActive=false`
3. **账户被删除**: 检查是否有数据清理任务
4. **环境变量不一致**: 多个环境使用不同的 DATABASE_URL

## 预防措施

1. ✅ 邮箱现在在注册时自动标准化
2. ✅ 登录时使用标准化的邮箱查询
3. 🔲 定期运行 `normalize-email-case.ts` 脚本
4. 🔲 添加数据库健康检查cron任务
