# 🧪 单元测试指南

## ✅ 已完成的测试基础设施

### 1. 测试框架安装

**安装的依赖**:
- `jest` - 测试运行器
- `@testing-library/react` - React 组件测试
- `@testing-library/jest-dom` - DOM 匹配器
- `@testing-library/user-event` - 用户交互模拟
- `jest-environment-jsdom` - JSDOM 环境
- `ts-jest` - TypeScript 支持
- `identity-obj-proxy` - CSS 模块 mock

### 2. 配置文件

**Jest 配置**: `jest.config.ts`
- Next.js 集成
- TypeScript 支持
- 模块别名映射 (`@/` → `src/`)
- 覆盖率收集配置
- 目标覆盖率: 60% (可调整到 80%)

**Jest 设置**: `jest.setup.ts`
- `@testing-library/jest-dom` 导入
- Next.js router mock
- next-auth mock
- Web API polyfills (Request, Response, Headers)

### 3. 测试脚本

```bash
# 运行所有测试
npm test

# 监视模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

---

## 📝 已创建的测试

### 1. 工具函数测试
**文件**: `src/lib/__tests__/utils.test.ts`

测试的函数:
- `formatPrice()` - 货币格式化
- `validateEmail()` - 邮箱验证
- `sanitizeInput()` - 输入清理

### 2. 速率限制器测试
**文件**: `src/lib/__tests__/rate-limiter.test.ts`

测试的功能:
- Redis 速率限制逻辑
- 预定义配置验证
- 错误处理（fail-open）

### 3. 健康检查 API 测试
**文件**: `src/app/api/health/__tests__/route.test.ts`

测试的场景:
- 所有服务正常
- 数据库故障
- Redis 故障
- 响应数据完整性

### 4. 组件测试
**文件**: `src/components/__tests__/AnnouncementBar.test.tsx`

测试的内容:
- 组件渲染
- CSS 类验证

---

## 🎯 如何编写测试

### 测试工具函数

```typescript
// src/lib/__tests__/my-function.test.ts
import { myFunction } from '../my-function'

describe('myFunction', () => {
  it('should work correctly', () => {
    expect(myFunction(input)).toBe(expectedOutput)
  })
})
```

### 测试 React 组件

```typescript
// src/components/__tests__/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle click', () => {
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### 测试 API 路由

```typescript
// src/app/api/my-api/__tests__/route.test.ts
import { GET } from '../route'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: { findMany: jest.fn() }
}))

describe('My API', () => {
  it('should return data', async () => {
    const response = await GET()
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toBeDefined()
  })
})
```

---

## 📊 提高覆盖率的策略

### 当前状态
- 目标覆盖率: 60% → 80%
- 重点测试领域:
  1. ✅ 工具函数 (utils)
  2. ✅ 速率限制器 (rate-limiter)
  3. ✅ API 路由 (health check)
  4. ⏳ React 组件
  5. ⏳ 认证逻辑
  6. ⏳ 数据库操作

### 建议的测试优先级

**高优先级** (核心功能):
1. 认证和授权 (`auth.ts`)
2. API 安全包装器 (`api-security.ts`)
3. 监控和错误追踪 (`monitoring.ts`)
4. 产品相关 API

**中优先级** (业务逻辑):
1. 卖家仪表板组件
2. 产品管理组件
3. 聊天系统集成
4. 文件上传功能

**低优先级** (UI 组件):
1. 导航栏
2. 页脚
3. 布局组件
4. 样式组件

---

## 🔧 常见问题

### Q: 测试失败 "Cannot find module"
**A**: 检查 `jest.config.ts` 中的 `moduleNameMapper` 配置是否正确。

### Q: 如何 mock Next.js hooks?
**A**: 已在 `jest.setup.ts` 中全局 mock，如需自定义：
```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}))
```

### Q: 如何测试异步代码?
**A**: 使用 `async/await`:
```typescript
it('should work async', async () => {
  const result = await asyncFunction()
  expect(result).toBe(expected)
})
```

### Q: 如何跳过某些测试?
**A**: 使用 `.skip` 或 `.only`:
```typescript
describe.skip('Skipped suite', () => {})
it.only('Only this test', () => {})
```

---

## 🚀 下一步

1. **增加更多组件测试** - 目标: 所有主要组件
2. **测试 API 路由** - 目标: 所有 `/api/*` 端点
3. **集成测试** - E2E 测试使用 Playwright 或 Cypress
4. **CI/CD 集成** - 在 GitHub Actions 中自动运行测试

---

## 📈 覆盖率目标

| 阶段 | 目标 | 说明 |
|------|------|------|
| Phase 1 | 40% | 核心工具函数和 API |
| Phase 2 | 60% | 主要组件和业务逻辑 |
| Phase 3 | 80% | 全面覆盖 |

**当前进度**: ~30% (估计)
**下一阶段目标**: 60%
