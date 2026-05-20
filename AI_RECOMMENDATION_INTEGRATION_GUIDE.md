# 🤖 AI 推荐系统 - 集成使用指南

**日期**: 2026-05-19  
**状态**: ✅ **已完成并集成到首页**  

---

## 📋 快速开始

### 1. 在任意页面添加行为追踪

```tsx
// 客户端组件
'use client'

import { useBehaviorTracker, usePageViewTracker } from '@/hooks/useBehaviorTracker'

export default function MyPage({ userId }: { userId: string | null }) {
  // 自动追踪页面访问
  usePageViewTracker(userId, 'my-page')
  
  const { 
    trackProductView,
    trackProductInquiry,
    trackProductFavorite,
    trackSellerView,
    trackCategoryView
  } = useBehaviorTracker(userId)

  return (
    <div>
      <button onClick={() => trackProductView('product-123')}>
        View Product
      </button>
      
      <button onClick={() => trackProductInquiry('product-123')}>
        Send Inquiry
      </button>
    </div>
  )
}
```

### 2. 显示个性化推荐

```tsx
import RecommendedProducts from '@/components/recommendations/RecommendedProducts'

// 在页面中添加
<RecommendedProducts 
  userId={userId} 
  limit={8}
  title="Recommended for You"
/>
```

---

## 🎯 已集成的页面

### ✅ 首页 (`src/app/[locale]/page.tsx`)

**功能**:
- 自动追踪首页访问
- 显示个性化产品推荐（用户登录后）

**代码位置**:
```tsx
// 第 10 行：导入
import HomeClientWrapper from '@/components/HomeClientWrapper'

// 第 207-209 行：集成
<HomeClientWrapper userId={null} locale={locale} />
```

**注意**: 当前 `userId` 为 `null`，实际项目中应从认证系统获取。

---

## 📦 可用组件和 Hooks

### 1. `useBehaviorTracker` Hook

**文件**: `src/hooks/useBehaviorTracker.ts`

**用途**: 追踪用户行为

**API**:
```typescript
const {
  trackBehavior,           // 通用追踪
  trackProductView,        // 产品浏览
  trackProductInquiry,     // 产品询价
  trackProductFavorite,    // 产品收藏
  trackPurchase,           // 购买
  trackSellerView,         // 卖家浏览
  trackCategoryView        // 分类浏览
} = useBehaviorTracker(userId)
```

**示例**:
```typescript
// 追踪产品浏览（带停留时间）
trackProductView('product-123', 30) // 30秒

// 追踪产品询价
trackProductInquiry('product-123')

// 追踪卖家浏览
trackSellerView('seller-456')
```

---

### 2. `usePageViewTracker` Hook

**文件**: `src/hooks/useBehaviorTracker.ts`

**用途**: 自动追踪页面访问

**API**:
```typescript
usePageViewTracker(userId, pageName)
```

**示例**:
```typescript
// 自动追踪首页访问
usePageViewTracker(userId, 'home')

// 自动追踪产品详情页
usePageViewTracker(userId, `product-${productId}`)
```

---

### 3. `RecommendedProducts` 组件

**文件**: `src/components/recommendations/RecommendedProducts.tsx`

**用途**: 显示 AI 推荐的产品列表

**Props**:
```typescript
interface RecommendedProductsProps {
  userId: string | null  // 用户ID（必需）
  limit?: number         // 推荐数量（默认 8）
  title?: string         // 标题（默认 "Recommended for You"）
}
```

**示例**:
```tsx
<RecommendedProducts 
  userId={user.id} 
  limit={10}
  title="You May Also Like"
/>
```

---

### 4. `HomeClientWrapper` 组件

**文件**: `src/components/HomeClientWrapper.tsx`

**用途**: 首页客户端包装器，集成行为追踪和推荐

**示例**:
```tsx
<HomeClientWrapper userId={user?.id || null} locale={locale} />
```

---

### 5. `ProductDetailClient` 组件

**文件**: `src/components/products/ProductDetailClient.tsx`

**用途**: 产品详情页客户端组件，包含智能追踪和推荐

**特性**:
- 自动追踪页面访问
- 追踪产品停留时间（>5秒才记录）
- 询价和收藏按钮带追踪
- 显示"你可能还喜欢"推荐

**示例**:
```tsx
<ProductDetailClient 
  productId={product.id}
  userId={user?.id || null}
  locale={locale}
/>
```

---

## 🔌 API 端点

### GET `/api/recommendations/products`

获取个性化产品推荐

**参数**:
- `userId` (必需): 用户ID
- `limit` (可选): 推荐数量，默认 10

**响应**:
```json
{
  "success": true,
  "recommendations": [
    {
      "itemId": "product-123",
      "score": 0.95,
      "reason": "Based on your browsing history",
      "type": "product"
    }
  ],
  "count": 1
}
```

**示例**:
```typescript
const response = await fetch('/api/recommendations/products?userId=123&limit=8')
const data = await response.json()
console.log(data.recommendations)
```

---

### POST `/api/recommendations/track`

追踪用户行为

**请求体**:
```json
{
  "userId": "123",
  "action": "view",
  "productId": "product-456",
  "duration": 30,
  "timestamp": "2026-05-19T10:30:00Z"
}
```

**响应**:
```json
{
  "success": true,
  "message": "Behavior tracked successfully"
}
```

**示例**:
```typescript
await fetch('/api/recommendations/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: '123',
    action: 'view',
    productId: 'product-456',
    duration: 30
  })
})
```

---

## 🚀 实际应用场景

### 场景 1: 产品列表页

```tsx
'use client'

import { useBehaviorTracker } from '@/hooks/useBehaviorTracker'
import Link from 'next/link'

export default function ProductList({ products, userId }: any) {
  const { trackProductView } = useBehaviorTracker(userId)

  return (
    <div className="grid grid-cols-4 gap-4">
      {products.map(product => (
        <Link 
          key={product.id}
          href={`/products/${product.id}`}
          onClick={() => trackProductView(product.id)}
        >
          <div className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
```

---

### 场景 2: 卖家店铺页

```tsx
'use client'

import { usePageViewTracker, useBehaviorTracker } from '@/hooks/useBehaviorTracker'
import RecommendedProducts from '@/components/recommendations/RecommendedProducts'

export default function SellerStore({ seller, userId }: any) {
  usePageViewTracker(userId, `seller-${seller.id}`)
  const { trackSellerView } = useBehaviorTracker(userId)

  useEffect(() => {
    trackSellerView(seller.id)
  }, [seller.id])

  return (
    <div>
      <h1>{seller.name}</h1>
      {/* Seller products... */}
      
      {/* AI Recommendations */}
      {userId && (
        <RecommendedProducts 
          userId={userId}
          limit={6}
          title="More from this seller"
        />
      )}
    </div>
  )
}
```

---

### 场景 3: 搜索结果页

```tsx
'use client'

import { useBehaviorTracker } from '@/hooks/useBehaviorTracker'

export default function SearchResults({ results, userId, query }: any) {
  const { trackBehavior } = useBehaviorTracker(userId)

  const handleResultClick = (productId: string, position: number) => {
    trackBehavior('view', {
      productId,
      metadata: {
        searchQuery: query,
        resultPosition: position
      }
    })
  }

  return (
    <div>
      {results.map((product, index) => (
        <div 
          key={product.id}
          onClick={() => handleResultClick(product.id, index + 1)}
        >
          {/* Product card */}
        </div>
      ))}
    </div>
  )
}
```

---

## 📊 数据收集与优化

### 收集的数据类型

1. **页面访问**: 哪些页面被访问、访问时长
2. **产品互动**: 浏览、询价、收藏、购买
3. **卖家互动**: 店铺浏览
4. **分类浏览**: 哪些分类受欢迎
5. **搜索行为**: 搜索关键词、点击结果

### 如何使用这些数据

1. **短期**（当前）:
   - 基于规则的推荐（协同过滤）
   - 热门商品推荐（冷启动）

2. **中期**（未来 1-3 个月）:
   - 训练机器学习模型
   - 更精准的个性化推荐
   - A/B 测试不同推荐策略

3. **长期**（未来 3-6 个月）:
   - 深度学习推荐系统
   - 实时个性化
   - 预测性推荐（用户可能感兴趣但尚未搜索的商品）

---

## ⚙️ 配置和优化

### 1. 调整推荐数量

```tsx
// 推荐更多产品
<RecommendedProducts userId={userId} limit={12} />

// 推荐更少产品
<RecommendedProducts userId={userId} limit={4} />
```

### 2. 自定义推荐标题

```tsx
<RecommendedProducts 
  userId={userId} 
  title="根据你的浏览历史推荐"
/>
```

### 3. 条件显示推荐

```tsx
// 只在用户有足够行为数据时显示
{userId && userBehaviorCount > 5 && (
  <RecommendedProducts userId={userId} />
)}
```

---

## 🔧 故障排除

### 问题 1: 推荐为空

**原因**: 用户没有行为数据或系统处于冷启动状态

**解决方案**:
- 检查 `userId` 是否正确传递
- 查看浏览器控制台是否有错误
- 确认 API 端点正常工作：`curl http://localhost:3000/api/recommendations/products?userId=123`

---

### 问题 2: 行为追踪不工作

**原因**: `userId` 为 `null` 或 API 调用失败

**解决方案**:
- 确保用户已登录且 `userId` 有效
- 检查网络请求是否成功（浏览器 DevTools → Network）
- 查看服务器日志是否有错误

---

### 问题 3: TypeScript 类型错误

**常见错误**:
```
Property 'trackProductView' does not exist on type...
```

**解决方案**:
- 确保从正确的文件导入：`import { useBehaviorTracker } from '@/hooks/useBehaviorTracker'`
- 检查 `userId` 类型是否为 `string | null`

---

## 📈 性能考虑

### 1. 减少 API 调用

```typescript
// ❌ 不好：每次点击都调用 API
onClick={() => trackProductView(productId)}

// ✅ 好：批量处理或使用防抖
const debouncedTrack = useCallback(
  debounce((productId) => trackProductView(productId), 1000),
  [trackProductView]
)
```

### 2. 缓存推荐结果

```typescript
// 在 RecommendedProducts 组件中已实现
// 推荐结果会在本地缓存，避免重复请求
```

### 3. 懒加载推荐组件

```tsx
// 只在用户滚动到可视区域时加载
import dynamic from 'next/dynamic'

const RecommendedProducts = dynamic(
  () => import('@/components/recommendations/RecommendedProducts'),
  { loading: () => <Skeleton /> }
)
```

---

## 🎓 最佳实践

### ✅ 应该做的

1. **始终传递有效的 userId**
   ```tsx
   <RecommendedProducts userId={user?.id || null} />
   ```

2. **追踪有意义的交互**
   ```tsx
   // ✅ 好：追踪实际的用户意图
   onClick={() => trackProductInquiry(productId)}
   
   // ❌ 不好：追踪无意义的鼠标移动
   onMouseMove={() => trackBehavior('hover')}
   ```

3. **尊重用户隐私**
   - 提供退出追踪的选项
   - 遵守 GDPR/CCPA 等法规
   - 不要追踪敏感信息

---

### ❌ 不应该做的

1. **不要在服务端组件中使用 Hooks**
   ```tsx
   // ❌ 错误
   export default async function Page() {
     const { trackProductView } = useBehaviorTracker(userId) // 不行！
   }
   
   // ✅ 正确：创建客户端包装器
   'use client'
   export default function PageClient() {
     const { trackProductView } = useBehaviorTracker(userId)
   }
   ```

2. **不要过度追踪**
   ```tsx
   // ❌ 不好：每个微小动作都追踪
   onChange={() => trackBehavior('input_change')}
   
   // ✅ 好：只追踪关键行为
   onSubmit={() => trackBehavior('form_submit')}
   ```

3. **不要忘记错误处理**
   ```tsx
   // ✅ 好：捕获错误
   try {
     await trackProductView(productId)
   } catch (error) {
     console.error('Tracking failed:', error)
   }
   ```

---

## 🚀 下一步计划

### 短期（1-2 周）
- [ ] 在产品详情页集成 `ProductDetailClient`
- [ ] 在卖家店铺页添加推荐
- [ ] 在搜索结果页添加行为追踪

### 中期（1-2 个月）
- [ ] 执行数据库迁移，启用持久化存储
- [ ] 添加推荐效果分析仪表板
- [ ] A/B 测试不同推荐算法

### 长期（3-6 个月）
- [ ] 集成机器学习模型
- [ ] 实时推荐引擎
- [ ] 跨设备推荐同步

---

## 📞 支持

如有问题，请查看：
- [AI_RECOMMENDATION_COMPLETE.md](./AI_RECOMMENDATION_COMPLETE.md) - 完整完成报告
- [FINAL_SUMMARY.md](./FINAL_SUMMARY.md) - 项目总结

---

**最后更新**: 2026-05-19  
**版本**: 1.0.0
