# 🚀 部署指南 - 更新通知系统

## 系统概述

更新通知系统会自动检测新版本并通知用户刷新页面，确保用户始终使用最新版本。

## 核心功能

### ✅ 自动版本检测
- 每5分钟自动检查一次新版本
- 支持12种语言的多语言通知
- 智能缓存避免重复提醒

### ✅ 更新类型分级
- **Major (大版本)**: 强制更新，30分钟后自动刷新
- **Minor (小版本)**: 建议更新，用户可选择稍后提醒
- **Patch (补丁)**: 可选更新，2小时内不再提醒
- **Hotfix (热修复)**: 安全更新，建议立即刷新

### ✅ 用户友好体验
- 显示详细的更新日志
- 倒计时提示自动刷新时间
- 优雅的动画效果
- 支持"稍后提醒"功能

## 部署流程

### 1. 更新版本号

```bash
# 小版本更新 (修复bug)
npm run version:patch

# 小版本更新 (新功能)
npm run version:minor

# 大版本更新 (重大变更)
npm run version:major
```

### 2. 更新更新日志

编辑 `/src/app/api/version/route.ts` 中的 `changelog` 数组：

```typescript
const changelog: ChangelogEntry[] = [
  {
    version: "1.0.2",
    date: "2026-05-30",
    type: "patch", // major | minor | patch | hotfix
    title: {
      zh: "修复支付问题",
      en: "Fixed payment issues",
      ja: "支払い問題を修正",
      // ... 其他语言
    },
    changes: {
      fixed: {
        zh: ["修复支付宝支付失败问题", "优化订单状态同步"],
        en: ["Fixed Alipay payment failure", "Improved order status sync"],
        // ... 其他语言
      },
      added: {
        zh: ["新增订单导出功能"],
        en: ["Added order export feature"],
        // ... 其他语言
      }
    }
  },
  // ... 更多版本
]
```

### 3. 构建并部署

```bash
# 构建项目
npm run build

# 部署到服务器
# (根据您的部署方式执行)
```

## 工作流程

### 用户视角

1. **检测更新**: 系统每5分钟自动检查
2. **显示通知**: 发现新版本时弹出通知
3. **查看详情**: 用户可查看更新内容
4. **选择操作**:
   - 点击"立即更新" → 立即刷新页面
   - 点击"稍后提醒" → 2小时后再次提醒
   - 关闭通知 → 下次检查时再次提醒

### 强制更新场景

当发布 **Major (大版本)** 更新时：
- 用户无法关闭通知
- 显示30分钟倒计时
- 倒计时结束后自动刷新
- 适用于重大功能变更或安全更新

## 配置文件

### 版本配置

文件: `/src/lib/version.ts`

```typescript
export const VERSION_CONFIG = {
  CHECK_INTERVAL: 5 * 60 * 1000,      // 检查间隔: 5分钟
  AUTO_REFRESH_DELAY: 30 * 60 * 1000,  // 自动刷新延迟: 30分钟
}
```

### 环境变量

文件: `.env.local` (自动生成)

```bash
NEXT_PUBLIC_APP_VERSION=1.0.1
NEXT_PUBLIC_BUILD_TIMESTAMP=1751203200000
```

## API 接口

### GET /api/version

获取当前版本信息

**Query Parameters:**
- `currentVersion`: 客户端当前版本

**Response:**
```json
{
  "version": "1.0.1",
  "buildTimestamp": "1751203200000",
  "changelog": [...],
  "forceUpdate": false,
  "autoRefreshAt": "2026-05-30T12:30:00.000Z"
}
```

## 最佳实践

### 1. 版本号规范

使用语义化版本控制 (SemVer):
- `MAJOR.MINOR.PATCH`
- Major: 不兼容的 API 修改
- Minor: 向下兼容的功能新增
- Patch: 向下兼容的问题修复

### 2. 更新日志编写

- 使用用户友好的语言描述
- 突出显示修复的问题
- 说明新增的功能
- 提供所有支持语言的翻译

### 3. 部署时机

- **Patch**: 随时部署，用户可选择更新
- **Minor**: 建议在工作时间外部署
- **Major**: 提前通知用户，选择低峰期部署

### 4. 测试建议

部署前测试：
```bash
# 1. 更新版本
npm run version:patch

# 2. 本地测试
npm run dev

# 3. 验证更新通知正常显示
# 4. 验证多语言切换正常
# 5. 验证自动刷新功能
```

## 故障排除

### 用户未收到更新通知

1. 检查浏览器控制台是否有错误
2. 验证 `/api/version` 接口返回正确
3. 检查 localStorage 是否被清除

### 更新通知重复显示

1. 检查 `UPDATE_SHOWN` 是否正确存储
2. 验证版本号是否正确更新

### 自动刷新不生效

1. 检查 `forceUpdate` 是否为 true
2. 验证 `autoRefreshAt` 时间格式正确
3. 检查浏览器是否支持 setInterval

## 安全考虑

- 强制更新用于安全补丁
- 用户数据在刷新前自动保存
- 支持页面恢复机制
