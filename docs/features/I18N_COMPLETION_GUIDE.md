# 🌍 多语言翻译完善指南

## 📊 当前状态

### 已支持的语言

| 语言代码 | 语言名称 | 完成度 | 状态 |
|---------|---------|--------|------|
| `en` | English (英语) | 100% | ✅ 完整 |
| `zh` | 中文 (Chinese) | 100% | ✅ 完整 |
| `es` | Español (西班牙语) | ~60% | ⚠️ 部分完成 |
| `fr` | Français (法语) | ~60% | ⚠️ 部分完成 |
| `ar` | العربية (阿拉伯语) | ~40% | ⚠️ 部分完成 |
| `de` | Deutsch (德语) | 0% | ❌ 使用回退 |
| `ja` | 日本語 (日语) | 0% | ❌ 使用回退 |
| `ko` | 한국어 (韩语) | 0% | ❌ 使用回退 |
| `pt` | Português (葡萄牙语) | 0% | ❌ 使用回退 |
| `ru` | Русский (俄语) | 0% | ❌ 使用回退 |

---

## 🎯 优先级任务

### 高优先级（本周）

1. **补全西班牙语 (es)** - 当前约60%完成
2. **补全法语 (fr)** - 当前约60%完成  
3. **补全阿拉伯语 (ar)** - 当前约40%完成 + RTL支持

### 中优先级（本月）

4. 添加德语 (de) 基础翻译
5. 添加日语 (ja) 基础翻译
6. 添加韩语 (ko) 基础翻译

### 低优先级（季度）

7. 添加葡萄牙语 (pt)
8. 添加俄语 (ru)
9. 其他语言按需添加

---

## 🔧 翻译文件结构

**位置**: `src/locales/dictionary.ts`

**类型定义**:
```typescript
export type Dictionary = {
  home: {
    hero: { title, subtitle, searchPlaceholder, searchButton }
    featured: { title, viewDetails, boothName, ... }
    why: { title, verified, competitive, global }
    exhibitors: { title, viewAll }
  }
  nav: { home, products, exhibitors, ... }
  common: { loading, error, save, cancel, ... }
  auth: { login, register }
  seller: { dashboard, profile, products, ... }
  product: { name, description, category, ... }
  stores: { title, subtitle, verified, ... }
  pagination: { previous, next }
}
```

---

## 📝 补全翻译步骤

### 方法 1: 手动补全（推荐用于关键语言）

#### Step 1: 找到缺失的翻译

```bash
# 在 dictionary.ts 中搜索特定语言
grep -A 200 "es: {" src/locales/dictionary.ts | head -100
```

#### Step 2: 对比英文版本

打开文件，对比 `en` 和 `es` 的结构，找出缺失的键。

#### Step 3: 添加翻译

```typescript
es: {
  // ... 现有翻译
  
  // 添加缺失的部分
  seller: {
    dashboard: "Panel de Control",
    profile: "Perfil",
    products: "Productos",
    // ... 继续补全
  },
}
```

### 方法 2: 使用 AI 辅助翻译（快速）

#### Step 1: 提取英文文本

```bash
# 创建脚本提取所有英文键值对
node scripts/extract-english.js > en-translations.json
```

#### Step 2: 使用翻译 API

```javascript
// scripts/translate.js
const axios = require('axios')

async function translate(text, targetLang) {
  const response = await axios.post('https://api.deepl.com/v2/translate', {
    text: [text],
    target_lang: targetLang.toUpperCase(),
  }, {
    headers: {
      'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`
    }
  })
  
  return response.data.translations[0].text
}

// 批量翻译
async function translateDictionary() {
  const enDict = require('./en-translations.json')
  const esDict = {}
  
  for (const [key, value] of Object.entries(enDict)) {
    if (typeof value === 'string') {
      esDict[key] = await translate(value, 'ES')
    } else {
      esDict[key] = {}
      for (const [subKey, subValue] of Object.entries(value)) {
        esDict[key][subKey] = await translate(subValue, 'ES')
      }
    }
  }
  
  return esDict
}
```

#### Step 3: 人工校对

AI 翻译后需要人工校对，确保：
- 术语准确
- 语境合适
- 文化适配

### 方法 3: 众包翻译（长期方案）

使用平台如：
- [Crowdin](https://crowdin.com/)
- [Transifex](https://www.transifex.com/)
- [Lokalise](https://lokalise.com/)

---

## 🌐 RTL（从右到左）语言支持

阿拉伯语 (`ar`) 是 RTL 语言，需要特殊处理。

### Step 1: 检测 RTL 语言

```typescript
// src/lib/languages.ts
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur']

export function isRTL(language: LanguageCode): boolean {
  return RTL_LANGUAGES.includes(language)
}
```

### Step 2: 添加 CSS 支持

```css
/* src/app/globals.css */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .ml-4 {
  margin-left: 0;
  margin-right: 1rem;
}

[dir="rtl"] .mr-4 {
  margin-right: 0;
  margin-left: 1rem;
}

/* 使用逻辑属性代替物理属性 */
[dir="rtl"] .ps-4 {
  padding-inline-start: 1rem;
}

[dir="rtl"] .pe-4 {
  padding-inline-end: 1rem;
}
```

### Step 3: 更新 Layout

```tsx
// src/app/[locale]/layout.tsx
import { isRTL } from '@/lib/languages'

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const dir = isRTL(params.locale as LanguageCode) ? 'rtl' : 'ltr'
  
  return (
    <html lang={params.locale} dir={dir}>
      <body>{children}</body>
    </html>
  )
}
```

### Step 4: 组件适配

```tsx
// 使用 Tailwind 的逻辑类
<div className="ps-4 pe-4"> {/* 自动适配 RTL */}
  Content
</div>

// 避免使用物理方向类
// ❌ 不要这样做
<div className="pl-4 pr-4">

// ✅ 应该这样做
<div className="ps-4 pe-4">
```

---

## 🛠️ 实用工具脚本

### 1. 检查翻译完整度

```javascript
// scripts/check-translations.js
const fs = require('fs')
const path = require('path')

const dictionaryPath = path.join(__dirname, '../src/locales/dictionary.ts')
const content = fs.readFileSync(dictionaryPath, 'utf-8')

// 简单统计
const languages = ['en', 'zh', 'es', 'fr', 'ar', 'de', 'ja', 'ko', 'pt', 'ru']
const enKeys = extractKeys(content, 'en')

languages.forEach(lang => {
  const langKeys = extractKeys(content, lang)
  const completeness = (langKeys.length / enKeys.length * 100).toFixed(2)
  console.log(`${lang}: ${completeness}% (${langKeys.length}/${enKeys.length} keys)`)
})

function extractKeys(content, lang) {
  // 简化的提取逻辑
  const regex = new RegExp(`${lang}:\\s*\\{([^}]+)\\}`, 's')
  const match = content.match(regex)
  if (!match) return []
  
  // 计算键的数量
  return match[1].match(/[\w]+:/g) || []
}
```

运行：
```bash
node scripts/check-translations.js
```

### 2. 生成翻译模板

```javascript
// scripts/generate-template.js
const fs = require('fs')

const template = {
  home: {
    hero: {
      title: "",
      subtitle: "",
      searchPlaceholder: "",
      searchButton: "",
    },
    // ... 完整结构
  },
  // ... 其他部分
}

fs.writeFileSync(
  'translation-template.json',
  JSON.stringify(template, null, 2)
)

console.log('Template generated: translation-template.json')
```

### 3. 验证翻译文件

```javascript
// scripts/validate-translations.js
const dictionaries = require('../src/locales/dictionary.ts')

function validateStructure(dict, reference, path = '') {
  const errors = []
  
  for (const key in reference) {
    const currentPath = path ? `${path}.${key}` : key
    
    if (!(key in dict)) {
      errors.push(`Missing key: ${currentPath}`)
    } else if (typeof reference[key] === 'object' && !Array.isArray(reference[key])) {
      errors.push(...validateStructure(dict[key], reference[key], currentPath))
    }
  }
  
  return errors
}

const enRef = dictionaries.en
const languages = Object.keys(dictionaries)

languages.forEach(lang => {
  if (lang === 'en') return
  
  const errors = validateStructure(dictionaries[lang], enRef)
  
  if (errors.length > 0) {
    console.log(`\n❌ ${lang} has ${errors.length} issues:`)
    errors.slice(0, 10).forEach(err => console.log(`  - ${err}`))
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more`)
    }
  } else {
    console.log(`✅ ${lang} is complete`)
  }
})
```

---

## 📋 翻译最佳实践

### 1. 保持一致性

- 使用统一的术语表
- 保持语气一致（正式/非正式）
- 遵循目标语言的语法习惯

### 2. 考虑文化差异

```typescript
// ❌ 不好的做法
date: "MM/DD/YYYY"  // 美国格式

// ✅ 好的做法
date: "DD/MM/YYYY"  // 欧洲格式
// 或使用国际化库
date: new Intl.DateTimeFormat(locale).format(date)
```

### 3. 处理复数形式

```typescript
// 英语
items: {
  one: "1 item",
  other: "{{count}} items"
}

// 使用 i18n 库处理
import { useTranslation } from 'react-i18next'
const { t } = useTranslation()
t('items', { count: 5 }) // "5 items"
```

### 4. 避免硬编码文本

```tsx
// ❌ 不好
<p>Welcome to our site</p>

// ✅ 好
<p>{t('home.welcome')}</p>
```

### 5. 测试所有语言

```bash
# 自动化测试
npm run test:i18n

# 手动检查每个语言
for lang in en zh es fr ar de ja ko pt ru; do
  echo "Testing $lang..."
  curl -H "Accept-Language: $lang" http://localhost:3000
done
```

---

## 🚀 快速补全示例

### 补全西班牙语卖家仪表板翻译

**当前状态**（部分缺失）:
```typescript
es: {
  seller: {
    dashboard: "Panel",
    // 缺少其他键
  },
}
```

**补全后**:
```typescript
es: {
  seller: {
    dashboard: "Panel de Control",
    profile: "Perfil de Empresa",
    products: "Mis Productos",
    addProduct: "Agregar Producto",
    editProduct: "Editar Producto",
    brochures: "Catálogos",
    settings: "Configuración",
    companyInfo: "Información de la Empresa",
    saveChanges: "Guardar Cambios",
  },
}
```

---

## 📊 翻译进度追踪

创建进度看板：

```markdown
## Translation Progress

### Spanish (es)
- [x] Home page
- [x] Navigation
- [x] Authentication
- [ ] Seller dashboard (50%)
- [ ] Product management
- [ ] Settings

### French (fr)
- [x] Home page
- [x] Navigation
- [ ] Authentication (80%)
- [ ] Seller dashboard
- [ ] Product management

### Arabic (ar)
- [x] Home page
- [ ] Navigation
- [ ] Authentication
- [ ] RTL support
```

---

## 🎯 下一步行动

### 立即执行（今天）

1. 运行完整性检查脚本
2. 识别最缺失的关键翻译
3. 优先补全导航和认证相关文本

### 本周内

1. 补全西班牙语核心功能翻译
2. 补全法语核心功能翻译
3. 实现阿拉伯语 RTL 支持

### 本月内

1. 添加德语、日语、韩语基础翻译
2. 建立翻译工作流程
3. 设置自动化测试

---

## 💡 资源推荐

### 翻译服务

- **DeepL API**: 高质量机器翻译
- **Google Cloud Translation**: 支持100+语言
- **Amazon Translate**: AWS 集成

### 管理工具

- **Crowdin**: 协作翻译平台
- **Lokalise**: 开发者友好的 TMS
- **Phrase**: 企业级解决方案

### 学习资源

- [MDN: Internationalization](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [React Intl](https://formatjs.io/docs/react-intl/)
- [i18next](https://www.i18next.com/)

---

**最后更新**: 2026-05-17  
**维护者**: AI Assistant
