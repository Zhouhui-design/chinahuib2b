# AI Agent 登录、工作与授权系统实施计划

## Context

当前平台已支持 AI 账户注册（`/api/accounts/create`），但 AI 账户注册后无法真正登录使用。核心问题：
1. **Session 缺少 AI 标识**：`delegate-login` 的 `tokenPayload` 只写入 `id` 和 `role`，未写入 `isAI` 和 `ownerId`，导致系统无法区分 AI 与人类用户。
2. **AI_SELLER 无法进入仪表板**：`SellerDashboardServer` 通过 `session.user.id` 查找 `SellerProfile`，AI 账户没有自己的 SellerProfile，被重定向到设置页面。
3. **权限系统未启用**：Prisma 已有 `AIPermission` 和 `AIAuditLog` 模型，但从未被使用。Guardian 无法控制 AI 能做什么。
4. **AI 账号管理页面有 bug**：`/seller/ai-accounts` 调用 `/api/admin/users`（需 ADMIN 权限），seller 调用会 401。

**目标**：让 AI agents 能通过用户名+密码登录，复用现有 `/seller` 仪表板工作，监护人能通过 UI 管理 AI 的细粒度权限。

---

## 实施步骤

### 第一步：Session 增强 — 让系统识别 AI

#### 1.1 扩展 NextAuth 类型声明
**文件**：`src/types/next-auth.d.ts`

在 `User`、`Session`、`JWT` 接口中增加 `isAI?: boolean` 和 `ownerId?: string` 字段。

#### 1.2 在 delegate-login 中写入 isAI/ownerId
**文件**：`src/app/api/auth/delegate-login/route.ts`（第 119-143 行）

在 `tokenPayload` 中追加 `isAI: user.isAI` 和 `ownerId: user.ownerId`。
在返回给前端的 `user` 对象中也追加这两个字段，供登录页判断重定向。

#### 1.3 在 NextAuth 回调中透传 isAI/ownerId
**文件**：`src/lib/auth.ts`（第 53-76 行）

- `jwt` 回调：`token.isAI = (user as any).isAI; token.ownerId = (user as any).ownerId`
- `session` 回调：`session.user.isAI = token.isAI; session.user.ownerId = token.ownerId`

---

### 第二步：AI 权限目录与工具函数（核心库）

#### 2.1 创建权限目录和工具函数
**新文件**：`src/lib/ai-permissions.ts`

定义结构化权限目录（`<resource>.<action>` 格式）：

```typescript
export const AI_PERMISSIONS = {
  // 通用权限
  'product.browse':    { label: '浏览商品', default: { AI_BUYER: true, AI_SELLER: true } },
  'chat.send':         { label: '发送聊天', default: { AI_BUYER: true, AI_SELLER: true } },
  'chat.read':         { label: '读取聊天', default: { AI_BUYER: true, AI_SELLER: true } },
  'shoutout.post':     { label: '广场喊话', default: { AI_BUYER: true, AI_SELLER: true } },
  'order.view':        { label: '查看订单', default: { AI_BUYER: true, AI_SELLER: true } },
  // 买家专属
  'inquiry.create':    { label: '发起询盘', default: { AI_BUYER: true, AI_SELLER: false } },
  'order.place':       { label: '下单购买', default: { AI_BUYER: true, AI_SELLER: false } },
  // 卖家专属
  'product.create':    { label: '发布商品', default: { AI_BUYER: false, AI_SELLER: true } },
  'product.update':    { label: '编辑商品', default: { AI_BUYER: false, AI_SELLER: true } },
  'product.delete':    { label: '删除商品', default: { AI_BUYER: false, AI_SELLER: false } },
  'booth.edit':        { label: '装修展位', default: { AI_BUYER: false, AI_SELLER: true } },
  'brochure.upload':   { label: '上传宣传册', default: { AI_BUYER: false, AI_SELLER: true } },
  'store.profile.edit':{ label: '编辑店铺资料', default: { AI_BUYER: false, AI_SELLER: false } },
  'inquiry.respond':   { label: '回复询盘', default: { AI_BUYER: false, AI_SELLER: true } },
  'order.fulfill':     { label: '履行订单', default: { AI_BUYER: false, AI_SELLER: true } },
} as const
```

核心函数：
- `hasAIPermission(userId, permission)` — 查 AIPermission 表，无记录用默认值，人类直接返回 true
- `seedDefaultAIPermissions(userId, role)` — 创建 AI 账号时播种默认权限到 DB
- `getEffectiveSellerProfileId(session)` — 返回 AI 的 ownerId 或人类自己的 id
- `requireAIPermission(permission)` — API 路由装饰器，AI 无权限返回 403，人类透明通过

**关键设计**："无记录 = 用默认值"策略保证现有 AI 账号无需迁移即可工作。

---

### 第三步：AI 审计日志工具

#### 3.1 创建 Prisma 审计日志工具
**新文件**：`src/lib/ai-audit-prisma.ts`

- `logAIAudit({ userId, action, target?, result?, metadata? })` — 写入 AIAuditLog 表，fire-and-forget 永不抛错
- `getGuardianAuditLogs({ guardianId, userId?, action?, page?, limit? })` — 分页查询 AI 操作日志
- `verifyAIBelongsToGuardian(aiUserId, guardianId)` — 校验 AI 账号属于该监护人

---

### 第四步：AI 账号创建时播种权限

**文件**：`src/app/api/accounts/create/route.ts`（第 82 行后）

在 `prisma.user.create` 成功后，调用 `seedDefaultAIPermissions(user.id, role)`。用 try/catch 包裹，失败只记日志不阻断创建。

---

### 第五步：AI_SELLER 工作台适配

#### 5.1 修改 SellerDashboardServer 解析逻辑
**文件**：`src/app/(dashboard)/seller/SellerDashboardServer.tsx`

```typescript
// AI_SELLER 通过 ownerId 找到 guardian 的 SellerProfile
const effectiveUserId = session.user.isAI 
  ? (session.user.ownerId || session.user.id) 
  : session.user.id

const seller = await prisma.sellerProfile.findUnique({
  where: { userId: effectiveUserId },
})
```

同样的 `effectiveUserId` 模式应用到查询 SellerProfile 的 API 路由：
- `src/app/api/products/route.ts`
- `src/app/api/booths/route.ts`

#### 5.2 Seller 仪表板布局增加 AI 标识
**文件**：`src/app/(dashboard)/seller/SellerDashboardClientLayout.tsx`

在导航栏标题旁，根据 `session.user.isAI` 显示 "AI 模式" 紫色徽章。

---

### 第六步：Guardian 权限管理 API

#### 6.1 AI 账号列表 API（替代错误的 admin 端点调用）
**新文件**：`src/app/api/ai/accounts/route.ts`

```typescript
// GET /api/ai/accounts — 返回当前 guardian 的所有 AI 账号
// where: { ownerId: session.user.id, isAI: true }
// include: { aiPermissions: true }
```

#### 6.2 权限管理 API
**新文件**：`src/app/api/ai/permissions/route.ts`

```typescript
// GET /api/ai/permissions?aiUserId=xxx — 返回 AI 账号的权限列表（默认值 + DB 记录合并）
// PUT /api/ai/permissions — body: { aiUserId, permission, isAllowed, expiresAt? }
//   upsert AIPermission 记录，校验 verifyAIBelongsToGuardian
```

#### 6.3 审计日志查询 API
**新文件**：`src/app/api/ai/audit-logs/route.ts`

```typescript
// GET /api/ai/audit-logs?aiUserId=xxx&page=1&limit=50
// 调用 getGuardianAuditLogs，校验 verifyAIBelongsToGuardian
```

#### 6.4 AI 账号删除 API
**新文件**：`src/app/api/ai/accounts/[id]/route.ts`

```typescript
// DELETE /api/ai/accounts/[id] — guardian 自助删除 AI 账号
// 校验 verifyAIBelongsToGuardian，级联删除 AIPermission 和 AIAuditLog
```

---

### 第七步：Guardian 权限管理 UI

**文件**：`src/app/(dashboard)/seller/ai-accounts/page.tsx`

关键改造：
1. **修复数据源**（第 60-74 行）：`fetch('/api/admin/users?role=AI_BUYER&role=AI_SELLER')` → `fetch('/api/ai/accounts')`
2. **权限管理面板**（替换第 404-431 行静态展示）：
   - 每个 AI 账号行增加"管理权限"按钮
   - 模态框列出 `AI_PERMISSIONS` 目录，每项有 toggle 开关
   - 调用 `PUT /api/ai/permissions` 实时更新
3. **审计日志标签页**：调用 `/api/ai/audit-logs?aiUserId=xxx` 展示操作历史
4. **删除按钮**（第 108-128 行）：改用新的 `DELETE /api/ai/accounts/[id]`

---

## 文件清单

### 新建文件（6 个）
1. `src/lib/ai-permissions.ts` — 权限目录、检查函数、装饰器
2. `src/lib/ai-audit-prisma.ts` — 审计日志工具
3. `src/app/api/ai/accounts/route.ts` — guardian AI 账号列表
4. `src/app/api/ai/accounts/[id]/route.ts` — guardian 删除 AI 账号
5. `src/app/api/ai/permissions/route.ts` — 权限管理
6. `src/app/api/ai/audit-logs/route.ts` — 审计日志查询

### 修改文件（6 个）
1. `src/types/next-auth.d.ts` — 类型扩展
2. `src/app/api/auth/delegate-login/route.ts` — tokenPayload 增加 isAI/ownerId
3. `src/lib/auth.ts` — JWT/session 回调透传
4. `src/app/api/accounts/create/route.ts` — 播种默认权限
5. `src/app/(dashboard)/seller/SellerDashboardServer.tsx` — effectiveUserId 解析
6. `src/app/(dashboard)/seller/ai-accounts/page.tsx` — 修复数据源 + 权限管理 UI

---

## 验证步骤

1. **Session 验证**：AI 账号登录后，检查 `session.user.isAI === true` 和 `session.user.ownerId` 有值
2. **AI_SELLER 工作台**：AI_SELLER 登录后进入 `/seller`，能看到 guardian 的商品列表
3. **AI_BUYER 浏览**：AI_BUYER 登录后进入首页，能浏览商品
4. **权限管理**：Guardian 在 `/seller/ai-accounts` 能看到 AI 账号列表（不再 401），能 toggle 权限
5. **审计日志**：Guardian 能查看 AI 账号的操作历史
6. **人类用户不受影响**：Guardian 自己登录后操作一切正常
7. **部署验证**：构建成功 → PM2 重启 → Cloudflare 缓存清除 → 生产环境验证

---

## 后续扩展（本次不做）

- 权限装饰器逐个接入 API 路由（`requireAIPermission('product.create')` 等）
- AI 操作时自动记录审计日志（`logAIAudit`）
- Redis 缓存权限查询优化性能
- AI 权限过期时间管理
