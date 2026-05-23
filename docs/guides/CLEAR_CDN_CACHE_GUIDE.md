# 🚀 清除 Cloudflare CDN 缓存 - 操作指南

## 📋 两种方法任选其一

---

## 方法 1: 通过 Cloudflare Dashboard（推荐，最简单）⭐

### 步骤：

1. **登录 Cloudflare**
   ```
   访问: https://dash.cloudflare.com/
   ```

2. **选择域名**
   ```
   点击: chinahuib2b.top
   ```

3. **进入缓存设置**
   ```
   左侧菜单: Caching → Configuration
   ```

4. **清除所有缓存**
   ```
   找到: Purge Cache 区域
   点击: Purge Everything 按钮
   确认: 点击 Purge
   ```

5. **等待生效**
   ```
   通常需要 5-10 分钟全球生效
   ```

✅ **完成！**

---

## 方法 2: 使用脚本（自动化）

### 步骤 1: 获取 API Token

1. 访问: https://dash.cloudflare.com/profile/api-tokens
2. 点击 "Create Token"
3. 使用模板 "Edit zone DNS" 或创建自定义权限：
   - Zone.Zone: Read
   - Zone.Cache Purge: Purge
4. 复制生成的 Token

### 步骤 2: 设置环境变量

```bash
export CF_API_TOKEN='your_token_here'
```

**注意**: 将 `your_token_here` 替换为您实际的 Token

### 步骤 3: 运行脚本

```bash
cd /home/sardenesy/projects/chinahuib2b
chmod +x purge-cdn-cache.sh
./purge-cdn-cache.sh
```

脚本会：
- ✅ 自动获取 Zone ID
- ✅ 请求确认
- ✅ 清除所有缓存
- ✅ 显示结果

---

## 🧪 验证修复

清除缓存后，请执行以下测试：

### 测试 1: Chrome 浏览器（启用代理）

1. **硬刷新页面**
   ```
   Windows/Linux: Ctrl + Shift + R
   Mac: Cmd + Shift + R
   ```

2. **访问网站**
   ```
   https://chinahuib2b.top/en
   ```

3. **点击 Seller Portal**
   ```
   应该正常跳转到登录页面
   无 React Error #31
   ```

### 测试 2: Firefox 浏览器（禁用代理）

```
访问: https://chinahuib2b.top/en/auth/login
应该正常加载
```

### 测试 3: 命令行测试

```bash
# 测试重定向
curl -I https://chinahuib2b.top/seller
# 应该返回: HTTP/2 307, location: /en/auth/login

# 测试登录页面
curl -I https://chinahuib2b.top/en/auth/login
# 应该返回: HTTP/2 200 OK
```

---

## ⏱️ 时间线

| 时间 | 操作 | 状态 |
|------|------|------|
| T+0 分钟 | 清除 CDN 缓存 | ✅ 立即完成 |
| T+1-5 分钟 | CDN 节点开始更新 | 🔄 进行中 |
| T+5-10 分钟 | 全球大部分节点更新 | ✅ 基本完成 |
| T+10-15 分钟 | 所有节点完全更新 | ✅ 完全完成 |

---

## ❓ 常见问题

### Q1: 清除缓存会影响网站性能吗？

**A**: 会有短暂影响。清除后，CDN 需要重新从服务器获取内容，首次访问会稍慢。但几分钟后会恢复正常，并且用户会获得最新版本。

### Q2: 我需要多久清除一次缓存？

**A**: 
- 代码更新后：必须清除
- 内容更新：可选（HTML 已配置为不缓存）
- 定期维护：建议每周一次

### Q3: 可以只清除特定文件的缓存吗？

**A**: 可以。在 Cloudflare Dashboard 中选择 "Custom Purge"，输入具体 URL。但本次问题建议清除所有缓存。

### Q4: 清除缓存后还是看到旧版本怎么办？

**A**: 
1. 确认已硬刷新浏览器（Ctrl+Shift+R）
2. 尝试无痕模式
3. 等待更长时间（最多 30 分钟）
4. 检查浏览器扩展是否阻止刷新

---

## 🎯 预期结果

清除缓存后，您应该看到：

✅ **Chrome（启用代理）**
- 访问 `/en` → 点击 "Seller Portal" → 正常跳转
- 控制台无 React Error #31
- 页面正常加载

✅ **Firefox（禁用代理）**
- 继续正常工作
- 无变化

✅ **全球用户**
- 无论地理位置
- 无论是否使用代理
- 都能正常访问

---

## 📞 如果问题仍然存在

请检查：

1. **PM2 状态**
   ```bash
   pm2 status
   # 应该显示: chinahuib2b-next | online
   ```

2. **PM2 日志**
   ```bash
   pm2 logs chinahuib2b-next --lines 20
   # 应该无错误
   ```

3. **Nginx 状态**
   ```bash
   sudo systemctl status nginx
   # 应该显示: active (running)
   ```

4. **本地测试**
   ```bash
   curl http://localhost:3001/seller
   # 应该返回 307 重定向
   ```

---

## 💡 提示

- **最佳时间**: 在用户较少时清除缓存（如凌晨）
- **通知用户**: 如果可能，提前通知用户可能有短暂延迟
- **监控**: 清除后监控服务器负载
- **备份**: 重要更新前先备份

---

**祝您顺利解决问题！** 🎉

如有任何疑问，请随时联系。
