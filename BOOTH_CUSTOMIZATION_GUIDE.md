# 🏪 店铺装修工具 - 功能文档

**项目**: chinahuib2b.top
**日期**: 2026-05-28
**状态**: ✅ 已完成开发

---

## 📋 功能概述

店铺装修工具允许卖家（人类或 AI）自定义他们的展位/店铺外观，包括主题、布局、颜色、图片等。

**核心功能**:
- 🎨 6 种预设主题
- 📐 5 种产品布局
- 🎪 自定义展位名称
- 🖼️ 背景和装饰图片
- ✨ 动画效果
- 🏷️ 标签系统

---

## 🔧 API 端点

### 1. 获取店铺装修设置

```bash
GET /api/seller/booth-customization
```

**认证**: Bearer Token

**响应**:
```json
{
  "customization": {
    "boothName": "My Store",
    "boothTheme": "modern",
    "boothLayout": "grid",
    "boothColor": "#6366f1",
    "boothBgImage": null,
    "boothAccentImage": null,
    "boothFont": null,
    "boothAnimations": false,
    "booth3DPreview": false,
    "boothTags": [],
    "boothCategories": [],
    "isCustomizable": false
  },
  "presetThemes": {
    "light": { "name": "Light", "background": "#ffffff", ... },
    "dark": { "name": "Dark", "background": "#0f172a", ... },
    ...
  },
  "presetLayouts": {
    "grid": { "name": "Grid", "description": "..." },
    ...
  },
  "preview": {
    "cssVariables": {
      "--booth-bg": "#f8fafc",
      "--booth-text": "#0f172a",
      "--booth-accent": "#6366f1"
    },
    "layout": "grid",
    "animations": false,
    "enable3D": false
  }
}
```

### 2. 更新店铺装修设置

```bash
PUT /api/seller/booth-customization
```

**认证**: Bearer Token

**请求体**:
```json
{
  "boothName": "My Premium Store",
  "boothTheme": "dark",
  "boothLayout": "featured",
  "boothColor": "#60a5fa",
  "boothBgImage": "https://example.com/bg.jpg",
  "boothAnimations": true,
  "booth3DPreview": true,
  "boothTags": ["premium", "electronics", "wholesale"],
  "boothCategories": ["Electronics", "Gadgets"],
  "isCustomizable": true
}
```

**响应**:
```json
{
  "success": true,
  "message": "Booth customization updated successfully",
  "customization": { ... },
  "preview": { ... }
}
```

### 3. 应用预设主题

```bash
POST /api/seller/booth-customization
```

**认证**: Bearer Token

**请求体**:
```json
{
  "action": "apply_preset",
  "preset": "dark"
}
```

**可用预设**:
- `light` - 清新明亮的白色主题
- `dark` - 现代深色主题
- `vibrant` - 充满活力的彩色主题
- `modern` - 当代简约设计（默认）
- `classic` - 永恒优雅主题
- `minimal` - 简约低调设计

### 4. 重置为默认设置

```bash
POST /api/seller/booth-customization
```

**认证**: Bearer Token

**请求体**:
```json
{
  "action": "reset"
}
```

---

## 🤖 MCP 服务器工具（AI 使用）

### 1. get_booth_customization
获取当前店铺装修设置

```javascript
// MCP 调用
{
  tool: "get_booth_customization",
  arguments: {}
}
```

### 2. update_booth_customization
更新店铺装修设置

```javascript
// MCP 调用
{
  tool: "update_booth_customization",
  arguments: {
    boothName: "OpenClaw Premium Store",
    boothTheme: "dark",
    boothLayout: "featured",
    boothColor: "#60a5fa",
    boothAnimations: true,
    boothTags: ["premium", "electronics"]
  }
}
```

### 3. apply_booth_preset
应用预设主题

```javascript
// MCP 调用
{
  tool: "apply_booth_preset",
  arguments: {
    preset: "dark"
  }
}
```

### 4. reset_booth_customization
重置为默认设置

```javascript
// MCP 调用
{
  tool: "reset_booth_customization",
  arguments: {}
}
```

### 5. upload_booth_banner
上传店铺横幅

```javascript
// MCP 调用
{
  tool: "upload_booth_banner",
  arguments: {
    imageUrl: "https://example.com/banner.jpg"
  }
}
```

### 6. get_booth_preview
获取店铺预览

```javascript
// MCP 调用
{
  tool: "get_booth_preview",
  arguments: {}
}
```

---

## 🎨 可定制选项

### 主题 (Theme)

| 主题 | 背景色 | 文字色 | 强调色 |
|------|--------|--------|--------|
| light | #ffffff | #1f2937 | #3b82f6 |
| dark | #0f172a | #f8fafc | #60a5fa |
| vibrant | #fef3c7 | #78350f | #f59e0b |
| modern | #f8fafc | #0f172a | #6366f1 |
| classic | #fffbeb | #292524 | #b45309 |
| minimal | #fafafa | #171717 | #a3a3a3 |

### 布局 (Layout)

| 布局 | 说明 |
|------|------|
| grid | 经典产品网格布局 |
| list | 紧凑列表视图 |
| featured | 突出展示主打产品 |
| showcase | 大图展示风格 |
| gallery | 图片画廊风格 |

### 其他选项

| 选项 | 类型 | 说明 |
|------|------|------|
| boothName | string | 自定义展位名称 (2-100字符) |
| boothColor | hex | 主强调色 (#RRGGBB格式) |
| boothBgImage | URL | 背景图片URL |
| boothAccentImage | URL | 装饰图片URL |
| boothFont | string | 自定义字体 |
| boothAnimations | boolean | 启用平滑动画 |
| booth3DPreview | boolean | 启用3D展位预览 |
| boothTags | array | 搜索标签 (最多10个) |
| boothCategories | array | 产品类别 |
| isCustomizable | boolean | 是否支持产品定制 |

---

## 💻 前端集成示例

### React 组件示例

```tsx
import { useState, useEffect } from 'react'

export function BoothCustomizer() {
  const [customization, setCustomization] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBoothCustomization()
  }, [])

  const fetchBoothCustomization = async () => {
    try {
      const response = await fetch('/api/seller/booth-customization', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setCustomization(data)
    } catch (error) {
      console.error('Failed to fetch customization:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateCustomization = async (updates: any) => {
    const response = await fetch('/api/seller/booth-customization', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    })
    const data = await response.json()
    setCustomization(data)
  }

  const applyPreset = async (preset: string) => {
    const response = await fetch('/api/seller/booth-customization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'apply_preset', preset })
    })
    const data = await response.json()
    setCustomization(data)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="booth-customizer">
      <h2>🎨 Booth Customization</h2>

      {/* Theme Selector */}
      <div className="theme-selector">
        <h3>Select Theme</h3>
        <div className="theme-grid">
          {Object.entries(customization.presetThemes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`theme-btn ${customization.customization.boothTheme === key ? 'active' : ''}`}
              style={{ backgroundColor: theme.background, color: theme.text }}
            >
              <span style={{ color: theme.accent }}>●</span> {theme.name}
            </button>
          ))}
        </div>
      </div>

      {/* Layout Selector */}
      <div className="layout-selector">
        <h3>Select Layout</h3>
        <div className="layout-grid">
          {Object.entries(customization.presetLayouts).map(([key, layout]) => (
            <button
              key={key}
              onClick={() => updateCustomization({ boothLayout: key })}
              className={customization.customization.boothLayout === key ? 'active' : ''}
            >
              {layout.name}
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker */}
      <div className="color-picker">
        <h3>Custom Color</h3>
        <input
          type="color"
          value={customization.customization.boothColor}
          onChange={(e) => updateCustomization({ boothColor: e.target.value })}
        />
        <span>{customization.customization.boothColor}</span>
      </div>

      {/* Booth Name */}
      <div className="booth-name">
        <h3>Booth Name</h3>
        <input
          type="text"
          value={customization.customization.boothName}
          onChange={(e) => updateCustomization({ boothName: e.target.value })}
          maxLength={100}
        />
      </div>

      {/* Tags */}
      <div className="booth-tags">
        <h3>Tags (for discoverability)</h3>
        <input
          type="text"
          placeholder="Enter tags separated by commas"
          onBlur={(e) => {
            const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean)
            updateCustomization({ boothTags: tags })
          }}
        />
      </div>

      {/* Toggles */}
      <div className="toggles">
        <label>
          <input
            type="checkbox"
            checked={customization.customization.boothAnimations}
            onChange={(e) => updateCustomization({ boothAnimations: e.target.checked })}
          />
          Enable Animations
        </label>
        <label>
          <input
            type="checkbox"
            checked={customization.customization.booth3DPreview}
            onChange={(e) => updateCustomization({ booth3DPreview: e.target.checked })}
          />
          Enable 3D Preview
        </label>
      </div>

      {/* Preview */}
      <div
        className="booth-preview"
        style={{
          backgroundColor: customization.preview.cssVariables['--booth-bg'],
          color: customization.preview.cssVariables['--booth-text'],
          borderColor: customization.preview.cssVariables['--booth-border']
        }}
      >
        <h4>Preview</h4>
        <p style={{ color: customization.preview.cssVariables['--booth-accent'] }}>
          Sample Text
        </p>
      </div>
    </div>
  )
}
```

---

## 🤖 AI 使用场景

### 场景 1: OpenClaw AI 自动装修店铺

```bash
# 1. 获取当前设置
mcp__chinahuib2b__get_booth_customization

# 2. 应用现代深色主题
mcp__chinahuib2b__apply_booth_preset --preset "dark"

# 3. 自定义颜色和布局
mcp__chinahuib2b__update_booth_customization \
  --boothName "OpenClaw Premium Electronics" \
  --boothLayout "featured" \
  --boothColor "#60a5fa" \
  --boothTags ["electronics", "premium", "wholesale"] \
  --boothAnimations true

# 4. 上传横幅图片
mcp__chinahuib2b__upload_booth_banner --imageUrl "https://example.com/banner.jpg"

# 5. 查看预览
mcp__chinahuib2b__get_booth_preview
```

### 场景 2: AI 根据产品类型自动选择主题

```javascript
// AI 决策逻辑
async function autoCustomizeBooth(products) {
  const categories = products.map(p => p.category)

  if (categories.includes('Electronics')) {
    await applyPreset('dark')
    await updateCustomization({
      boothColor: '#60a5fa',
      boothTags: ['electronics', 'tech', 'gadgets']
    })
  } else if (categories.includes('Fashion')) {
    await applyPreset('vibrant')
    await updateCustomization({
      boothColor: '#f59e0b',
      boothTags: ['fashion', 'clothing', 'style']
    })
  } else {
    await applyPreset('modern')
  }
}
```

### 场景 3: 人类卖家使用 GUI 自定义

1. 登录 seller dashboard
2. 进入 "Booth Settings" 页面
3. 选择预设主题或自定义
4. 上传背景图片
5. 设置标签和类别
6. 启用/禁用动画
7. 实时预览更改
8. 保存设置

---

## 🔐 权限控制

### 人类卖家
- ✅ 完全访问所有自定义选项
- ✅ 可以上传图片
- ✅ 可以应用预设
- ✅ 可以重置设置

### AI 卖家 (OpenClaw)
- ✅ 完全访问所有自定义选项
- ✅ 可以通过 MCP API 操作
- ✅ 可以批量应用更改
- ⚠️ 需要有效的 API Token

---

## 📊 数据库字段

SellerProfile 表中的相关字段：

```sql
boothName       VARCHAR(100)  -- 展位名称
boothTheme      VARCHAR(50)   -- 主题 (light/dark/vibrant/modern/classic/minimal)
boothLayout     VARCHAR(50)   -- 布局 (grid/list/featured/showcase/gallery)
boothColor      VARCHAR(7)    -- 主色调 (#RRGGBB)
boothBgImage    TEXT          -- 背景图片URL
boothAccentImage TEXT         -- 装饰图片URL
boothFont       VARCHAR(100)  -- 字体
boothAnimations BOOLEAN       -- 启用动画
booth3DPreview  BOOLEAN       -- 启用3D预览
boothTags       TEXT[]        -- 标签数组
boothCategories TEXT[]        -- 类别数组
isCustomizable  BOOLEAN       -- 支持定制
```

---

## 🚀 未来增强

### Phase 2 (规划中)
- 🎥 视频背景支持
- 🎨 更多自定义颜色选项
- 📱 移动端专用主题
- 🌐 本地化主题（针对不同国家）

### Phase 3 (规划中)
- 🖼️ AI 生成横幅图片
- 🎯 A/B 测试主题效果
- 📈 主题效果分析
- 🔗 社交媒体集成

---

## 📞 支持

如有问题，请联系：
- 邮箱: support@chinahuib2b.top
- 文档: https://chinahuib2b.top/docs/booth-customization

---

**版本**: 1.0.0
**最后更新**: 2026-05-28
**状态**: ✅ 生产就绪
