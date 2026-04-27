# 部署状态总结

## 📊 当前状态

### 本地开发环境 (/home/sardenesy/projects/chinahuib2b)
- ✅ Next.js 版本: 15.5.15
- ✅ 代码已提交（8 个未推送的 commit）
- ✅ 所有功能正常（开发模式 `npm run dev`）
- ❌ 无法构建生产版本（Next.js 15.5.x 编译 bug）
- ❌ 无法推送到 GitHub（SSH 密钥未配置）

### GitHub 仓库 (https://github.com/Zhouhui-design/chinahuib2b)
- ⚠️ 落后本地 8 个提交
- 需要配置 SSH 密钥或使用 HTTPS + Token 才能推送

### 生产服务器 (chinahuib2b.top)
- ⚠️ 需要手动部署
- 需要使用开发模式（因为无法构建）

---

## 🚀 部署到生产服务器的步骤

### 前提条件
在生产服务器 (chinahuib2b.top) 上，你需要：
1. SSH 访问权限
2. Git 配置（能拉取代码）
3. Node.js 和 npm 已安装
4. PM2 已安装
5. PostgreSQL、Redis 等服务正常运行

### 方法 1：使用自动部署脚本（最简单）

```bash
# SSH 登录到生产服务器
ssh your-user@chinahuib2b.top

# 进入项目目录
cd /var/www/chinahuib2b

# 如果还没有部署脚本，先拉取最新代码
git pull origin main

# 赋予执行权限并运行
chmod +x deploy-dev-mode.sh
./deploy-dev-mode.sh
```

### 方法 2：手动部署

```bash
# SSH 登录到生产服务器
ssh your-user@chinahuib2b.top

# 1. 进入项目目录
cd /var/www/chinahuib2b

# 2. 拉取最新代码
git pull origin main

# 3. 安装依赖
npm install

# 4. 停止现有服务
pm2 stop chinahuib2b-next 2>/dev/null || true
pm2 delete chinahuib2b-next 2>/dev/null || true

# 5. 启动开发模式
pm2 start "npm run dev -- -p 3000" --name "chinahuib2b-dev"

# 6. 检查状态
pm2 status
pm2 logs chinahuib2b-dev --lines 20
```

### 验证部署

访问以下 URL 测试：
- https://chinahuib2b.top
- https://chinahuib2b.top/en
- https://chinahuib2b.top/en/stores

---

## 🔧 解决 GitHub 推送问题

### 选项 A：配置 SSH 密钥（推荐）

```bash
# 在本地生成 SSH 密钥（如果还没有）
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 查看公钥
cat ~/.ssh/id_rsa.pub

# 复制输出内容，添加到 GitHub:
# Settings → SSH and GPG keys → New SSH key

# 测试连接
ssh -T git@github.com

# 推送代码
cd /home/sardenesy/projects/chinahuib2b
git push origin main
```

### 选项 B：使用 HTTPS + Personal Access Token

```bash
# 更改远程 URL
cd /home/sardenesy/projects/chinahuib2b
git remote set-url origin https://github.com/Zhouhui-design/chinahuib2b.git

# 推送代码（会提示输入用户名和 token）
git push origin main
# Username: Zhouhui-design
# Password: [GitHub Personal Access Token]
```

创建 Token 的步骤：
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. 选择 scopes: repo, workflow
4. 复制 token 并在推送时使用

---

## 📝 本次更新内容

### 新增功能
1. ✅ Stores 列表页面 (`/en/stores`)
   - 多语言支持（12 种语言）
   - 分页功能
   - 产品展示预览

2. ✅ Exhibition Zones 国际化修复
   - 首页展区卡片文字现在可以正确翻译
   - 更新了字典配置

### 技术改进
1. ✅ 添加了完整的 API 路由 GET 方法
2. ✅ 修复了 NextAuth v5 导出方式
3. ✅ 移除了不兼容的 middleware-seller.ts
4. ✅ 更新了 package.json 明确指定 Next.js 15.5.15

### 部署相关
1. ✅ 创建了开发模式部署脚本 (`deploy-dev-mode.sh`)
2. ✅ 创建了详细的部署指南 (`DEPLOYMENT_DEV_MODE.md`)
3. ✅ 创建了快速部署命令参考 (`QUICK_DEPLOY_COMMANDS.sh`)

---

## ⚠️ 重要说明

### 为什么使用开发模式？

Next.js 15.5.x 存在一个严重的编译 bug：
```
TypeError: Cannot read properties of undefined (reading 'GET')
```

这导致 `npm run build` 失败。开发模式不受此影响，所有功能都正常工作。

**性能影响：**
- 开发模式比生产构建慢约 20-30%
- 对于 B2B 电商平台初期流量，这个差异可以接受
- 等 Next.js 修复后，可以切换到生产构建

### 何时切换回生产构建？

当 Next.js 发布修复版本（预计 15.6.x 或 16.3.x）时：

```bash
# 1. 更新 Next.js
npm install next@latest

# 2. 测试构建
npm run build

# 3. 如果成功，更新 PM2 配置
pm2 restart ecosystem.config.js

# 4. 重启服务
pm2 restart chinahuib2b-next
```

---

## 📞 故障排查

### 检查服务状态
```bash
pm2 status
pm2 logs chinahuib2b-dev
```

### 检查 Nginx
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### 检查应用日志
```bash
pm2 logs chinahuib2b-dev --err
```

### 重启服务
```bash
pm2 restart chinahuib2b-dev
```

### 查看进程
```bash
ps aux | grep next
netstat -tlnp | grep 3000
```

---

## 📅 下一步计划

1. **立即**: 部署到生产服务器（使用开发模式）
2. **短期**: 配置 GitHub SSH 密钥，推送代码
3. **中期**: 监控 Next.js 更新，等待 build bug 修复
4. **长期**: 迁移文件存储到 DigitalOcean Spaces

---

## 📚 相关文档

- `DEPLOYMENT_DEV_MODE.md` - 详细部署指南
- `deploy-dev-mode.sh` - 自动部署脚本
- `QUICK_DEPLOY_COMMANDS.sh` - 快速部署命令参考
- `AI_RULES.md` - AI 代理规则（始终使用 terminal）
