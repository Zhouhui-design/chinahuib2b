# 商家后台入口和订阅验证功能实现

## ✅ 已完成的工作

### 1. 数据库更新

**新增字段** (SellerProfile 模型):
- `subscriptionAmount` (Decimal) - 充值金额（美元）
- `lastPaymentAt` (DateTime) - 最后支付时间

**迁移文件**: `20260428104925_add_subscription_payment_fields`

### 2. 国际化支持

在首页导航栏添加了"商家后台"入口，支持 12 种语言：

| 语言 | 翻译 |
|------|------|
| 英语 | Seller Portal |
| 中文 | 商家后台 |
| 西班牙语 | Portal del Vendedor |
| 法语 | Portail Vendeur |
| 德语 | Verkäuferportal |
| 日语 | 販売者ポータル |
| 韩语 | 판매자 포털 |
| 阿拉伯语 | بوابة البائع |
| 俄语 | Портал Продавца |
| 葡萄牙语 | Portal do Vendedor |
| 印地语 | विक्रेता पोर्टल |
| 泰语 | พอร์ตอลผู้ขาย |
| 越南语 | Cổng Người Bán |

### 3. 首页导航栏更新

在 `/[locale]/page.tsx` 中添加了商家后台链接：
- 位置：导航栏右侧，参展商链接之后
- 样式：橙色文字 + 商店图标
- 链接：`/{locale}/seller/dashboard`

### 4. 商家验证中间件

创建了 `src/middleware-seller.ts`，实现以下验证逻辑：

#### 验证流程：

1. **身份验证**
   - 检查用户是否登录
   - 未登录则重定向到登录页面

2. **角色验证**
   - 检查用户是否为 SELLER 角色
   - 买家重定向到首页

3. **账号状态验证**
   - 检查账号是否激活
   - 未激活重定向到账号停用页面

4. **商家资料验证**
   - 检查是否有商家资料
   - 无资料重定向到设置页面

5. **订阅状态验证**
   - 检查订阅是否过期
   - 如果过期：
     - 更新状态为 EXPIRED
     - 检查是否在 3 个月宽限期内
     - 超过宽限期：重定向到过期页面
     - 宽限期内：允许访问（店铺对买家隐藏）

6. **充值金额验证**
   - 最低充值要求：$10 USD
   - 未达到要求：重定向到充值页面

---

## 📋 业务规则

### 商家入驻条件

1. **注册账号**
   - 必须注册并验证邮箱
   - 角色设置为 SELLER

2. **充值要求**
   - 最低充值：$10 USD
   - 充值后订阅状态变为 ACTIVE

3. **有效期管理**
   - 订阅有过期时间
   - 到期前需要续费

### 过期处理机制

#### 阶段 1: 订阅刚过期
- 订阅状态：EXPIRED
- 店铺状态：对买家隐藏（isActive = false）
- 商家后台：可访问
- 操作：可以续费恢复

#### 阶段 2: 过期 3 个月内（宽限期）
- 店铺状态：继续隐藏
- 商家后台：可访问
- 数据保留：所有资料、产品、订单保留
- 提示：显示续费提醒

#### 阶段 3: 过期超过 3 个月
- 店铺状态：永久隐藏
- 商家后台：禁止访问
- 重定向到：`/seller/subscription-expired?grace=expired`
- 数据保留：根据业务策略决定是否删除

---

## 🚀 下一步需要完成的工作

### 1. 创建必要的页面

需要创建以下页面：

```
/src/app/[locale]/seller/
├── dashboard/page.tsx           # 商家仪表板（已有）
├── setup/page.tsx               # 商家资料设置
├── subscription-required/page.tsx  # 充值页面
├── subscription-expired/page.tsx   # 订阅过期页面
└── store/
    └── edit/page.tsx            # 店铺装修（已有）
```

### 2. 充值功能实现

需要集成支付网关（如 Stripe、PayPal）：

```typescript
// 示例：创建充值 API
POST /api/seller/subscription/pay
{
  amount: 10, // USD
  paymentMethod: 'stripe' | 'paypal'
}
```

### 3. 店铺可见性控制

修改 stores 列表和产品查询，过滤掉过期的店铺：

```typescript
// 在 /api/sellers/route.ts 中添加过滤
where: { 
  isActive: true,
  OR: [
    { subscriptionStatus: 'ACTIVE' },
    { 
      subscriptionExpiry: { gte: new Date() },
      subscriptionAmount: { gte: 10 }
    }
  ]
}
```

### 4. 续费提醒系统

- 到期前 30 天发送邮件提醒
- 到期前 7 天再次提醒
- 过期后立即通知

### 5. 修复 TypeScript 错误

`middleware-seller.ts` 中有类型错误，需要：
- 重新生成 Prisma Client
- 或重启 TypeScript 服务器

---

## 🔧 技术实现细节

### 数据库 Schema 变更

```prisma
model SellerProfile {
  // ... existing fields ...
  
  subscriptionStatus SubscriptionStatus @default(FREE_TRIAL)
  subscriptionExpiry DateTime?
  subscriptionAmount Decimal? @db.Decimal(10, 2) // NEW
  lastPaymentAt DateTime?                        // NEW
  
  // ... rest of fields ...
}
```

### Middleware 配置

```typescript
export const config = {
  matcher: '/seller/:path*',
}
```

这会保护所有 `/seller/*` 路径。

---

## 📊 当前状态

| 功能 | 状态 | 说明 |
|------|------|------|
| 数据库字段 | ✅ 完成 | 已添加 subscriptionAmount 和 lastPaymentAt |
| 多语言翻译 | ✅ 完成 | 12 种语言全部翻译 |
| 导航栏入口 | ✅ 完成 | 首页顶部已添加 |
| 验证中间件 | ⚠️ 部分完成 | 逻辑已实现，有类型错误待修复 |
| 充值页面 | ❌ 待开发 | 需要创建 UI 和支付集成 |
| 过期页面 | ❌ 待开发 | 需要创建提示页面 |
| 店铺过滤 | ❌ 待开发 | 需要在 API 中添加过滤逻辑 |

---

## 💡 使用示例

### 商家访问流程

1. **新用户**
   ```
   访问 /en/seller/dashboard
   → 未登录 → 重定向到 /en/auth/login
   → 登录后 → 检查角色
   → 如果是买家 → 重定向到首页
   → 如果是卖家但无资料 → 重定向到 /en/seller/setup
   ```

2. **已注册但未充值**
   ```
   访问 /en/seller/dashboard
   → 已登录且是卖家
   → 有商家资料
   → 检查订阅金额 < $10
   → 重定向到 /en/seller/subscription-required
   ```

3. **订阅已过期（3个月内）**
   ```
   访问 /en/seller/dashboard
   → 订阅已过期
   → 但在宽限期内
   → 允许访问（显示警告）
   → 店铺对买家隐藏
   ```

4. **订阅已过期（超过3个月）**
   ```
   访问 /en/seller/dashboard
   → 订阅已过期
   → 超过宽限期
   → 重定向到 /en/seller/subscription-expired?grace=expired
   → 无法访问商家后台
   ```

---

## 🎯 测试建议

### 测试场景

1. **正常商家访问**
   - 充值 ≥ $10
   - 订阅未过期
   - 应该能正常访问后台

2. **未充值商家**
   - 充值 < $10 或未充值
   - 应该被重定向到充值页面

3. **过期商家（宽限期内）**
   - 订阅过期 < 3 个月
   - 应该能访问后台但有警告
   - 店铺对买家不可见

4. **过期商家（超过宽限期）**
   - 订阅过期 > 3 个月
   - 应该被拒绝访问
   - 重定向到过期页面

---

## 📝 相关文档

- 数据库迁移：`prisma/migrations/20260428104925_add_subscription_payment_fields/`
- 中间件：`src/middleware-seller.ts`
- 首页更新：`src/app/[locale]/page.tsx`
- 字典配置：`src/locales/dictionary.ts`

---

**实现日期：** 2026-04-28  
**状态：** 🔄 进行中（基础框架已完成，需要补充页面和支付集成）
