# 卖家自定义分类 + 产品关键词 实施方案

## Context（背景）

当前平台的 1-5 级分类只能由管理员在 `/zh/admin/categories` 后台预先完善，卖家在 `/seller/products/new` 只能从已有分类中选择。这导致两个问题：

1. **分类灵活性不足**：卖家无法为自己的展会和产品设计贴合业务的分类体系，系统预设分类无法覆盖所有行业细分。
2. **产品搜索能力缺失**：`Product` 模型没有 `keywords` 字段，`/seller/products/new` 页面也没有关键词输入，产品只能靠标题/描述模糊匹配，搜索命中率低。同时 `/api/products/search` 存在字段名 bug（用 `name` 查询，但模型字段是 `title`），导致搜索永远空结果。

**目标**：让每个卖家（及其 AI agents）能自建 1-5 级分类并自动同步到系统分类池供他人引用；为产品增加关键词字段提升搜索曝光。全程保护生产数据安全。

**用户已确认的决策**：
- 分类审核：**自动批准（APPROVED）+ 管理员可事后驳回**，不走 PENDING 审核
- 审核范围：**包含管理员后台审核 UI**（来源徽章、驳回按钮、筛选 tab）
- 创建入口：**产品页弹窗快捷创建**（创建后自动选中），不建独立管理页

---

## 一、数据库 Schema 变更

### 1.1 修改 `prisma/schema.prisma`

**Category 模型**（L201-223）新增字段：

```prisma
// === 新增：来源与归属 ===
source          CategorySource @default(SYSTEM)   // SYSTEM=系统预置, SELLER=卖家提交
ownerId         String?                           // 卖家 SellerProfile.id（系统分类为 null）
submittedById   String?                           // 提交者 User.id（含 AI 子账号，用于审计）
submittedAt     DateTime?
// === 新增：审核状态（默认 APPROVED 实现自动同步） ===
status          CategoryStatus @default(APPROVED)
reviewedAt      DateTime?
reviewedBy      String?                           // 管理员 User.id
rejectionReason String?
```

新增关系与索引：
```prisma
owner       SellerProfile? @relation("SellerCategories", fields: [ownerId], references: [id], onDelete: SetNull)
submitter   User?          @relation("CategorySubmitter", fields: [submittedById], references: [id], onDelete: SetNull)

@@index([source])
@@index([status])
@@index([ownerId])
```

**Product 模型**（L253-294）新增：
```prisma
keywords    Json?    // string[]，与 Booth.keywords 完全一致的模式
```

**新增枚举**（紧邻现有 enum 定义处）：
```prisma
enum CategorySource {
  SYSTEM
  SELLER
}

enum CategoryStatus {
  APPROVED
  REJECTED
}
```

**SellerProfile / User 反向关联**：
```prisma
// SellerProfile 内新增
submittedCategories Category[] @relation("SellerCategories")

// User 内新增
submittedCategories Category[] @relation("CategorySubmitter")
```

### 1.2 迁移文件

路径：`prisma/migrations/20260807120000_add_category_ownership_and_product_keywords/migration.sql`

核心 SQL（全部 `ADD COLUMN IF NOT EXISTS` + `DEFAULT`，向前兼容，不锁表）：
- 创建 `CategorySource`、`CategoryStatus` 枚举类型
- Category 新增 8 列（source 默认 SYSTEM，status 默认 APPROVED）
- Product 新增 `keywords JSONB`
- 外键约束：`Category_ownerId_fkey` → SellerProfile，`Category_submittedById_fkey` → User
- 索引：`Category(source)`、`Category(status)`、`Category(ownerId)`
- GIN 索引：`Product_keywords_idx USING GIN (keywords jsonb_path_ops)` 加速 `@>` 查询

**数据安全**：现有分类自动 `source=SYSTEM, status=APPROVED`；现有产品 `keywords=NULL`。无需 UPDATE 语句。

---

## 二、后端 API

### 2.1 新建 `src/lib/category-auth.ts`（工具函数）

封装 `resolveSellerFromRequest(request)`，统一 session 与 API Key 双路径鉴权：
- 优先 `auth()` 拿 session → 用 `getEffectiveUserId(session)`（已存在于 `src/lib/ai-permissions.ts:194`）把 AI 子账号映射到监护人 ID
- session 为空但有 `Authorization: Bearer` → 调用 `authenticateAgent(request)`（已存在于 `src/middleware/ai-agent-auth.ts:20`），从 `agent.userId` 反查 User.isAI/ownerId
- 返回 `{ seller, submitterUserId, authMethod }`

### 2.2 新建 `src/app/api/seller/categories/route.ts`

**POST** — 卖家创建分类（同时支持 session 和 API Key，供 AI Agent 调用）：
- Zod schema 参考现有 `/api/admin/categories` route.ts L66-105 的字段命名（name, nameEn, level 1-5, parentId, model, series, description, hsCode）
- 校验：level>1 必须有 parentId；父分类必须存在且 status=APPROVED
- slug 生成复用 admin route 的去重逻辑（含 `Date.now()` 兜底）
- 创建数据：`source: 'SELLER', ownerId: seller.id, submittedById: submitterUserId, submittedAt: new Date(), status: 'APPROVED'`
- 创建后调用 `invalidateCategoryCaches()`（已存在于 `src/lib/cache.ts:155`）清除 `categories:tree:*` 缓存
- 返回 `{ success: true, category }`

**GET** — 返回当前卖家提交的所有分类（`where: { ownerId: seller.id }`），供产品页弹窗显示"我的分类"

### 2.3 新建 `src/app/api/admin/categories/[id]/review/route.ts`

**POST** — 管理员审核操作：
- body: `{ action: 'reject' | 'approve', reason?: string }`
- 仅 ADMIN（复用 `getServerSession` + role 检查）
- 更新 status / reviewedAt / reviewedBy / rejectionReason
- 调用 `invalidateCategoryCaches()`

### 2.4 修改 `src/app/api/admin/categories/route.ts`

GET 的 include 新增 `owner` 和 `submitter` 关联，响应映射新增字段：
- `source`、`status`、`ownerName`（cat.owner?.companyName）、`submittedByUsername`、`submittedByIsAI`、`submittedAt`、`rejectionReason`

POST 保持管理员创建语义不变，显式设置 `source: 'SYSTEM', status: 'APPROVED'`。

### 2.5 修改 `src/app/api/categories/tree/route.ts` 和 `src/app/api/categories/route.ts`

findMany 增加 `where: { status: 'APPROVED' }`，隐藏 REJECTED 分类。

### 2.6 修改 `src/app/api/products/route.ts`

- Zod schema（L12-52）新增：`keywords: z.array(z.string().min(1).max(100)).max(50).optional()`
- prisma.product.create data（L103-122）新增：`keywords: data.keywords && data.keywords.length > 0 ? data.keywords : null`

### 2.7 修改 `src/app/api/products/search/route.ts`（含 bug 修复）

**修复 bug**：L54-55 把 `{ name: { contains } }` 改为 `{ title: { contains } }`（Product 模型字段是 title 不是 name）。

**新增 keywords 搜索**：
```ts
where.OR = [
  { title: { contains: keyword, mode: 'insensitive' } },
  { titleEn: { contains: keyword, mode: 'insensitive' } },
  { description: { contains: keyword, mode: 'insensitive' } },
  { keywords: { path: [], array_contains: keyword } },  // JSONB 查询命中 GIN 索引
]
```

L64-68 的 `where.price` 加 `// TODO: Product 无 price 字段，此条件不生效` 注释（不在本次范围修复）。

---

## 三、前端

### 3.1 修改 `src/app/(dashboard)/seller/products/new/page.tsx`

**keywords 输入**（复用 `seller/booths/[id]/page.tsx` L712-748 的 tag 模式）：
- 新增 state：`keywords: string[]`、`keywordInput: string`
- 新增函数：`addKeyword()`（回车/点击添加，去重）、`removeKeyword(kw)`
- UI 插入位置：description 区块之后，复制 booths 页面的 tag chip 样式
- `productData`（L764-781）新增 `keywords: keywords.length > 0 ? keywords : undefined`
- `autoSaveDraft` 同步新增 keywords
- `t` 对象补 13 语言文案：`keywords`、`addKeyword`、`keywordsHint`

**分类快捷创建弹窗**：
- 在 L1-L5 级联选择器顶部加"+ 新建分类"按钮
- 点击弹出 Modal，包含：名称、英文名、上级分类（默认当前已选层级）、level（自动推断）
- 提交调用 `POST /api/seller/categories`，成功后自动 `setSelectedLevelN(newCategory.id)` 选中
- Modal 内显示"我的分类"列表（GET /api/seller/categories），支持快速选择历史创建

### 3.2 修改 `src/app/(dashboard)/admin/categories/page.tsx`

- 列表项新增 `source` 徽章（SYSTEM=灰，SELLER=蓝）和 `status` 徽章（APPROVED=绿，REJECTED=红）
- 卖家提交分类显示提交者（`submittedByUsername`，AI 账号加机器人图标）
- 新增"驳回"按钮（仅对 SELLER 分类显示），弹出 reason 输入框，调用 review API
- 顶部 tab 新增筛选：全部 / 系统 / 卖家提交 / 已驳回

---

## 四、AI Agent 支持

- API Key 鉴权通过 `authenticateAgent(request)`，返回 `agent.userId`
- 用 `agent.userId` 反查 User.isAI/ownerId，AI 子账号映射到监护人 SellerProfile
- `Category.ownerId = 监护人 seller.id`（与人类卖家无差别）
- `Category.submittedById = AI 子账号 User.id`（审计追溯具体 AI）
- 如已配置 AI 审计日志（`src/lib/ai-audit-prisma.ts`），记录 `action: 'category.create'`
- 限流由 `authenticateAgent` 内置 rate limit 处理，无需额外代码

---

## 五、生产部署安全流程

### 5.1 本地准备
```bash
git checkout -b feat/seller-categories-product-keywords
# 修改 schema.prisma + 创建迁移 + 修改代码
npx prisma migrate dev --name add_category_ownership_and_product_keywords --create-only
npx prisma migrate dev  # 本地应用 + 生成 Client
# 本地测试：卖家创建分类→树可见、管理员看到来源徽章、产品 keywords 搜索命中、AI API Key 创建分类
```

### 5.2 生产数据库备份（先备份）
```bash
ssh production-server
cd /var/www/chinahuib2b
npx tsx scripts/backup-db.ts   # 备份到 /var/backups/db_TIMESTAMP.sql + 上传 Spaces
# 兜底：PGPASSWORD=dev123 pg_dump -U expo_dev -h localhost -d global_expo_dev > /var/backups/db_manual_$(date +%Y%m%d_%H%M%S).sql
```

### 5.3 部署（迁移→构建→reload）
```bash
cd /var/www/chinahuib2b
git pull origin main
npm ci --omit=dev
npx prisma migrate deploy       # 先迁移，避免新代码读旧 schema
npx prisma generate
npm run build
pm2 reload chinahuib2b-prod     # 零停机 reload
```

### 5.4 线上验证
```bash
curl -s https://x2xhub.com/api/health | jq .
curl -s "https://x2xhub.com/api/categories/tree?locale=zh" | jq '.totalRootCategories'
psql -U expo_dev -h localhost -d global_expo_dev -c "SELECT source, status, COUNT(*) FROM \"Category\" GROUP BY source, status;"
# 期望：所有现有分类 source=SYSTEM, status=APPROVED
```

### 5.5 回滚方案
- **代码异常**：`git reset --hard <prev>` → `npm run build && pm2 reload`。schema 向前兼容，无需回滚数据库。
- **数据损坏（极端）**：`pm2 stop` → `psql < backup.sql` 恢复 → 代码回滚 → 重启。

---

## 六、文件修改清单

**修改（8 个）**：
1. `prisma/schema.prisma` — Category 新增 8 字段 + 2 关系 + 3 索引；Product 新增 keywords；2 枚举；SellerProfile/User 反向关联
2. `src/app/api/products/route.ts` — Zod schema + create data 新增 keywords
3. `src/app/api/products/search/route.ts` — 修复 name→title bug + 新增 keywords JSONB 搜索
4. `src/app/api/categories/route.ts` — findMany 加 status 过滤
5. `src/app/api/categories/tree/route.ts` — findMany 加 status 过滤
6. `src/app/api/admin/categories/route.ts` — GET include owner/submitter + 响应字段扩展
7. `src/app/(dashboard)/seller/products/new/page.tsx` — keywords UI + 分类快捷创建弹窗
8. `src/app/(dashboard)/admin/categories/page.tsx` — 来源/状态徽章 + 驳回按钮 + 筛选 tab

**新建（4 个）**：
1. `prisma/migrations/20260807120000_add_category_ownership_and_product_keywords/migration.sql`
2. `src/lib/category-auth.ts` — `resolveSellerFromRequest` 工具函数
3. `src/app/api/seller/categories/route.ts` — POST 创建 + GET 列表
4. `src/app/api/admin/categories/[id]/review/route.ts` — 审核操作

---

## 七、复用的现有工具（不重写）

| 工具 | 位置 | 用途 |
|------|------|------|
| `getEffectiveUserId(session)` | `src/lib/ai-permissions.ts:194` | AI 子账号→监护人 ID 映射 |
| `authenticateAgent(request)` | `src/middleware/ai-agent-auth.ts:20` | API Key 鉴权 AI Agent |
| `invalidateCategoryCaches()` | `src/lib/cache.ts:155` | 清除 categories:tree:* Redis 缓存 |
| `cacheGetOrSet` + `CACHE_KEYS.categoryTree()` | `src/lib/cache.ts` | 分类树缓存读写 |
| `auth()` / `getServerSession(authOptions)` | `src/lib/auth.ts` | session 鉴权 |
| booths 页面 keywords tag UI | `src/app/(dashboard)/seller/booths/[id]/page.tsx:712-748` | keywords 输入界面参考 |

---

## 八、验证清单

- [ ] 卖家登录 → `/seller/products/new` → 填关键词 → 创建产品 → `GET /api/products/search?keyword=xxx` 命中
- [ ] 卖家在分类选择器点"+ 新建分类" → 弹窗创建 L2 分类 → 自动选中 → 提交产品 → 产品关联新分类
- [ ] `GET /api/categories/tree` 立即包含新建分类（缓存失效生效）
- [ ] 管理员登录 `/zh/admin/categories` → 看到新分类带"卖家"蓝色徽章和提交者
- [ ] 管理员点"驳回" → 填理由 → 分类从 `/api/categories/tree` 消失，但 admin 列表仍可见（红色 REJECTED 徽章）
- [ ] AI Agent 用 API Key `POST /api/seller/categories` → 成功，`submittedById` 为 AI 子账号 ID，`ownerId` 为监护人 seller.id
- [ ] 生产环境现有分类全部 `source=SYSTEM, status=APPROVED`，无数据丢失
- [ ] 现有产品 keywords=NULL，不影响展示和搜索
