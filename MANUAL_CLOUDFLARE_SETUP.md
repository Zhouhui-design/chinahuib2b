# 🚨 紧急：手动配置 Cloudflare DNS

## ⚠️ API 访问问题

我尝试使用您提供的 API 密钥访问 Cloudflare，但遇到了认证错误。这可能是因为：

1. API Key/Token 格式不正确
2. API Key 已过期或被撤销
3. 权限不足

**解决方案**: 请手动在 Cloudflare Dashboard 中添加 DNS 记录（只需 5 分钟）

---

## ✅ 手动配置步骤（推荐）

### 第 1 步: 登录 Cloudflare

访问: **https://dash.cloudflare.com/login**

使用您的邮箱和密码登录

### 第 2 步: 选择站点

在 Dashboard 中找到 `chinahuib2b.top` 并点击

### 第 3 步: 进入 DNS 设置

点击左侧菜单的 **"DNS"** → **"Records"**

### 第 4 步: 添加 A 记录

#### 记录 1: 主域名 (@)

点击 **"Add record"** 按钮，填写：

```
Type:        A
Name:        @
IPv4 address: 167.99.134.217
Proxy status: Proxied (橙色云图标 ☁️)
TTL:         Auto
```

点击 **"Save"** 保存

#### 记录 2: www 子域名

再次点击 **"Add record"**，填写：

```
Type:        A
Name:        www
IPv4 address: 167.99.134.217
Proxy status: Proxied (橙色云图标 ☁️)
TTL:         Auto
```

点击 **"Save"** 保存

### 第 5 步: 验证

等待 1-5 分钟后，在终端运行：

```bash
dig chinahuib2b.top +short
```

应该返回：`167.99.134.217`

---

## 🔍 如果找不到站点

### 检查账号

1. 确认使用的邮箱是注册 Cloudflare 时的邮箱
2. 检查是否有多个 Cloudflare 账号
3. 查看邮箱中的 Cloudflare 欢迎邮件

### 重新添加站点

如果站点不在列表中：

1. 点击 **"Add a site"**
2. 输入 `chinahuib2b.top`
3. 选择免费计划
4. 按照提示完成设置

---

## 📸 界面说明

### DNS Records 页面

```
┌─────────────────────────────────────────┐
│ DNS Management                          │
├─────────────────────────────────────────┤
│                                         │
│  [Add record] ← 点击这个按钮            │
│                                         │
│  Type    Name    Content     Proxy      │
│  ────────────────────────────────────   │
│  (这里会显示现有的记录)                  │
│                                         │
└─────────────────────────────────────────┘
```

### 添加记录表单

```
┌─────────────────────────────────────────┐
│ Add record                              │
├─────────────────────────────────────────┤
│                                         │
│  Type:          [A ▼]                   │
│  Name:          [@    ]                 │
│  IPv4 address:  [167.99.134.217       ] │
│                                         │
│  Proxy status:                          │
│  ○ Proxied (橙色)  ◉ DNS only (灰色)   │
│  ↑ 选择 Proxied（橙色云）               │
│                                         │
│  TTL:           [Auto ▼]                │
│                                         │
│         [Cancel]    [Save]              │
│                    ↑ 点击保存            │
└─────────────────────────────────────────┘
```

---

## ✅ 验证清单

配置完成后，按顺序检查：

### 1. DNS 解析
```bash
dig chinahuib2b.top +short
# 应返回: 167.99.134.217
```

### 2. HTTP 访问
```bash
curl -I http://chinahuib2b.top
# 应返回: 301 Moved Permanently
```

### 3. HTTPS 访问
```bash
curl -I https://chinahuib2b.top
# 应返回: 200 OK 或 307 Temporary Redirect
```

### 4. 浏览器测试

打开浏览器访问: **https://chinahuib2b.top**

应该看到网站首页（会自动重定向到 /en/）

---

## 🎯 Cloudflare 额外配置（可选）

### SSL/TLS 设置

1. 点击左侧 **"SSL/TLS"**
2. 选择 **"Full (strict)"** 模式
3. 确保 "Always Use HTTPS" 开启

### 缓存优化

1. 点击 **"Caching"** → **"Configuration"**
2. Browser Cache TTL: 尊重源站
3. Always Online: 开启

### 速度优化

1. 点击 **"Speed"** → **"Optimization"**
2. Auto Minify: 勾选 JS, CSS
3. Brotli: 开启
4. Rocket Loader: **关闭**（与 Next.js 可能冲突）

---

## 🆘 常见问题

### Q1: 添加记录后仍然无法解析？

**A**: 
1. 清除本地 DNS 缓存
2. 等待更长时间（最多 30 分钟）
3. 使用不同网络测试

```bash
# 清除 DNS 缓存
# macOS
sudo dscacheutil -flushcache

# Windows
ipconfig /flushdns

# Linux
sudo systemd-resolve --flush-caches
```

### Q2: 网站可以访问但显示错误？

**A**: 检查服务器日志

```bash
ssh root@167.99.134.217
pm2 logs chinahuib2b-dev --lines 50
tail -50 /var/log/nginx/error.log
```

### Q3: 如何确认记录已生效？

**A**: 使用在线工具

访问: https://dnschecker.org/

输入 `chinahuib2b.top`，选择 `A` 记录类型

应该在全球各地都显示 `167.99.134.217`

---

## 📊 预期时间线

| 步骤 | 时间 |
|------|------|
| 登录 Cloudflare | 1 分钟 |
| 添加 2 条记录 | 2 分钟 |
| DNS 传播 | 1-30 分钟 |
| **总计** | **约 30 分钟内** |

---

## ✨ 完成后的效果

✅ 全球可访问  
✅ 自动 HTTPS  
✅ CDN 加速（200+ 节点）  
✅ DDoS 保护  
✅ 高性能（国际用户速度提升 50-70%）  

---

## 📞 需要帮助？

如果遇到问题：

1. **Cloudflare 支持**: https://support.cloudflare.com
2. **查看详细报告**: SERVER_STATUS_REPORT.md
3. **运行诊断**: bash check-dns-and-server.sh

---

## 🎯 立即行动

**现在就做**:

1. ✅ 打开浏览器
2. ✅ 访问 https://dash.cloudflare.com
3. ✅ 登录账号
4. ✅ 添加两条 A 记录
5. ✅ 等待 5-30 分钟
6. ✅ 测试访问

**就这么简单！** 🚀

预计总时间：**5-10 分钟配置 + 5-30 分钟等待 = 约 40 分钟完全恢复**
