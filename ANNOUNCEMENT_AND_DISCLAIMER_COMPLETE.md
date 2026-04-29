# 轮播公告和免责声明弹窗 - 功能说明

## ✅ 已完成的功能

### 1. 顶部轮播公告（不可关闭）

**位置**：页面最顶部  
**样式**：单行从右向左滑动（marquee 动画）  
**语言支持**：13 种语言自动切换  

**显示内容**（英文示例）：
```
Connecting global buyers and sellers, start from "discovery" | 
We are a B2B platform founded by Chinese entrepreneurs | 
We believe every merchant should have the opportunity to showcase their factory, brand, and goods to the world | 
This platform is only used for supply and demand information display and matching
```

**中文内容**：
```
连接全球买卖双方，从"发现"开始 | 
我们是一个由中国创业者初创的B2B平台 | 
我们相信：每个商家或个人，都应该有一个向世界展示工厂、品牌与货物的机会 | 
本平台仅用于供需信息展示与撮合，不提供交易担保
```

### 2. 免责声明弹窗（首次访问显示）

**触发条件**：
- 用户首次访问网站时自动弹出
- 使用 `sessionStorage` 存储状态
- **同一会话期间只显示一次**
- 关闭浏览器后重新打开会再次显示

**弹窗内容**：
- 标题：重要声明 / Important Notice
- 完整免责声明文本
- "我知道了" / "I Understand" 按钮

**多语言支持**：
- 中文 (zh)
- 英文 (en)
- 日文 (ja)
- 其他语言可扩展

---

## 📋 技术实现

### 组件文件

1. **AnnouncementBar.tsx**
   - 路径：`src/components/AnnouncementBar.tsx`
   - 功能：顶部轮播公告
   - 特点：
     - 使用 CSS marquee 动画
     - 从右向左持续滚动
     - 不可关闭
     - 支持 13 种语言

2. **DisclaimerModal.tsx**
   - 路径：`src/components/DisclaimerModal.tsx`
   - 功能：免责声明弹窗
   - 特点：
     - 首次访问自动显示
     - sessionStorage 控制显示频率
     - 点击"我知道了"后关闭
     - 支持多语言

### 集成位置

#### 主首页
- 文件：`src/app/(main)/page.tsx`
- 已集成两个组件

#### 多语言首页
- 文件：`src/app/[locale]/page.tsx`
- 已集成两个组件
- 支持所有 13 种语言版本

---

## 🎨 样式说明

### 轮播公告样式
```css
.bg-blue-600          /* 蓝色背景 */
.text-white           /* 白色文字 */
.overflow-hidden      /* 隐藏溢出内容 */
.whitespace-nowrap    /* 不换行 */
.animate-marquee      /* 从右向左滚动动画 */
```

### 弹窗样式
```css
.fixed inset-0        /* 全屏覆盖 */
.bg-black bg-opacity-50  /* 半透明黑色背景 */
.z-50                 /* 最高层级 */
.max-w-2xl            /* 最大宽度 */
.max-h-[80vh]         /* 最大高度 80% 视口 */
.overflow-y-auto      /* 垂直滚动 */
```

---

## 🔍 测试方法

### 测试轮播公告

1. **访问任意页面**
   ```
   https://chinahuib2b.top/
   https://chinahuib2b.top/en
   https://chinahuib2b.top/zh
   ```

2. **验证要点**
   - ✅ 蓝色条出现在页面最顶部
   - ✅ 文字从右向左持续滚动
   - ✅ 无法关闭或隐藏
   - ✅ 切换语言后文字相应变化

### 测试免责声明弹窗

1. **首次访问测试**
   ```
   1. 打开无痕浏览器窗口
   2. 访问：https://chinahuib2b.top/en
   3. 应该立即看到弹窗
   ```

2. **关闭后测试**
   ```
   1. 点击"我知道了"按钮
   2. 弹窗应该关闭
   3. 刷新页面，弹窗不应再出现（同一会话）
   ```

3. **新会话测试**
   ```
   1. 关闭浏览器
   2. 重新打开浏览器
   3. 访问网站
   4. 弹窗应该再次出现
   ```

4. **多语言测试**
   ```
   1. 切换到不同语言
   2. 清除 sessionStorage
   3. 刷新页面
   4. 弹窗内容应该是对应语言
   ```

---

## 🛠️ 清除 sessionStorage 测试方法

### 浏览器控制台
```javascript
// 清除免责声明标记
sessionStorage.removeItem('has_seen_disclaimer_session')

// 或者清除所有 sessionStorage
sessionStorage.clear()

// 然后刷新页面，弹窗会再次出现
location.reload()
```

### Chrome DevTools
1. 按 F12 打开开发者工具
2. 切换到 "Application" 标签
3. 左侧选择 "Session Storage"
4. 找到 `has_seen_disclaimer_session`
5. 右键删除或清空

---

## 📝 平台说明

**本平台定位**：
- ✅ B2B 信息展示与撮合平台
- ✅ 商家充值购买展位费用
- ❌ 不提供买卖双方交易功能
- ❌ 不提供合同签订功能
- ❌ 不提供交易担保

**免责声明重点**：
1. 平台仅用于信息展示
2. 不验证买卖双方真实性
3. 不担保任何合同或交易
4. 建议采用安全交易方式（信用证、第三方担保等）
5. 正在努力构建更安全的交易环境

---

## 🌐 支持的语言列表

| 语言代码 | 语言名称 | 状态 |
|---------|---------|------|
| zh | 中文 | ✅ |
| en | English | ✅ |
| ja | 日本語 | ✅ |
| ar | العربية | ✅ |
| es | Español | ✅ |
| fr | Français | ✅ |
| de | Deutsch | ✅ |
| ko | 한국어 | ✅ |
| ru | Русский | ✅ |
| pt | Português | ✅ |
| hi | हिन्दी | ✅ |
| th | ไทย | ✅ |
| vi | Tiếng Việt | ✅ |

---

## ⚠️ 注意事项

1. **轮播公告**
   - 始终显示，不可关闭
   - 文字较长，确保完整显示
   - 动画流畅，不影响用户体验

2. **免责声明弹窗**
   - 仅在首次访问时显示
   - 使用 sessionStorage（非 localStorage）
   - 关闭浏览器后会重置
   - 不会干扰用户浏览体验

3. **多语言**
   - 根据 URL 路径自动检测语言
   - `/en` → 英文
   - `/zh` → 中文
   - 其他语言类似

4. **SEO 友好**
   - 不影响搜索引擎抓取
   - 弹窗内容对 SEO 无负面影响
   - 轮播文字包含关键词

---

## 🎯 完成状态

✅ **所有功能已完成并部署**

- [x] 轮播公告组件创建
- [x] 免责声明弹窗组件创建
- [x] 13 种语言翻译完成
- [x] 集成到主首页
- [x] 集成到多语言首页
- [x] 部署到生产服务器
- [x] 功能测试通过

---

**最后更新**：2026-04-29
