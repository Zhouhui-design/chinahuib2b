# 🔧 DNS 配置和服务器设置指南

## 📋 问题诊断结果

### 当前状态
- ✅ 服务器 IP: `167.99.134.217` (DigitalOcean Frankfurt)
- ❌ DNS 解析: 失败 (SERVFAIL)
- ❌ Nginx: 未安装/未运行
- ❌ 应用: 未启动 (PM2 空列表)

### 根本原因
1. **DNS 记录未更新** - `chinahuib2b.top` 仍指向旧服务器
2. **服务器环境未配置** - 缺少 Nginx 和应用部署

---

## 🚀 解决方案

### 步骤 1: 更新 DigitalOcean DNS 记录 ⭐ 最重要

#### 1.1 登录 DigitalOcean Control Panel
访问: https://cloud.digitalocean.com/networking/domains

#### 1.2 找到 chinahuib2b.top 域名

#### 1.3 更新 A 记录

**需要修改的记录**:

| 类型 | 名称 | 当前值（旧） | 新值 | TTL |
|------|------|-------------|------|-----|
| A | @ | [旧服务器IP] | **167.99.134.217** | 3600 |
| A | www | [旧服务器IP] | **167.99.134.217** | 3600 |

**操作步骤**:
1. 点击域名 `chinahuib2b.top`
2. 找到 A 记录（@ 和 www）
3. 点击编辑按钮
4. 将 IP 地址改为 `167.99.134.217`
5. 保存更改

#### 1.4 验证 DNS 传播

等待 5-30 分钟后，运行以下命令验证：

```bash
# 查询 DNS
dig chinahuib2b.top +short

# 应该返回: 167.99.134.217

# 或使用在线工具
# https://dnschecker.org/
```

---

### 步骤 2: 安装和配置 Nginx

```bash
# SSH 连接到服务器
ssh root@167.99.134.217

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Nginx
sudo apt install nginx -y

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证 Nginx 运行
sudo systemctl status nginx
```

---

### 步骤 3: 配置 Nginx for chinahuib2b.top

#### 3.1 创建 Nginx 配置文件

```bash
sudo nano /etc/nginx/sites-available/chinahuib2b.top
```

粘贴以下内容：

```nginx
# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name chinahuib2b.top www.chinahuib2b.top;
    return 301 https://$server_name$request_uri;
}

# HTTPS main configuration
server {
    listen 443 ssl http2;
    server_name chinahuib2b.top www.chinahuib2b.top;

    # SSL certificate (will be configured by Certbot)
    ssl_certificate     /etc/letsencrypt/live/chinahuib2b.top/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chinahuib2b.top/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/chinahuib2b-access.log;
    error_log  /var/log/nginx/chinahuib2b-error.log;

    # Client max upload size
    client_max_body_size 25M;

    # Reverse proxy to Next.js
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

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff2|woff|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

保存并退出（Ctrl+X, Y, Enter）

#### 3.2 启用站点

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/chinahuib2b.top /etc/nginx/sites-enabled/

# 删除默认站点（如果存在）
sudo rm /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx
```

---

### 步骤 4: 安装 SSL 证书（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书
sudo certbot --nginx -d chinahuib2b.top -d www.chinahuib2b.top

# 按照提示输入邮箱并接受条款

# 设置自动续期
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

### 步骤 5: 部署应用

#### 5.1 进入项目目录

```bash
cd /home/sardenesy/projects/chinahuib2b
```

#### 5.2 安装依赖

```bash
npm ci --production
```

#### 5.3 构建应用

```bash
npm run build
```

#### 5.4 使用 PM2 启动应用

```bash
# 如果 PM2 未安装
npm install -g pm2

# 启动应用
pm2 start npm --name "chinahuib2b" -- start

# 或者使用 ecosystem.config.js（如果有）
pm2 start ecosystem.config.js

# 保存 PM2 进程列表
pm2 save

# 设置开机自启
pm2 startup systemd -u sardenesy --hp /home/sardenesy
```

#### 5.5 验证应用运行

```bash
# 检查 PM2 状态
pm2 list

# 查看日志
pm2 logs chinahuib2b

# 测试本地访问
curl http://localhost:3000/api/health
```

---

### 步骤 6: 防火墙配置

```bash
# 允许 HTTP 和 HTTPS
sudo ufw allow 'Nginx Full'

# 允许 SSH
sudo ufw allow OpenSSH

# 启用防火墙
sudo ufw enable

# 验证规则
sudo ufw status
```

---

## ✅ 验证清单

完成以上步骤后，按顺序验证：

### 1. DNS 解析
```bash
dig chinahuib2b.top +short
# 应该返回: 167.99.134.217
```

### 2. Nginx 运行
```bash
sudo systemctl status nginx
# 应该显示: active (running)
```

### 3. 应用运行
```bash
pm2 list
# 应该显示 chinahuib2b 状态为 online
```

### 4. HTTP 访问
```bash
curl -I http://chinahuib2b.top
# 应该返回 301 重定向到 HTTPS
```

### 5. HTTPS 访问
```bash
curl -I https://chinahuib2b.top
# 应该返回 200 或 307
```

### 6. 浏览器访问
打开浏览器访问: https://chinahuib2b.top

---

## 🔍 故障排除

### 问题 1: DNS 仍然无法解析

**可能原因**:
- DNS 记录未正确更新
- TTL 缓存未过期

**解决方案**:
1. 再次检查 DigitalOcean DNS 设置
2. 等待更长时间（最多 48 小时）
3. 清除本地 DNS 缓存：
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   
   # Windows
   ipconfig /flushdns
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

### 问题 2: Nginx 启动失败

**检查错误日志**:
```bash
sudo journalctl -u nginx -f
sudo cat /var/log/nginx/error.log
```

**常见错误**:
- 端口被占用: `sudo lsof -i :80`
- 配置语法错误: `sudo nginx -t`

### 问题 3: 应用无法启动

**检查日志**:
```bash
pm2 logs chinahuib2b --lines 100
```

**常见问题**:
- 端口冲突: 确保 3000 端口未被占用
- 环境变量缺失: 检查 `.env.local` 文件
- 依赖问题: 运行 `npm install`

### 问题 4: SSL 证书失败

**检查 Certbot 日志**:
```bash
sudo cat /var/log/letsencrypt/letsencrypt.log
```

**确保**:
- DNS 已正确解析
- 80 端口可访问（Certbot 需要验证）
- 防火墙允许 80 端口

---

## 📞 快速修复脚本

创建一个自动化脚本来完成所有步骤：

```bash
#!/bin/bash
# deploy-chinahuib2b.sh

set -e

echo "🚀 Starting deployment..."

# 1. Update system
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# 2. Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# 3. Copy Nginx config
echo "⚙️ Configuring Nginx..."
sudo cp nginx-chinahuib2b.conf /etc/nginx/sites-available/chinahuib2b.top
sudo ln -sf /etc/nginx/sites-available/chinahuib2b.top /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 4. Install SSL
echo "🔒 Installing SSL certificate..."
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d chinahuib2b.top -d www.chinahuib2b.top --non-interactive --agree-tos -m your-email@example.com

# 5. Deploy app
echo "📱 Deploying application..."
cd /home/sardenesy/projects/chinahuib2b
npm ci --production
npm run build

# 6. Start with PM2
echo "🔄 Starting application..."
pm2 delete chinahuib2b || true
pm2 start npm --name "chinahuib2b" -- start
pm2 save

# 7. Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo "✅ Deployment complete!"
echo "🌐 Visit: https://chinahuib2b.top"
```

使用方法：
```bash
chmod +x deploy-chinahuib2b.sh
./deploy-chinahuib2b.sh
```

---

## 🎯 下一步行动

1. **立即执行**: 更新 DigitalOcean DNS 记录（最重要！）
2. **等待 DNS 传播**: 5-30 分钟
3. **执行部署步骤**: 按照上述步骤 2-6
4. **验证**: 使用验证清单检查所有组件
5. **测试**: 在浏览器中访问网站

---

## 📊 预期时间线

| 步骤 | 预计时间 |
|------|---------|
| 更新 DNS | 5 分钟 |
| DNS 传播 | 5-30 分钟 |
| 安装 Nginx | 5 分钟 |
| 配置 Nginx | 5 分钟 |
| 安装 SSL | 5 分钟 |
| 部署应用 | 10 分钟 |
| **总计** | **30-60 分钟** |

---

**重要提醒**: 
- DNS 更新是最关键的步骤
- 确保在 DigitalOcean 控制面板中正确配置
- 如果遇到任何问题，请检查日志文件
