# 🚨 紧急修复：chinahuib2b.top 无法访问

## 🔍 问题诊断结果

**当前状态**:
- ✅ 服务器 IP: `167.99.134.217` (DigitalOcean Frankfurt)
- ❌ **DNS 解析**: 失败 - 域名未指向当前服务器
- ❌ **Nginx**: 未安装
- ❌ **应用**: 未启动

---

## ⚡ 快速修复步骤（30分钟）

### 第 1 步：更新 DNS 记录（最重要！）⭐⭐⭐

**立即执行此步骤**，因为 DNS 传播需要时间。

#### 操作步骤：

1. **登录 DigitalOcean Control Panel**
   ```
   https://cloud.digitalocean.com/networking/domains
   ```

2. **找到 chinahuib2b.top 域名**

3. **更新 A 记录**
   
   找到以下两条 A 记录并修改：
   
   | 记录类型 | 名称 | 旧值 | **新值** | TTL |
   |---------|------|------|----------|-----|
   | A | @ | [旧IP] | **167.99.134.217** | 3600 |
   | A | www | [旧IP] | **167.99.134.217** | 3600 |

4. **保存更改**

5. **等待 DNS 传播**（5-30 分钟）

#### 验证 DNS 是否生效：

```bash
# 在终端运行
dig chinahuib2b.top +short

# 应该返回: 167.99.134.217
```

或使用在线工具：https://dnschecker.org/

---

### 第 2 步：安装和配置 Nginx

SSH 连接到服务器后执行：

```bash
# 安装 Nginx
sudo apt update
sudo apt install nginx -y

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证运行
sudo systemctl status nginx
```

---

### 第 3 步：配置 Nginx

创建配置文件：

```bash
sudo nano /etc/nginx/sites-available/chinahuib2b.top
```

粘贴以下内容（使用项目中的现有配置）：

```nginx
server {
    listen 80;
    server_name chinahuib2b.top www.chinahuib2b.top;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name chinahuib2b.top www.chinahuib2b.top;

    # SSL 证书路径（稍后由 Certbot 自动配置）
    ssl_certificate     /etc/letsencrypt/live/chinahuib2b.top/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chinahuib2b.top/privkey.pem;
    
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 日志
    access_log /var/log/nginx/chinahuib2b-access.log;
    error_log  /var/log/nginx/chinahuib2b-error.log;

    client_max_body_size 25M;

    # 反向代理到 Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

保存并启用：

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/chinahuib2b.top /etc/nginx/sites-enabled/

# 删除默认站点
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重新加载
sudo systemctl reload nginx
```

---

### 第 4 步：安装 SSL 证书

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书（DNS 必须已正确解析）
sudo certbot --nginx -d chinahuib2b.top -d www.chinahuib2b.top

# 按照提示操作：
# 1. 输入邮箱地址
# 2. 同意服务条款 (A)
# 3. 选择是否分享邮箱 (Y/N)
# 4. 自动配置 HTTPS (2 - Redirect)
```

---

### 第 5 步：启动应用

```bash
# 进入项目目录
cd /home/sardenesy/projects/chinahuib2b

# 构建应用
npm run build

# 使用 PM2 启动
pm2 start npm --name "chinahuib2b" -- start

# 保存进程列表
pm2 save

# 设置开机自启
pm2 startup systemd -u sardenesy --hp /home/sardenesy

# 验证运行
pm2 list
```

---

### 第 6 步：配置防火墙

```bash
# 安装 UFW（如果未安装）
sudo apt install ufw -y

# 允许必要端口
sudo ufw allow 'Nginx Full'  # 80, 443
sudo ufw allow OpenSSH        # 22

# 启用防火墙
sudo ufw --force enable

# 验证规则
sudo ufw status
```

---

## ✅ 验证清单

按顺序检查：

### 1. DNS 解析
```bash
dig chinahuib2b.top +short
# 应返回: 167.99.134.217
```

### 2. Nginx 运行
```bash
sudo systemctl status nginx
# 应显示: active (running)
```

### 3. 应用运行
```bash
pm2 list
# 应显示: chinahuib2b online
```

### 4. HTTP 重定向
```bash
curl -I http://chinahuib2b.top
# 应返回: 301 Moved Permanently
```

### 5. HTTPS 访问
```bash
curl -I https://chinahuib2b.top
# 应返回: 200 OK 或 307 Temporary Redirect
```

### 6. 浏览器测试
打开浏览器访问：**https://chinahuib2b.top**

---

## 🔧 自动化脚本（可选）

如果想一键完成所有步骤，运行：

```bash
cd /home/sardenesy/projects/chinahuib2b
chmod +x quick-fix.sh
./quick-fix.sh
```

**注意**：仍需先手动更新 DNS 记录！

---

## 🆘 常见问题

### Q1: DNS 更新后仍然无法访问？

**A**: DNS 传播需要时间，最多 48 小时。可以：
1. 清除本地 DNS 缓存
2. 使用不同的网络测试
3. 使用在线工具检查：https://dnschecker.org/

### Q2: Certbot 失败？

**A**: 确保：
- DNS 已正确解析到当前服务器
- 80 端口可访问（防火墙允许）
- Nginx 正在运行

### Q3: 应用启动失败？

**A**: 检查日志：
```bash
pm2 logs chinahuib2b --lines 50
```

常见错误：
- 端口被占用：`sudo lsof -i :3000`
- 环境变量缺失：检查 `.env.local`
- 依赖问题：`npm install`

### Q4: Nginx 启动失败？

**A**: 检查错误：
```bash
sudo journalctl -u nginx -f
sudo nginx -t
```

---

## 📞 需要帮助？

如果遇到问题：

1. **查看详细指南**: `DNS_FIX_GUIDE.md`
2. **运行诊断脚本**: `bash check-dns-and-server.sh`
3. **检查日志**:
   - Nginx: `/var/log/nginx/error.log`
   - 应用: `pm2 logs chinahuib2b`
   - Certbot: `/var/log/letsencrypt/letsencrypt.log`

---

## ⏱️ 预计时间线

| 步骤 | 操作时间 | 等待时间 |
|------|---------|---------|
| 1. 更新 DNS | 5 分钟 | 5-30 分钟 |
| 2. 安装 Nginx | 5 分钟 | - |
| 3. 配置 Nginx | 5 分钟 | - |
| 4. 安装 SSL | 5 分钟 | - |
| 5. 启动应用 | 10 分钟 | - |
| 6. 配置防火墙 | 2 分钟 | - |
| **总计** | **32 分钟** | **5-30 分钟** |

**实际总时间**: 约 40-60 分钟（包括 DNS 传播）

---

## 🎯 立即行动

1. ✅ **现在**: 登录 DigitalOcean 更新 DNS
2. ⏳ **等待**: 5-30 分钟让 DNS 传播
3. 🚀 **然后**: 执行步骤 2-6
4. ✨ **完成**: 网站恢复访问！

**记住**: DNS 更新是最关键的步骤，其他步骤可以快速完成。
