# 🚀 第四阶段优化 - 快速启动指南

**日期**: 2026-05-19  
**目标**: 快速完成 CDN 和性能监控系统部署  

---

## ⚡ 一键部署（推荐）

### 方法 1: 交互式配置向导（最简单）

```bash
cd /home/sardenesy/projects/chinahuib2b
./scripts/phase4-setup-wizard.sh
```

**特点**:
- ✅ 引导式操作，无需记忆命令
- ✅ 自动保存配置到 .env.local
- ✅ 自动安装依赖
- ✅ 预计耗时: 15-20 分钟

---

### 方法 2: 手动配置（灵活控制）

#### 步骤 1: 注册服务账户

**Cloudflare** (5分钟):
1. 访问: https://dash.cloudflare.com/sign-up
2. 使用邮箱注册（免费套餐）
3. 添加域名: chinahuib2b.top 和 fixr2026.com
4. 获取 API Token 和 Zone IDs

**Google Analytics 4** (3分钟):
1. 访问: https://analytics.google.com/
2. 使用 Google 账号登录
3. 创建媒体资源: chinahuib2b.top
4. 获取测量 ID (G-XXXXXXXXXX)

**Sentry** (5分钟):
1. 访问: https://sentry.io/signup/
2. 注册账户（免费套餐）
3. 创建项目: Next.js → chinahuib2b
4. 获取 DSN、Organization、Auth Token

---

#### 步骤 2: 配置环境变量

编辑 `.env.local`:

```bash
# Cloudflare Configuration
CLOUDFLARE_API_TOKEN=your_api_token_here
CHINAHUIB_ZONE_ID=your_zone_id_here
FIXTURER_ZONE_ID=your_zone_id_here

# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://xxx@oxxx.ingest.sentry.io/xxx
SENTRY_DSN=https://xxx@oxxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org-name
SENTRY_PROJECT=chinahuib2b
SENTRY_AUTH_TOKEN=your_auth_token
```

---

#### 步骤 3: 安装依赖

```bash
cd /home/sardenesy/projects/chinahuib2b

# 安装 Sentry
npm install @sentry/nextjs

# 安装 Lighthouse CI
npm install --save-dev @lhci/cli

# 初始化 Sentry 配置
npx @sentry/wizard@latest -i nextjs
```

---

#### 步骤 4: 构建和部署

```bash
# 构建项目
npm run build

# 重启服务
pm2 restart all

# 查看状态
pm2 status
```

---

#### 步骤 5: 验证配置

**验证 GA4**:
1. 访问网站: https://chinahuib2b.top
2. 打开 GA4 Dashboard: https://analytics.google.com/
3. 查看 Realtime 报告，应该能看到活跃用户

**验证 Sentry**:
1. 访问网站并触发一个错误（或等待自然错误）
2. 打开 Sentry Dashboard: https://sentry.io/
3. 查看 Issues，应该能看到错误报告

**验证 Lighthouse CI**:
```bash
# 运行本地审计
npm run lighthouse

# 查看报告
# 报告会上传到临时存储，URL 会显示在终端
```

---

## 🔧 常用命令

### CDN 管理

```bash
# 清除缓存
./scripts/cdn-manager.sh purge

# 验证配置
./scripts/cdn-manager.sh verify

# 监控性能
./scripts/cdn-manager.sh monitor

# 查看分析
./scripts/cdn-manager.sh analytics
```

### 监控管理

```bash
# 完整部署
./scripts/setup-monitoring.sh

# 运行 Lighthouse 审计
npm run lighthouse

# 查看 Sentry 配置
cat sentry.client.config.ts
cat sentry.server.config.ts
```

---

## 📊 验证清单

### Cloudflare CDN

- [ ] DNS 记录已迁移到 Cloudflare
- [ ] SSL/TLS 模式设置为 Full (strict)
- [ ] 缓存规则已配置
- [ ] 页面规则已设置（API 路径绕过缓存）
- [ ] 运行 `./scripts/cdn-manager.sh verify` 通过

### Google Analytics 4

- [ ] GA4 代码已集成到 Next.js
- [ ] 环境变量 NEXT_PUBLIC_GA_ID 已设置
- [ ] Realtime 报告能看到活跃用户
- [ ] 事件追踪正常工作

### Sentry

- [ ] Sentry SDK 已安装
- [ ] DSN 已配置
- [ ] 错误能正常捕获
- [ ] Web Vitals 数据正常上报
- [ ] 告警规则已设置

### Lighthouse CI

- [ ] 配置文件 lighthouserc.json 已创建
- [ ] GitHub Actions 工作流已配置
- [ ] 本地运行 `npm run lighthouse` 成功
- [ ] 所有类别分数 ≥ 0.9

---

## 🐛 故障排除

### 问题 1: GA4 没有数据

**症状**: GA4 Dashboard 显示 0 活跃用户

**解决方案**:
1. 检查浏览器控制台是否有 gtag 错误
2. 确认 NEXT_PUBLIC_GA_ID 格式正确 (G-XXXXXXXXXX)
3. 清除浏览器缓存并重新访问
4. 等待 24-48 小时数据才会完全显示

---

### 问题 2: Sentry 不捕获错误

**症状**: Sentry Dashboard 没有错误报告

**解决方案**:
1. 检查 DSN 是否正确
2. 确认 sentry.client.config.ts 和 sentry.server.config.ts 存在
3. 在浏览器控制台运行: `Sentry.captureMessage('test')`
4. 检查 Sentry Dashboard 的 Filters 是否过滤了某些错误

---

### 问题 3: Lighthouse CI 失败

**症状**: `npm run lighthouse` 报错

**解决方案**:
1. 确保网站可以公开访问
2. 检查 lighthouserc.json 中的 URL 是否正确
3. 降低阈值 temporarily: `"minScore": 0.7`
4. 增加运行次数: `"numberOfRuns": 5`

---

### 问题 4: Cloudflare 缓存未生效

**症状**: 更新后仍然看到旧内容

**解决方案**:
1. 运行 `./scripts/cdn-manager.sh purge` 清除缓存
2. 检查缓存规则是否正确
3. 使用无痕模式测试
4. 等待最多 5 分钟让缓存失效

---

## 📈 性能基准测试

### 部署前 vs 部署后

运行以下命令对比性能：

```bash
# 部署前
curl -w "\nTime Total: %{time_total}s\nTime Connect: %{time_connect}s\nTime Start Transfer: %{time_starttransfer}s\n" https://chinahuib2b.top/

# 部署后（清除缓存后）
./scripts/cdn-manager.sh purge
curl -w "\nTime Total: %{time_total}s\nTime Connect: %{time_connect}s\nTime Start Transfer: %{time_starttransfer}s\n" https://chinahuib2b.top/
```

**预期改进**:
- Time Total: 减少 50-70%
- Time Connect: 减少 30-50%
- Time Start Transfer: 减少 60-80%

---

## 🎯 下一步行动

完成基础配置后，继续执行：

1. **A/B 测试框架**（3小时）
   ```bash
   # 待实施
   npm install @optimizely/optimizely-sdk
   ```

2. **PWA 离线支持**（4小时）
   ```bash
   # 待实施
   npm install workbox-webpack-plugin
   ```

3. **端到端加密**（8小时）
   ```bash
   # 待实施（chat-system）
   cd ../chat-system/server
   npm install libsodium-wrappers
   ```

4. **国际化扩展**（6小时）
   ```bash
   # 待实施
   npm install next-intl
   ```

---

## 📞 获取帮助

如果遇到问题：

1. **查看文档**:
   - [CLOUDFLARE_CDN_SETUP.md](./CLOUDFLARE_CDN_SETUP.md)
   - [PERFORMANCE_MONITORING_SETUP.md](./PERFORMANCE_MONITORING_SETUP.md)
   - [PHASE4_PROGRESS_REPORT.md](./PHASE4_PROGRESS_REPORT.md)

2. **检查日志**:
   ```bash
   # Next.js 日志
   pm2 logs chinahuib2b-dev
   
   # chat-system 日志
   pm2 logs chat-system
   
   # Winston 日志文件
   ls -la logs/
   ```

3. **联系支持**:
   - Cloudflare: https://support.cloudflare.com/
   - GA4: https://support.google.com/analytics/
   - Sentry: https://sentry.io/support/

---

## ✅ 完成标志

当您看到以下内容时，表示部署成功：

- ✅ GA4 Realtime 报告有数据
- ✅ Sentry Dashboard 有错误/性能数据
- ✅ Lighthouse CI 所有分数 ≥ 0.9
- ✅ Cloudflare Dashboard 显示流量
- ✅ 网站加载速度明显提升

**恭喜！第四阶段核心配置完成！** 🎉
