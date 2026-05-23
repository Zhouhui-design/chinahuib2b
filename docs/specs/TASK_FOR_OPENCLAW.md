# 📋 任务说明：清除 chinahuib2b.top 缓存并验证修复

**执行人**: OpenClaw (阿杰)  
**优先级**: 🔴 高（影响全球用户访问商家门户）  
**预计耗时**: 15-30 分钟  

---

## 🎯 任务背景

chinahuib2b.top 的 `/seller` 页面出现 React Error #31 错误，代码已修复并重新部署，但**浏览器和 CDN 缓存了旧版本的 JavaScript 文件**，导致：

- ✅ **国内网络（无代理）**：正常打开
- ❌ **使用代理时**：显示 "Application error: a client-side exception has occurred"

这是因为代理可能连接到不同地区的 CDN 节点，这些节点仍缓存着旧版本。

---

## ✅ 已完成的工作

以下工作已由 LINGMA AI 完成，您**不需要**再做：

1. ✅ 修复代码 Bug（Prisma 聚合对象处理）
2. ✅ 添加环境变量（NEXTAUTH_SECRET 等）
3. ✅ 重新构建应用（新构建 ID: `NodtF7l6Vg2sfx4oNg8Rz`）
4. ✅ 重启 PM2 应用服务
5. ✅ 更新 Nginx 配置文件（添加防缓存头）
6. ✅ 创建测试脚本和文档

---

## 🔧 需要您执行的任务

### 任务 1: 重新加载 Nginx 配置 ⭐ 最重要

#### 步骤 1.1: 查找 Nginx 进程

```bash
ps aux | grep nginx
```

期望看到类似输出：
```
root     12345  0.0  0.1  xxxxx  xxxxx  ?  Ss   May20   0:00 nginx: master process /usr/sbin/nginx
www-data 12346  0.0  0.2  xxxxx  xxxxx  ?  S    May20   0:01 nginx: worker process
```

#### 步骤 1.2: 重新加载配置

**方法 A**（推荐）- 使用 systemd：
```bash
sudo systemctl reload nginx
```

**方法 B** - 使用 service：
```bash
sudo service nginx reload
```

**方法 C** - 发送 HUP 信号（如果上面两个都不行）：
```bash
# 找到 master 进程的 PID（第一行的数字，例如 12345）
sudo kill -HUP <master-pid>
```

**方法 D** - 直接重启（如果 reload 不行）：
```bash
sudo systemctl restart nginx
# 或
sudo service nginx restart
```

#### 步骤 1.3: 验证 Nginx 状态

```bash
# 检查 Nginx 是否正常运行
sudo systemctl status nginx

# 或
ps aux | grep nginx | grep -v grep
```

确保看到 nginx 进程正在运行。

---

### 任务 2: 清除 Cloudflare CDN 缓存（如果使用）

#### 检查是否使用 Cloudflare

```bash
# 查看 .env.local 中是否有 Cloudflare 配置
grep CLOUDFLARE /home/sardenesy/projects/chinahuib2b/.env.local
```

如果看到类似输出，说明配置了 Cloudflare：
```
CLOUDFLARE_API_KEY=xxx
CLOUDFLARE_ACCOUNT_ID=xxx
```

#### 选项 A: 使用自动脚本（推荐）

```bash
cd /home/sardenesy/projects/chinahuib2b

# 首先检查是否有 Zone ID
grep CLOUDFLARE_ZONE_ID_CHINAHUIB2B .env.local

# 如果没有，需要手动添加到 .env.local
# 获取 Zone ID 的方法：
# 1. 登录 https://dash.cloudflare.com/
# 2. 选择 chinahuib2b.top
# 3. 右侧 Overview 页面底部找到 "Zone ID"
# 4. 复制后执行：
echo "CLOUDFLARE_ZONE_ID_CHINAHUIB2B=你的zone_id" >> .env.local

# 然后运行清除脚本
./clear-cdn-cache.sh
# 脚本会提示输入 Cloudflare 邮箱地址
```

#### 选项 B: 手动清除（更简单）

1. 登录 https://dash.cloudflare.com/
2. 选择域名 `chinahuib2b.top`
3. 进入左侧菜单 **Caching** → **Configuration**
4. 找到 **Purge Cache** 部分
5. 点击 **Custom Purge**
6. 在输入框中输入以下 URL（每行一个）：
   ```
   https://chinahuib2b.top/seller
   https://chinahuib2b.top/_next/static/*
   https://chinahuib2b.top/
   ```
7. 点击 **Purge** 按钮
8. 等待确认消息

---

### 任务 3: 验证修复

#### 测试 1: 本地测试（绕过代理）

```bash
cd /home/sardenesy/projects/chinahuib2b
./test-local.sh /seller
```

**期望输出**：
```
HTTP/1.1 307 Temporary Redirect
```

这表示路由正常工作，重定向到登录页面（因为未登录）。

#### 测试 2: 检查响应头

```bash
# 检查 HTML 页面的缓存控制头
curl -I https://chinahuib2b.top/seller 2>&1 | grep -i cache
```

**期望看到**：
```
cache-control: no-cache, no-store, must-revalidate
pragma: no-cache
expires: 0
```

#### 测试 3: 实际浏览器测试

1. **无代理模式**：
   - 打开 Chrome 无痕窗口
   - 访问 https://chinahuib2b.top/seller
   - 应该重定向到登录页面（不再显示错误）

2. **有代理模式**：
   - 开启代理
   - 打开新的 Chrome 无痕窗口
   - 访问 https://chinahuib2b.top/seller
   - 应该同样重定向到登录页面

#### 测试 4: 检查 Console 错误

在浏览器中：
1. 按 F12 打开 DevTools
2. 切换到 **Console** 标签
3. 访问 https://chinahuib2b.top/seller
4. **不应该**看到 "Minified React error #31" 错误

---

## 📊 成功标准

✅ Nginx 配置已重新加载  
✅ Cloudflare CDN 缓存已清除（如果使用）  
✅ `/seller` 页面返回 307 重定向（不是 500 错误）  
✅ 浏览器 Console 没有 React Error #31  
✅ 有代理和无代理都能正常访问  

---

## 🆘 常见问题

### Q1: 找不到 nginx 命令怎么办？

```bash
# 尝试完整路径
sudo /usr/sbin/nginx -t
sudo /usr/sbin/nginx -s reload

# 或者查找 nginx 位置
which nginx
find / -name "nginx" -type f 2>/dev/null | head -5
```

### Q2: systemctl 或 service 命令不可用？

这说明可能不是标准的 systemd 安装，尝试：
```bash
# 直接找到 nginx 进程并重启
ps aux | grep nginx
sudo kill -HUP <master-pid>
```

### Q3: 没有配置 Cloudflare 怎么办？

如果没有使用 Cloudflare，跳过任务 2，只执行任务 1 和任务 3。

### Q4: 清除缓存后仍然有错误？

可能需要等待几分钟让 CDN 完全刷新，或者：
1. 强制清除浏览器缓存（Ctrl+Shift+R）
2. 尝试不同的代理节点
3. 检查 PM2 应用是否正常运行：`pm2 status`

---

## 📝 交付物

完成任务后，请提供：

1. ✅ Nginx 重新加载的命令输出
2. ✅ CDN 缓存清除的截图或确认
3. ✅ 测试结果（有代理和无代理的访问情况）
4. ✅ 是否还有任何错误

---

## 📞 联系方式

如有问题，请联系：
- 项目所有者：Zhouhui-design
- GitHub: https://github.com/Zhouhui-design/chinahuib2b

---

## 📚 参考文档

以下文档已创建在项目目录中：

- `SELLER_PORTAL_GLOBAL_FIX.md` - 完整的修复指南
- `SELLER_PORTAL_FIX_REPORT.md` - 技术修复报告
- `clear-cdn-cache.sh` - CDN 缓存清除脚本
- `test-local.sh` - 本地测试脚本

所有文档位于：`/home/sardenesy/projects/chinahuib2b/`

---

**祝顺利！这是一个关键修复，完成后将解决全球用户的访问问题。** 🚀
