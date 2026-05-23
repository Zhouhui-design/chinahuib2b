# 多语言系统使用说明

## 功能概述

已为全球 B2B 展会平台实现了完整的多语言支持系统，包含 14 种语言。

## 支持的语言

| 代码 | 语言 | 原生名称 | 旗帜 |
|------|------|---------|------|
| en | English | English | 🇺🇸 |
| zh | Chinese | 中文 | 🇨🇳 |
| es | Spanish | Español | 🇪🇸 |
| fr | French | Français | 🇫🇷 |
| de | German | Deutsch | 🇩🇪 |
| ja | Japanese | 日本語 | 🇯🇵 |
| ko | Korean | 한국어 | 🇰🇷 |
| ar | Arabic | العربية | 🇸🇦 |
| ru | Russian | Русский | 🇷🇺 |
| pt | Portuguese | Português | 🇵🇹 |
| hi | Hindi | हिन्दी | 🇮🇳 |
| th | Thai | ไทย | 🇹🇭 |
| vi | Vietnamese | Tiếng Việt | 🇻🇳 |

## URL 路由结构

系统使用 URL 前缀来区分语言：

- **英文**: https://chinahuib2b.top/en/
- **中文**: https://chinahuib2b.top/zh/
- **西班牙文**: https://chinahuib2b.top/es/
- **法文**: https://chinahuib2b.top/fr/
- 等等...

**自动重定向**: 访问 https://chinahuib2b.top/ 会自动重定向到默认语言（英文）https://chinahuib2b.top/en/

## 语言切换器

### 位置
- 页面顶部导航栏右侧
- 所有页面都会显示

### 使用方法
1. 点击导航栏中的语言按钮（显示国旗和语言名称）
2. 下拉菜单会显示所有支持的 14 种语言
3. 点击任意语言即可切换
4. 当前语言会高亮显示并带有勾选标记

### 特性
- 🌍 显示国旗图标和语言名称
- ✅ 当前语言自动高亮
- 🔄 切换时保持当前页面路径
- 📱 响应式设计，移动端友好
- 💨 快速切换，无页面刷新

## 翻译覆盖范围

### 当前已翻译的页面和组件

✅ **首页** (`/`)
- Hero 区域（标题、副标题、搜索框）
- 精选产品区域
- 为什么选择我们（3个特色）
- 精选参展商区域

✅ **导航栏**
- Logo 和导航链接
- 登录/注册按钮
- 所有菜单项

✅ **通用组件**
- 加载状态文本
- 错误消息
- 按钮文本（保存、取消、删除、编辑等）
- 搜索和过滤文本

✅ **认证页面**
- 登录表单
- 注册表单
- 所有表单标签和提示

✅ **卖家仪表板**
- 仪表板标题
- 产品信息管理
- 手册管理
- 公司资料设置

### 翻译文件位置

```
src/locales/dictionary.ts  # 所有翻译字典
src/lib/languages.ts       # 语言配置
src/components/language/LanguageSwitcher.tsx  # 语言切换组件
```

## 如何添加新翻译

### 1. 添加新语言

编辑 `src/lib/languages.ts`:

```typescript
export const languages = [
  // ... 现有语言
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
] as const;
```

### 2. 添加翻译内容

编辑 `src/locales/dictionary.ts`，添加新的语言块：

```typescript
it: {
  home: {
    hero: {
      title: "Rete Globale di Esposizioni",
      subtitle: "Il tuo portale per le fiere commerciali B2B",
      // ... 其他翻译
    },
    // ... 其他部分
  },
  // ... nav, common, auth, seller, product
}
```

### 3. 更新页面组件

在页面中使用翻译：

```typescript
import { getDictionary } from "@/locales/dictionary";

export default async function Page({ params }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  
  return (
    <h1>{dict.home.hero.title}</h1>
  );
}
```

## 技术实现

### 中间件路由

`src/middleware.ts` 处理：
- 自动检测 URL 中的语言前缀
- 无语言前缀时重定向到默认语言
- 排除静态文件、API 路由和上传文件

### 动态路由

使用 Next.js 动态路由 `[locale]`：
```
src/app/[locale]/page.tsx
src/app/[locale]/layout.tsx
```

### 服务器端渲染

所有翻译在服务器端加载，确保：
- 快速的初始页面加载
- 良好的 SEO 支持
- 每种语言都有独立的 URL

## 开发工作流程

### 本地开发

1. 在 `/home/sardenesy/projects/chinahuib2b` 修改代码
2. 测试多语言功能：
   ```bash
   npm run dev
   # 访问 http://localhost:3000/en/
   # 访问 http://localhost:3000/zh/
   ```

### 部署到服务器

```bash
# 1. 提交更改
git add -A
git commit -m "feat: update translations"
git push origin main

# 2. 部署到服务器
ssh root@139.59.108.156
cd /var/www/chinahuib2b
git pull origin main
pm2 restart chinahuib2b-next --update-env
```

### 验证部署

```bash
# 测试英文
curl -skL https://chinahuib2b.top/en/ | grep "Global Expo Network"

# 测试中文
curl -skL https://chinahuib2b.top/zh/ | grep "全球展会网络"

# 测试西班牙文
curl -skL https://chinahuib2b.top/es/ | grep "Red Global"
```

## 文件存储说明

当前所有上传的文件（产品图片、Logo、头图、PDF 手册）存储在服务器本地硬盘：
- 路径: `/var/www/chinahuib2b/public/uploads/`
- URL: `https://chinahuib2b.top/uploads/...`

**迁移计划**: 网站正式开张后，将迁移到 DigitalOcean Spaces：
1. 配置 Spaces 凭证
2. 上传现有文件到 Spaces
3. 更新上传 API 使用 S3 SDK
4. 更新数据库中的文件 URL

详细迁移步骤请参考: `MIGRATION_TO_SPACES.md`

## 性能优化建议

1. **CDN**: 为静态资源配置 CDN
2. **缓存**: 为翻译字典设置长期缓存
3. **按需加载**: 对于大型字典，考虑按需加载语言包
4. **图片优化**: 已使用 Sharp 自动转换为 WebP 格式

## 故障排除

### 语言切换无效
- 检查中间件是否正确配置
- 查看浏览器控制台是否有错误
- 清除浏览器缓存

### 翻译缺失
- 检查 `dictionary.ts` 中是否包含该语言的翻译
- 确认页面组件正确导入了字典
- 查看服务器日志是否有错误

### 路由错误
- 验证 `[locale]` 文件夹结构正确
- 检查 middleware matcher 配置
- 确认所有页面都接受了 `params` 参数

## 下一步计划

1. ✨ 为所有页面添加完整的翻译覆盖
2. 🌐 添加更多语言（意大利语、土耳其语、荷兰语等）
3. 🎨 改进语言切换器的 UI/UX
4. 📊 添加语言使用分析
5. 🔍 实现基于浏览器语言的自动检测
6. 💾 完成 DigitalOcean Spaces 迁移

---

**最后更新**: 2026-04-24
**状态**: ✅ 已部署并运行中
