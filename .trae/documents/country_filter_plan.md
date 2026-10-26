# 三页面「原产地国家」筛选 实现计划

## 背景与目标
用户要求 3 个页面支持按原产地国家筛选：
- 首页 `https://x2xhub.com/zh`
- 产品列表 `https://x2xhub.com/en/products`
- 店铺列表 `https://x2xhub.com/en/stores`

**已确认的决策**
1. 国家口径 = **供应商所在国**（SellerProfile.country，零 DB 迁移）；不给 Product 加原产地字段。
2. 下拉只列**有供应商的国家 + 公司数量**（facet），不展示零结果国家。
3. 单选；URL searchParams 驱动（可分享、可 SSR、翻页保留）。

## Repository Research（现状）

### 数据
- `Product` 模型无国家字段；`SellerProfile.country String`（有 `@@index([country)]`），产品通过 `product.seller.country` 关联。
- 生产 approved 供应商国家值写法不统一（2026-10-07 只读查询）：`中国` 17、`China` 16、`意大利` 1、`尼日利亚` 1、`Indonesia/Germany/Luxembourg/Israel` 各 1。**直接按英文名精确筛选会漏掉所有中文写法的供应商**（现有产品页 contains 也漏「中国」），必须做别名归一化。
- `src/lib/countries.ts`：`COUNTRIES`（190+，含 13 语言译名）、`findCountry(query)` 已能把任意语言名/英文码解析到 canonical Country。
- `src/lib/seo-title.ts` 的 `localizeCountry()` 显示层已兼容「中国/China/中国大陆」等存量写法。

### 页面
- **产品页** `src/app/[locale]/products/page.tsx`（SSR + ISR 1800s，searchParams 动态）：已支持 `?country=`，但实现是 `seller.country contains`（漏中文写法）；筛选 UI `src/components/product/ProductFilterBar.tsx` 中国家是**纯文本输入框**；翻页 `buildPageHref` 已保留 country。
- **店铺页** `src/app/[locale]/stores/page.tsx`：只有 `?search=`（走内部 fetch `/api/sellers/public` → `sellerService.getApprovedSellers(page,limit,search)`），**完全没有国家筛选**；UI `src/components/stores/StoresSearchBar.tsx`。
- **首页** `src/app/[locale]/page.tsx`：Hero 是原生 GET 表单（`name=keyword`）提交到 `/[locale]/products`；首页本身是精选内容 ISR 300s，不承载筛选结果，加国家入口随表单跳转即可。数据集中在 `src/lib/home-data.ts`。

## 设计方案

### 1. 国家别名归一化（核心，防漏数据）
`src/lib/countries.ts` 新增：
```ts
// 选中值（canonical 英文名）→ 库中可能出现的全部写法
export function getCountryAliases(query: string): string[]
```
- `findCountry` 命中 → `[c.name, ...Object.values(c.translations) 非空]`（如 China → `China,中国,Chine,Deutschland 不在内（那是德国）...` 实际为 China 的 13 语言名）；
- 未命中（自定义脏值）→ `[query.trim()]`，调用方走 contains 兜底。

后端筛选：命中别名表 → `country: { in: aliases }` 精确；未命中 → `{ contains: q, mode: 'insensitive' }`。

### 2. 国家 facet（有供应商的国家 + 数量）
`sellerService.ts` 新增 `getSellerCountryFacets(scope: 'all' | 'withProducts')`：
- `prisma.sellerProfile.groupBy({ by: ['country'], where: { isActive:true, profileStatus:'APPROVED' [, products: { some: { isActive:true } }] }, _count: { _count: true } })`；
- 内存归并：raw 值经 `findCountry` 映射到 canonical 英文名做 key 聚合（「中国」「China」合并计数）；无法识别的值单独成项；
- 返回 `[{ name: 'China', code: 'CN', count: 33 }, ...]` 按 count 降序。
- stores 用 `all`，products 用 `withProducts`。数据量小（~40 行），走现有页面缓存节奏，无需额外缓存层。

### 3. 可复用选择器
新建客户端组件 `src/components/common/CountryFilterCombobox.tsx`：
- props：`value, onChange, facets, language, placeholder, className, name?`；
- 输入模糊过滤 facet（匹配当前语言译名/英文名/ISO 码，复用 combobox 交互模式参考 `src/components/seller/CountrySelect.tsx`），每行显示 `本地化国名 + count`；
- 传入 `name` 时渲染 hidden input，支持首页原生 GET 表单提交；
- 空值选项「全部国家 / All countries」。

### 4. 三页面接线
- **产品页**
  - `page.tsx`：country 过滤改为 `getCountryAliases` 的 IN/兜底逻辑；取 facets（withProducts）传给 ProductFilterBar。
  - `ProductFilterBar.tsx`：国家文本框换成 `CountryFilterCombobox`（state 随现有「搜索」按钮统一提交，交互不变）；label：zh「原产地国家」/ en「Country of Origin」，其余语言走现有 t() 兜底英文。
- **店铺页**
  - `page.tsx`：searchParams 类型加 `country`；`getSellers` URL 带 country；取 facets（all）传入 SearchBar；`buildPageUrl` 保留 country；显示当前国家筛选 chip（可点 x 清除，同时保留 search）。
  - `route.ts` / `sellerService.getApprovedSellers`：增加 `country` 参数，同样别名 IN/兜底。
  - `StoresSearchBar.tsx`：加 combobox，国家**即选即筛**（router.push 保留 search、回第 1 页），关键词仍走搜索按钮。
- **首页**
  - `home-data.ts` 返回值加 `countryFacets`（all 口径，并行查询）。
  - `page.tsx` Hero 表单内 keyword 框旁加 compact 版 `CountryFilterCombobox name="country"`，随 GET 提交到 `/[locale]/products?keyword=&country=`，产品页已具备全部承接逻辑；占位「全部国家」。

### 5. SEO / 缓存
- 不动 canonical/meta（筛选页沿用各自无参 canonical，避免重复内容）。
- 缓存沿用：首页 ISR 300、stores fetch revalidate 60、产品页 searchParams 动态；无新增迁移。

## Files and Modules
- `src/lib/countries.ts`：+ `getCountryAliases()`
- `src/services/sellerService.ts`：`getApprovedSellers` 加 country 参数与归一化 where；+ `getSellerCountryFacets()`
- `src/app/api/sellers/public/route.ts`：透传 `country`
- `src/components/common/CountryFilterCombobox.tsx`：新建（facet combobox，支持 name/hidden input）
- `src/app/[locale]/products/page.tsx`：归一化过滤 + facets 传入
- `src/components/product/ProductFilterBar.tsx`：替换国家输入为 facet combobox
- `src/app/[locale]/stores/page.tsx`：country 参数链路、分页保留、chip、facets 传入
- `src/components/stores/StoresSearchBar.tsx`：加国家即选即筛
- `src/lib/home-data.ts`、`src/app/[locale]/page.tsx`：facets 数据 + Hero 国家入口

## Validation
1. `next build` + `tsc --noEmit` 过滤改动文件零错误（next.config ignoreBuildErrors）。
2. 本地浏览器（签发 dev 会话方式见项目记忆）：
   - 首页：选 China + 关键词提交 → 跳到 `/en/products?keyword=&country=China`；
   - 产品页：选「中国」写法的供应商产品也能被 `country=China` 查出（别名归一化）；facet 计数正确；翻页保留；
   - 店铺页：国家即选即筛、与 search 叠加、chip 清除、分页保留；
   - 下拉只出现 facet 国家且计数正确（中国/China 合并显示一条）。
3. GPTBot UA 抓 `?country=China` 两页 200 且结果 HTML 含对应公司。
4. 生产回归：无参三页面 200、展位 SSR/FAQ 不受影响、pm2 err 零增量。
5. 部署走 x2xhub-geo-deploy：DB 双地快照（零迁移仍做）、旧 .next 留档、小步发布、公网验证。

## Risks
- **存量脏值漏选**：用别名 IN + 未命中 contains 兜底；facet 中无法识别的国家独立成项不丢。
- **facet 口径**：产品页只统计有 active 产品的供应商，避免选中后 0 产品；与店铺页口径分开。
- **首页 hero 布局**：移动端表单从单行变两行（国家选择器 + 关键词 + 按钮），用 flex-wrap/响应式，不破坏 CTA 视觉。
- **ISR 页面新供应商后 facet 延迟**：跟现有缓存窗口（5/30 分钟）一致，可接受。
