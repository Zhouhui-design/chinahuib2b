# Cloudflare 地理优化配置指南

## 目标
- 全球各地区访问延迟 < 200ms
- 边缘缓存命中率 > 90%

## 当前状态
- ✅ Cloudflare Proxy 已启用
- ✅ 静态资源缓存已配置 (cf-cache-status: HIT)
- ❌ HTML 页面缓存未生效 (cf-cache-status: DYNAMIC)

## 代码优化已完成

### 1. next.config.ts 缓存策略
修改了 `/home/sardenesy/projects/chinahuib2b/next.config.ts`：

```typescript
// 首页 - 10分钟边缘缓存，24小时后台更新
source: '/en', headers: [{ key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=86400' }]

// 关于页面 - 24小时边缘缓存，7天后台更新
source: '/about', headers: [{ key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' }]

// 产品页面 - 1小时边缘缓存，24小时后台更新
source: '/products', headers: [{ key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }]

// 静态资源 - 永久缓存
source: '/_next/static/*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]

// API路由 - 不缓存
source: '/api/*', headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' }]
```

### 2. Cloudflare Pages 配置文件
创建了 `/home/sardenesy/projects/chinahuib2b/public/_headers` 和 `_routes.json`

## 手动配置 Cloudflare

### 步骤 1: 登录 Cloudflare Dashboard
访问 https://dash.cloudflare.com/
选择 `x2xhub.com`

### 步骤 2: 设置 SSL/TLS
- 进入 **SSL/TLS > Overview**
- 设置为 **Full (strict)**

### 步骤 3: 配置缓存规则
进入 **Rules > Cache Rules**

#### 规则 1: 缓存静态资源
- **名称**: Cache Static Assets
- **匹配表达式**: `(http.request.uri.path matches "^/(_next/static|/uploads|/images|/fonts)/.*") and (http.request.method eq "GET")`
- **缓存状态**: 缓存
- **边缘 TTL**: 覆盖 - 31536000 秒 (1年)
- **浏览器 TTL**: 覆盖 - 31536000 秒 (1年)

#### 规则 2: 缓存 HTML 页面
- **名称**: Cache HTML Pages
- **匹配表达式**: `(http.request.uri.path matches "^/(en|zh|about|products|exhibitions|stores|auction-screen)(/.*)?$") and (http.request.method eq "GET")`
- **缓存状态**: 缓存
- **边缘 TTL**: 覆盖 - 600 秒 (10分钟)
- **浏览器 TTL**: 覆盖 - 60 秒 (1分钟)
- **Stale-While-Revalidate**: 覆盖 - 86400 秒 (24小时)

#### 规则 3: API 不缓存
- **名称**: No Cache for API
- **匹配表达式**: `(http.request.uri.path matches "^/api/.*")`
- **缓存状态**: 不缓存

### 步骤 4: 启用性能优化
进入 **Speed > Optimization**

| 功能 | 设置 |
|------|------|
| Polish | 开启 (Lossy) |
| Mirage | 开启 |
| Rocket Loader | 开启 |

### 步骤 5: 启用 Tiered Cache
进入 **Caching > Tiered Cache**
- 启用 **Tiered Cache**

### 步骤 6: 设置浏览器缓存 TTL
进入 **Caching > Configuration**
- **Browser Cache TTL**: 4 hours

### 步骤 7: 清理缓存
进入 **Caching > Configuration**
- 点击 **Purge Everything**

## 验证优化效果

### 检查缓存状态
```bash
# 首次请求 - 应该是 MISS
curl -sI https://x2xhub.com/en | grep cf-cache-status

# 再次请求 - 应该是 HIT
curl -sI https://x2xhub.com/en | grep cf-cache-status
```

### 检查响应头
```bash
curl -sI https://x2xhub.com/en | grep -iE 'cf-cache|cache-control|server'
```

### 预期结果
```
server: cloudflare
cache-control: public, s-maxage=600, stale-while-revalidate=86400
cf-cache-status: HIT
```

### 测试全球延迟
```bash
# 使用不同地区的服务器测试
curl -sI https://x2xhub.com/en -w "Time: %{time_total}s\n" -o /dev/null
```

## 预期性能指标
| 指标 | 目标 |
|------|------|
| 全球延迟 | < 200ms |
| 边缘缓存命中率 | > 90% |
| 首屏加载时间 | < 1.5s |
| 静态资源缓存 | 1年 |

## 部署到生产环境

由于 SSH 连接问题，请手动执行以下步骤：

1. **构建项目**
   ```bash
   cd /home/sardenesy/projects/chinahuib2b
   npm run build
   ```

2. **上传到服务器**
   ```bash
   scp -r .next root@139.59.108.156:/var/www/x2xhub.com/
   ```

3. **重启服务**
   ```bash
   ssh root@139.59.108.156 "pm2 restart all"
   ```

4. **清理 Cloudflare 缓存**
   ```bash
   # 在 Cloudflare Dashboard 中手动清理
   ```

## 监控
- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **缓存分析**: 进入 **Analytics > Cache Analytics**
- **性能监控**: 进入 **Analytics > Speed**

## 注意事项
1. 缓存规则需要 5-10 分钟生效
2. 修改内容后需要手动清理缓存
3. API 路由不会被缓存，确保实时数据
4. 使用 `stale-while-revalidate` 确保用户始终看到最新内容
