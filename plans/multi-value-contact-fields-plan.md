# 下载权限 / 访客统计 / 留言监控 需求实施计划

> 需求方：阿辉 | 日期：2026-08-26

## 需求分解

### A. 文件下载必须登录（拥有账号才能下载）
- 现状：产品 brochure 走 `/api/brochures/[id]/download`，但游客可下载；store 详情页 brochure 是直链 `href={fileName}`，完全无校验。
- 目标：所有文件下载必须登录态，未登录跳转登录页或返回 401。

### B. 管理员后台看下载记录
- 现状：`BrochureDownload` model 已记录 userId/brochureId/时间，但无管理员 UI。
- 目标：管理员能看到「哪个用户下载了哪个公司的哪个文件」。

### C. 访客埋点扩展（展会/公司信息页）
- 现状：`VisitorTracker` 只挂在产品详情页。
- 目标：展会详情页、公司信息（store）详情页也埋点，记录统一到 `Visitor` model。

### D. 卖家后台访客统计 + 明细
- 现状：`api/seller/views` 已有统计（总数/国家/城市/最近访客），但**不含 viewerId 登录账号**、不含下载标记。
- 目标：显示展会/产品/公司信息各自访客数；登录访客显示账号 + 访问时间 + 是否下载文件。

### E. 留言/回复监控 + 超2天未回复告警
- 现状：留言走 chat `PrivateMessage`（双向），`Inquiry` model 存在但无 API。
- 目标：自动记录买家留言、卖家是否回复；卖家超2天未回复 → 管理员后台提示「某某卖家账号未回复买家信息」。

---

## 技术现状（已探明）

### Schema 已有 Model（无需大改）
- `BrochureDownload{ id, userId?, brochureType, brochureId, downloadedAt, ipAddress? }` — 下载日志
- `Visitor{ id, ipHash, productId?, sellerId?, viewerId?, country/city/..., isSelfView, createdAt }` — 访客埋点
- `BoothView{ id, sellerId, viewerId?, duration?, ..., viewedAt }` — 展会访问（旧，可能未用）
- `PrivateMessage{ id, content, senderId, receiverId, isRead, readAt, createdAt }` — 私信（留言/回复）
- `Notice{ id, title, content, senderId, ... }` — 系统通知
- `Inquiry{ id, buyerId, sellerId, productId?, message, contactInfo, status, createdAt, updatedAt }` — 询盘（无 API）

### 缺口
1. `BrochureDownload` 缺 sellerId 关联（无法定位"哪个公司"），需补 sellerId 字段。
2. store brochure 直链下载，无 API、无日志。
3. 展会/公司信息页无埋点。
4. `api/seller/views` 缺 viewerId 明细 + 下载标记。
5. 留言回复监控无实现。
6. `pending-counts` API 目前写死 0。

---

## 实施步骤（分模块，每步验证）

### 模块 A+B：下载登录校验 + 下载日志
- [ ] A1. 产品 brochure 下载 API 加登录校验
- [ ] A2. store 详情页 brochure 直链改为走新 API
- [ ] A3. 新建 store brochure 下载 API（登录校验 + 记录 BrochureDownload）
- [ ] B1. `BrochureDownload` 补 sellerId 字段（migration）
- [ ] B2. 新建管理员下载记录页面 + API

### 模块 C+D：访客埋点扩展 + 卖家明细
- [ ] C1. 展会详情页加 VisitorTracker
- [ ] C2. store（公司信息）详情页加 VisitorTracker
- [ ] D1. 扩展 `api/seller/views`：viewerId 账号 + 下载标记 + 分维度统计

### 模块 E：留言/回复监控
- [ ] E1. 新建管理员「未回复告警」API（扫描 PrivateMessage，判定卖家超2天未回复）
- [ ] E2. 管理员后台告警 UI + pending-counts 接入

---

## 关键决策
- 留言监控基于 **chat PrivateMessage**（卖家 messages 页实际使用的系统），不基于孤立的 `Inquiry`。
- "卖家账号" = `SellerProfile.userId` 对应的 User。
- "未回复"判定：买家给卖家发的最后一条私信，卖家超过 2 天未回复。

## 部署约束
- 不在 VPS build（OOM），本地 build → tar .next → scp → pm2 restart
- schema 变更需 migration + prod prisma generate
