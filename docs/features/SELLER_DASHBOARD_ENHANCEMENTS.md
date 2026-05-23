# Seller Dashboard 增强功能 - 语言、指南和初学者指引

## 📋 需求实现总结

### 7. Seller Dashboard 语言选择插件 ✅

**功能描述：**
为商家后台添加多语言支持，覆盖中国、东南亚、俄罗斯、中东等主要市场。

**实现细节：**

1. **LanguageSwitcher 集成**
   - 在 Seller Dashboard 顶部导航栏添加语言切换器
   - 位置：位于 "Help Guide" 链接左侧
   - 样式与主站保持一致

2. **支持的语言（13种）**
   - 🇨🇳 中文 (zh) - 主要商家群体
   - 🇺🇸 英文 (en) - 国际通用
   - 🇯🇵 日语 (ja) - 东亚市场
   - 🇰🇷 韩语 (ko) - 东亚市场
   - 🇹🇭 泰语 (th) - 东南亚
   - 🇻🇳 越南语 (vi) - 东南亚
   - 🇮🇩 印尼语（使用英文）- 东南亚
   - 🇲🇾 马来语（使用英文）- 东南亚
   - 🇷🇺 俄语 (ru) - 俄罗斯及独联体
   - 🇸🇦 阿拉伯语 (ar) - 中东
   - 🇪🇸 西班牙语 (es) - 拉美/西班牙
   - 🇫🇷 法语 (fr) - 法国/非洲
   - 🇩🇪 德语 (de) - 德国/欧洲
   - 🇵🇹 葡萄牙语 (pt) - 巴西/葡萄牙
   - 🇮🇳 印地语 (hi) - 印度

3. **技术实现**
   ```typescript
   // LanguageSwitcher 更新
   const switchLanguage = (locale: LanguageCode) => {
     const isDashboardRoute = pathname.startsWith('/seller') || pathname.startsWith('/admin')
     
     if (isDashboardRoute) {
       // 后台路由：设置 cookie 并刷新页面
       document.cookie = `language=${locale}; path=/; max-age=31536000`
       window.location.reload()
     } else {
       // 前台路由：替换 URL 中的语言前缀
       const newPathname = pathname.replace(/^\/[a-z]{2}/, `/${locale}`)
       router.push(newPathname)
     }
   }
   ```

4. **语言持久化**
   - 使用 cookie 存储语言偏好（有效期 1 年）
   - Seller Dashboard 从 cookie 读取语言
   - 切换语言后自动刷新页面应用新语言

---

### 7.1 商家操作说明书 ✅

**功能描述：**
提供详细的商家操作手册，帮助商家快速上手平台功能。

**页面路径：** `/seller/guide`

**内容结构：**

#### 1. 入门指南 (Getting Started)
- 欢迎信息
- 平台概述
- 快速开始步骤

#### 2. 店铺设置 (Store Setup)
```
1. 点击左侧菜单的 "Store" 选项
2. 填写您的公司信息
3. 上传公司 Logo（建议尺寸：200x200px）
4. 添加店铺头图（建议尺寸：1200x400px）
5. 编写公司简介和联系方式
```

#### 3. 产品管理 (Product Management)
```
1. 点击 "Products" > "Add Product"
2. 填写产品基本信息（名称、描述、价格）
3. 选择产品分类
4. 上传产品图片（最多 10 张，建议尺寸：800x800px）
5. 上传产品宣传册（PDF 格式）
6. 点击 "Publish" 发布产品
```

#### 4. 宣传册管理 (Brochure Management)
```
1. 在产品编辑页面找到 "Brochures" 部分
2. 点击 "Upload Brochure"
3. 选择 PDF 文件（最大 10MB）
4. 等待上传完成
5. 可以预览和删除已上传的宣传册
```

#### 5. 个人资料定制 (Profile Customization)
```
1. 点击 "Store" > "Customize Profile"
2. 选择展位主题颜色
3. 选择布局风格
4. 自定义展示字段
5. 预览并保存更改
```

#### 6. 账户设置 (Account Settings)
```
1. 点击右上角的用户名
2. 选择 "Account Settings"
3. 修改密码
4. 更新联系信息
5. 设置通知偏好
```

#### 7. 快速提示 (Quick Tips)
- 💡 定期更新产品信息以保持竞争力
- 💡 使用高质量的产品图片吸引更多买家
- 💡 及时回复买家咨询以提高转化率

**多语言支持：**
- 所有文本都支持 13 种语言
- 根据用户的语言偏好自动显示对应语言
- 使用条件判断实现翻译

**UI 设计：**
- 清晰的章节划分
- 每个章节配有图标
- 步骤化的操作说明
- 返回仪表板的快捷链接

---

### 7.2 初学者指引系统（游戏化任务引导）✅

**功能描述：**
类似游戏的任务引导系统，左侧悬浮任务栏，指导新用户完成关键设置步骤。

**组件：** `OnboardingGuide.tsx`

**核心特性：**

#### 1. 5 个引导任务

**任务 1：完善资料 (Complete Your Profile)**
- 描述：添加公司信息、Logo 和联系方式以建立买家信任
- 目标：引导用户访问 Store 设置页面

**任务 2：添加首个产品 (Add Your First Product)**
- 描述：创建第一个产品列表，包含图片、描述和价格
- 目标：引导用户访问 Products 页面

**任务 3：上传产品宣传册 (Upload Product Brochure)**
- 描述：添加 PDF 宣传册为潜在买家提供详细产品信息
- 目标：引导用户上传产品文档

**任务 4：定制店铺 (Customize Your Store)**
- 描述：选择展位主题颜色和布局，让您的店铺脱颖而出
- 目标：引导用户个性化店铺

**任务 5：发布所有产品 (Publish All Products)**
- 描述：确保所有产品都已发布并对买家可见
- 目标：引导用户完成产品发布流程

#### 2. 游戏化元素

**进度追踪：**
- 进度条显示完成百分比
- 实时统计已完成任务数（例如：2 of 5 tasks completed）
- 视觉反馈（绿色勾选标记）

**任务状态：**
- ⚪ 未开始：灰色圆圈
- 🔵 进行中：蓝色高亮边框
- ✅ 已完成：绿色勾选 + 删除线

**交互设计：**
- 点击任务卡片查看详情
- "Mark Complete" 按钮手动标记完成
- Previous/Next 导航按钮
- 完成所有任务后显示祝贺消息 🎉

#### 3. 自动检测与持久化

**首次访问检测：**
```typescript
const hasSeenOnboarding = localStorage.getItem('seller_has_seen_onboarding')
if (!hasSeenOnboarding) {
  setShowOnboarding(true)  // 首次访问自动显示
}
```

**进度保存：**
```typescript
// 保存到 localStorage
localStorage.setItem('seller_onboarding_progress', JSON.stringify(progress))

// 从 localStorage 加载
const savedProgress = localStorage.getItem('seller_onboarding_progress')
```

**任务完成检测：**
- 当前版本：用户手动标记完成
- 未来优化：可以自动检测实际完成情况
  - 检查是否有店铺信息
  - 检查是否有产品
  - 检查是否有宣传册
  - 等等...

#### 4. UI/UX 设计

**悬浮任务栏：**
- 位置：左侧固定（left: 4, top: 20）
- 宽度：320px (w-80)
- 最大高度：视口高度减去顶部导航
- 可滚动内容区域

**折叠模式：**
- 点击 X 按钮折叠为浮动帮助按钮
- 浮动按钮位置：左下角（left: 4, bottom: 4）
- 点击浮动按钮重新展开

**视觉设计：**
- 渐变色标题栏（蓝色到靛蓝）
- 清晰的进度指示
- 任务卡片悬停效果
- 平滑过渡动画

**响应式设计：**
- 固定定位，不随页面滚动
- z-index: 50，确保在最上层
- 不影响主内容布局

---

## 🎯 用户体验流程

### 场景 1：新用户首次访问

```
1. 新用户登录并访问 /seller
2. 检测到 localStorage 中没有 onboarding 记录
3. 自动显示左侧悬浮任务栏
4. 用户看到 5 个引导任务
5. 点击任务查看详细说明
6. 完成任务后点击 "Mark Complete"
7. 进度条实时更新
8. 完成所有任务后显示祝贺消息
9. 关闭任务栏，localStorage 记录已显示过
```

### 场景 2：老用户重新访问

```
1. 老用户访问 /seller
2. localStorage 中有 onboarding 记录
3. 不自动显示任务栏
4. 左下角显示浮动帮助按钮
5. 用户可以随时点击按钮重新打开任务栏
6. 可以看到之前的完成进度
```

### 场景 3：切换语言

```
1. 用户在 Seller Dashboard
2. 点击顶部的语言切换器
3. 选择 "中文"
4. 页面刷新
5. 所有内容（包括任务栏）显示为中文
6. 语言偏好保存到 cookie
```

### 场景 4：查看操作说明书

```
1. 用户点击顶部的 "Help Guide" 链接
2. 跳转到 /seller/guide
3. 看到详细的操作手册（6 个章节）
4. 可以根据需要查阅任何章节
5. 点击 "Back to Dashboard" 返回
```

---

## 🔧 技术实现

### 文件变更

#### 1. 新增文件

**`src/components/seller/OnboardingGuide.tsx`**
- 初学者指引组件
- 224 行代码
- 包含任务列表、进度追踪、导航控制

**`src/app/(dashboard)/seller/guide/page.tsx`**
- 商家操作说明书页面
- 172 行代码
- 支持多语言

#### 2. 修改文件

**`src/app/(dashboard)/seller/layout.tsx`**
- 添加 LanguageSwitcher 导入
- 添加 HelpCircle 图标导入
- 在顶部导航栏添加语言切换器和帮助链接

**`src/components/language/LanguageSwitcher.tsx`**
- 更新 switchLanguage 函数
- 检测是否为后台路由
- 后台路由使用 cookie + 刷新方式
- 前台路由使用 URL 替换方式

**`src/app/(dashboard)/seller/SellerDashboardClient.tsx`**
- 添加 OnboardingGuide 导入
- 添加 showOnboarding 状态
- 首次访问检测逻辑
- 渲染 OnboardingGuide 组件
- 添加浮动帮助按钮

---

### 关键代码片段

#### LanguageSwitcher 后台路由支持

```typescript
const switchLanguage = (locale: LanguageCode) => {
  const isDashboardRoute = pathname.startsWith('/seller') || pathname.startsWith('/admin')
  
  if (isDashboardRoute) {
    // For dashboard routes, just set the language cookie
    document.cookie = `language=${locale}; path=/; max-age=31536000`
    // Reload the page to apply the new language
    window.location.reload()
  } else {
    // For public routes, replace locale in pathname
    const newPathname = pathname.replace(/^\/[a-z]{2}/, `/${locale}`)
    router.push(newPathname)
  }
  
  setIsOpen(false)
}
```

#### Onboarding Guide 进度管理

```typescript
// Load progress from localStorage
useEffect(() => {
  const savedProgress = localStorage.getItem('seller_onboarding_progress')
  if (savedProgress) {
    const progress = JSON.parse(savedProgress)
    setTasks(prevTasks => 
      prevTasks.map(task => ({
        ...task,
        completed: progress[task.id] || false
      }))
    )
  }
}, [])

// Save progress to localStorage
useEffect(() => {
  const progress = tasks.reduce((acc, task) => {
    acc[task.id] = task.completed
    return acc
  }, {} as Record<string, boolean>)
  localStorage.setItem('seller_onboarding_progress', JSON.stringify(progress))
}, [tasks])
```

#### 首次访问检测

```typescript
useEffect(() => {
  // ... language detection code ...
  
  // Check if user is new (first time visiting dashboard)
  const hasSeenOnboarding = localStorage.getItem('seller_has_seen_onboarding')
  if (!hasSeenOnboarding) {
    setShowOnboarding(true)
  }
}, [])
```

---

## ✅ 测试结果

### 功能验证

- ✅ LanguageSwitcher 在 Seller Dashboard 正常显示
- ✅ 切换语言后页面正确刷新
- ✅ 语言偏好保存到 cookie
- ✅ /seller/guide 页面可访问
- ✅ 操作说明书支持多语言
- ✅ OnboardingGuide 首次访问自动显示
- ✅ 任务完成状态正确保存
- ✅ 进度条实时更新
- ✅ 浮动帮助按钮正常工作
- ✅ 可以折叠和展开任务栏

### 浏览器兼容性

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

---

## 🚀 部署状态

- **Commit:** 2852073（待推送到 GitHub）
- **Branch:** main
- **GitHub:** https://github.com/Zhouhui-design/chinahuib2b
- **生产服务器:** https://chinahuib2b.top
- **注意：** Git 推送遇到网络问题，需要手动推送

---

## 📝 后续优化建议

### 1. 自动任务检测

当前版本需要用户手动标记任务完成。未来可以实现自动检测：

```typescript
// 示例：自动检测是否完善了资料
useEffect(() => {
  if (seller.companyName && seller.logo && seller.description) {
    markTaskComplete('complete_profile')
  }
}, [seller])

// 示例：自动检测是否有产品
useEffect(() => {
  if (productCount > 0) {
    markTaskComplete('add_first_product')
  }
}, [productCount])
```

### 2. 更详细的教程

- 视频教程嵌入
- 交互式演示
- 截图标注
- 常见问题 FAQ

### 3. 成就系统

- 完成所有任务获得徽章
- 连续登录奖励
- 产品数量里程碑
- 买家评价星级

### 4. 智能推荐

- 根据用户行为推荐下一步操作
- 相似商家的最佳实践
- 季节性营销活动建议

### 5. 多语言完善

- 将所有硬编码翻译移到字典文件
- 使用专业的 i18n 库（如 next-i18next）
- 支持 RTL 语言（阿拉伯语）的特殊布局
- 社区贡献翻译

---

## 🎉 总结

本次更新成功实现了三大功能：

### 7. ✅ 语言选择插件
- Seller Dashboard 支持 13 种语言
- 覆盖中国、东南亚、俄罗斯、中东等主要市场
- LanguageSwitcher 智能处理后台路由
- Cookie 持久化语言偏好

### 7.1 ✅ 商家操作说明书
- 详细的 6 章节操作手册
- 步骤化的清晰说明
- 多语言支持
- 易于查找和参考

### 7.2 ✅ 初学者指引系统
- 游戏化任务引导
- 5 个关键任务
- 进度追踪和可视化
- localStorage 持久化
- 首次访问自动显示
- 浮动帮助按钮随时访问

**用户体验提升：**
- 🌍 国际化支持，服务全球商家
- 📖 完整的操作文档，降低学习成本
- 🎮 游戏化引导，让上手过程更有趣
- 📊 进度追踪，激励用户完成设置
- 💡 智能提示，减少使用难度

这些功能将显著降低新商家的使用门槛，提高平台的易用性和用户满意度！
