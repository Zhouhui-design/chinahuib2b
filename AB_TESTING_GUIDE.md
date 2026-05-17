# 🧪 A/B 测试框架 - 完整指南

## ✅ 已完成的功能

### 1. 核心库 (`src/lib/ab-testing.ts`, 316行)

**功能**:
- ✅ 创建和管理 A/B 测试实验
- ✅ 用户分配（一致性哈希）
- ✅ 转化跟踪
- ✅ 结果统计和显著性计算
- ✅ Redis 存储后端

**API**:
```typescript
// 创建实验
const experiment = await createExperiment({
  name: 'Homepage CTA Test',
  variants: [
    { id: 'control', name: 'Control', weight: 50 },
    { id: 'variant_a', name: 'Variant A', weight: 50 }
  ],
  trafficPercentage: 100,
  goal: 'conversion'
})

// 分配用户
const variantId = await assignUserToVariant(userId, experimentId)

// 跟踪转化
await trackConversion(userId, experimentId, 'conversion', 99.99)

// 获取结果
const results = await getExperimentResults(experimentId)
```

### 2. React Hook (`src/hooks/useABTest.tsx`, 107行)

**使用示例**:
```tsx
import { useABTest } from '@/hooks/useABTest'

function HomePage() {
  const { variant, isLoading, trackConversion } = useABTest('homepage_cta_test')
  
  if (isLoading) return <div>Loading...</div>
  
  const handleClick = async () => {
    await trackConversion('click')
    // Handle click
  }
  
  return (
    <div>
      {variant === 'control' ? (
        <button onClick={handleClick}>Sign Up</button>
      ) : (
        <button onClick={handleClick}>Get Started Free</button>
      )}
    </div>
  )
}
```

### 3. HOC (Higher Order Component)

**使用示例**:
```tsx
import { withABTest } from '@/hooks/useABTest'

function ControlVersion(props) {
  return <button>Sign Up</button>
}

function VariantA(props) {
  return <button>Get Started Free</button>
}

const ABTestedButton = withABTest('homepage_cta_test', {
  control: ControlVersion,
  variant_a: VariantA,
})

export default ABTestedButton
```

### 4. 管理 API (`src/app/api/admin/ab-tests/route.ts`, 184行)

**端点**:

#### GET `/api/admin/ab-tests`
列出所有活跃实验

```bash
curl https://chinahuib2b.top/api/admin/ab-tests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### GET `/api/admin/ab-tests?id=exp_123`
获取特定实验及其结果

```bash
curl https://chinahuib2b.top/api/admin/ab-tests?id=exp_123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST `/api/admin/ab-tests`
创建新实验

```bash
curl -X POST https://chinahuib2b.top/api/admin/ab-tests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Homepage CTA Test",
    "description": "Test different CTA button text",
    "variants": [
      {"id": "control", "name": "Control", "weight": 50},
      {"id": "variant_a", "name": "Variant A", "weight": 50}
    ],
    "trafficPercentage": 100,
    "goal": "conversion",
    "status": "running"
  }'
```

#### PUT `/api/admin/ab-tests?id=exp_123`
停止或启动实验

```bash
curl -X PUT https://chinahuib2b.top/api/admin/ab-tests?id=exp_123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "stop"}'
```

---

## 📋 使用场景示例

### 场景 1: 测试不同的 CTA 文案

```tsx
// pages/index.tsx
import { useABTest } from '@/hooks/useABTest'

export default function HomePage() {
  const { variant, trackConversion } = useABTest('cta_text_test')
  
  const handleSignup = async () => {
    await trackConversion('signup')
    // Navigate to signup page
  }
  
  const ctaText = variant === 'control' 
    ? 'Sign Up Now' 
    : 'Start Your Free Trial'
  
  return (
    <section>
      <h1>Welcome to Our Platform</h1>
      <button onClick={handleSignup}>{ctaText}</button>
    </section>
  )
}
```

### 场景 2: 测试价格展示

```tsx
// components/PricingCard.tsx
import { useABTest } from '@/hooks/useABTest'

export default function PricingCard() {
  const { variant } = useABTest('pricing_display_test')
  
  const priceDisplay = variant === 'control' 
    ? '$99/month'
    : '$1,188/year (Save $96)'
  
  return (
    <div className="pricing-card">
      <h3>Pro Plan</h3>
      <p className="price">{priceDisplay}</p>
      <button>Subscribe</button>
    </div>
  )
}
```

### 场景 3: 测试产品页面布局

```tsx
// app/products/[id]/page.tsx
import { withABTest } from '@/hooks/useABTest'

function DefaultLayout({ product }) {
  return (
    <div>
      <ProductImage src={product.image} />
      <ProductInfo product={product} />
    </div>
  )
}

function AlternativeLayout({ product }) {
  return (
    <div className="grid grid-cols-2">
      <ProductImage src={product.image} />
      <ProductInfo product={product} />
    </div>
  )
}

const ProductPage = withABTest('product_layout_test', {
  control: DefaultLayout,
  variant_a: AlternativeLayout,
})

export default ProductPage
```

---

## 🎯 常见 A/B 测试想法

### 高影响力测试

1. **首页 Hero Section**
   - 标题文案
   - CTA 按钮颜色/文案
   - 背景图片 vs 视频

2. **产品详情页**
   - 图片画廊布局
   - "Add to Cart" 按钮位置
   - 价格展示方式

3. **结账流程**
   - 单页 vs 多步结账
   - 信任徽章位置
   - 运费显示时机

4. **注册表单**
   - 字段数量（少 vs 多）
   - 社交登录按钮位置
   - 表单验证提示

### 中等影响力测试

5. **导航栏**
   - 菜单项顺序
   - 搜索框位置
   - Logo 大小

6. **产品列表**
   - 网格 vs 列表视图默认
   - 排序选项位置
   - 过滤器展开/折叠

7. **邮件营销**
   - 发送时间
   - 主题行风格
   - CTA 位置

---

## 📊 解读结果

### 统计显著性

```typescript
const results = await getExperimentResults('experiment_id')

console.log(`Statistical Significance: ${results.statisticalSignificance}%`)
console.log(`Winner: ${results.winner}`)

results.variants.forEach(variant => {
  console.log(`${variant.variantName}:`)
  console.log(`  Users: ${variant.users}`)
  console.log(`  Conversions: ${variant.conversions}`)
  console.log(`  Conversion Rate: ${variant.conversionRate.toFixed(2)}%`)
  console.log(`  Revenue: $${variant.revenue?.toFixed(2)}`)
})
```

### 决策规则

- **显著性 > 95%**: 可以确信有赢家，实施获胜方案
- **显著性 80-95%**: 可能有差异，继续收集数据
- **显著性 < 80%**: 差异不显著，可能需要更多流量或重新设计实验

---

## 🔧 最佳实践

### 1. 实验设计

✅ **DO**:
- 每次只测试一个变量
- 确保样本量足够（至少 100 用户/变体）
- 运行至少 1-2 周
- 考虑季节性因素

❌ **DON'T**:
- 同时测试多个变化
- 过早停止实验
- 忽略统计显著性
- 在小流量上运行

### 2. 命名规范

```typescript
// Good
'experiment_homepage_cta_text_2026q2'
'experiment_pricing_annual_vs_monthly'

// Bad
'test1'
'my_experiment'
```

### 3. 文档记录

为每个实验创建文档：
```markdown
## Experiment: Homepage CTA Text Test

**Hypothesis**: Changing "Sign Up" to "Start Free Trial" will increase conversions by 10%

**Variants**:
- Control: "Sign Up"
- Variant A: "Start Free Trial"

**Goal Metric**: Signup conversion rate

**Duration**: 2 weeks

**Traffic**: 100% of homepage visitors

**Results**: [Link to results]

**Learnings**: [Key insights]
```

---

## 🚀 快速开始

### Step 1: 创建实验

```bash
curl -X POST https://chinahuib2b.top/api/admin/ab-tests \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Homepage CTA Test",
    "variants": [
      {"id": "control", "name": "Control", "weight": 50},
      {"id": "variant_a", "name": "Variant A", "weight": 50}
    ],
    "trafficPercentage": 100,
    "goal": "conversion",
    "status": "running"
  }'
```

### Step 2: 在组件中使用

```tsx
import { useABTest } from '@/hooks/useABTest'

function MyComponent() {
  const { variant, trackConversion } = useABTest('homepage_cta_test')
  
  return (
    <button onClick={() => trackConversion('click')}>
      {variant === 'control' ? 'Sign Up' : 'Start Free Trial'}
    </button>
  )
}
```

### Step 3: 监控结果

访问 `/api/admin/ab-tests?id=YOUR_EXPERIMENT_ID` 查看实时结果。

---

## 📈 进阶功能

### 自定义目标指标

```typescript
// Track revenue
await trackConversion(userId, experimentId, 'revenue', 99.99)

// Track page views
await trackConversion(userId, experimentId, 'page_view')

// Track custom events
await trackConversion(userId, experimentId, 'conversion', undefined, {
  customField: 'value'
})
```

### 分段实验

```typescript
// Only show to 50% of traffic
{
  trafficPercentage: 50,
  // ...
}

// Time-limited experiment
{
  startDate: new Date('2026-06-01'),
  endDate: new Date('2026-06-15'),
  // ...
}
```

---

## 🛠️ 技术细节

### 数据存储

所有数据存储在 Redis 中：

- `abtest:experiment:{id}` - 实验配置
- `abtest:assignment:{userId}:{experimentId}` - 用户分配
- `abtest:stats:{experimentId}:users` - 用户计数
- `abtest:stats:{experimentId}:conversions:{eventType}` - 转化计数
- `abtest:stats:{experimentId}:revenue` - 收入统计
- `abtest:events:{experimentId}` - 最近事件列表

### 用户分配算法

使用一致性哈希确保：
1. 同一用户总是看到相同变体
2. 变体分布符合权重配置
3. 支持动态添加/移除用户

### 统计显著性计算

当前实现使用简化的卡方检验近似值。对于生产环境，建议使用专门的统计库如 `jstat` 或 `simple-statistics`。

---

## 📚 学习资源

- [Google Optimize Alternatives](https://www.optimizely.com/optimization-glossary/ab-testing/)
- [Statistical Significance Calculator](https://www.evanmiller.org/ab-testing/statistical-significance.html)
- [A/B Testing Best Practices](https://vwo.com/ab-testing/)
- [Conversion Rate Optimization](https://cxl.com/blog/ab-testing/)

---

## ✨ 总结

✅ **已完成**:
- 完整的 A/B 测试框架（316行核心代码）
- React Hook 和 HOC（107行）
- 管理 API（184行）
- Redis 后端存储
- 用户分配和转化跟踪
- 结果统计和显著性计算

🎯 **下一步**:
1. 创建 A/B 测试管理 UI
2. 集成统计库提高准确性
3. 添加导出功能（CSV/Excel）
4. 设置自动告警（当达到显著性时）

💡 **建议**:
- 从简单的 CTA 测试开始
- 每周运行 1-2 个实验
- 建立实验知识库
- 定期回顾和优化
