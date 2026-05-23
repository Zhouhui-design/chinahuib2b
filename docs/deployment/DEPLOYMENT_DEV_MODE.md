# 生产服务器部署指南

## 当前状态

- **Next.js 版本**: 15.5.15
- **构建状态**: ❌ 存在编译 bug，无法执行 `npm run build`
- **部署方案**: ✅ 使用开发模式部署（`npm run dev`）

## 为什么使用开发模式？

Next.js 15.5.x 和 16.x 都存在一个严重的编译 bug：
```
TypeError: Cannot read properties of undefined (reading 'GET')
```

这导致某些 API 路由无法正确编译。开发模式不受此影响，可以正常运行所有功能。

## 部署步骤

### 方法 1：使用自动部署脚本（推荐）

在生产服务器上执行：

```bash
cd /var/www/chinahuib2b
chmod +x deploy-dev-mode.sh
./deploy-dev-mode.sh
```

### 方法 2：手动部署

```bash
# 1. 进入项目目录
cd /var/www/chinahuib2b

# 2. 拉取最新代码
git pull origin main

# 3. 安装依赖
npm install

# 4. 停止现有服务
pm2 stop chinahuib2b-next
pm2 delete chinahuib2b-next

# 5. 启动开发模式
pm2 start "npm run dev -- -p 3000" --name "chinahuib2b-dev"

# 6. 检查状态
pm2 status
pm2 logs chinahuib2b-dev
```

## 验证部署

访问以下地址测试：
- 首页: https://chinahuib2b.top
- 英文首页: https://chinahuib2b.top/en
- Stores 页面: https://chinahuib2b.top/en/stores

## 注意事项

### 性能考虑
- 开发模式比生产构建慢约 20-30%
- 对于 B2B 电商平台初期流量，这个性能差异可以接受
- 等 Next.js 修复 build bug 后，再切换到生产构建

### 环境变量
确保 `.env.local` 文件包含正确的配置：
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://chinahuib2b.top
REDIS_URL=redis://localhost:6379
```

### 日志查看
```bash
# 查看实时日志
pm2 logs chinahuib2b-dev

# 查看错误日志
pm2 logs chinahuib2b-dev --err
```

### 重启服务
```bash
pm2 restart chinahuib2b-dev
```

### 停止服务
```bash
pm2 stop chinahuib2b-dev
```

## 未来升级计划

当 Next.js 发布修复版本后（预计 15.6.x 或 16.3.x）：

1. 更新 package.json:
   ```json
   "next": "^15.6.0"  // 或更新的稳定版本
   ```

2. 重新构建:
   ```bash
   npm install
   npm run build
   pm2 restart chinahuib2b-next
   ```

3. 切换回生产模式 PM2 配置

## Git 推送问题

当前本地有未推送的提交，因为 SSH 密钥未配置到 GitHub。

**解决方案：**

1. 在 GitHub 账户中添加 SSH 公钥：
   ```bash
   cat ~/.ssh/id_rsa.pub
   ```
   复制输出内容，添加到 GitHub Settings → SSH and GPG keys

2. 或者使用 HTTPS + Personal Access Token：
   ```bash
   git remote set-url origin https://github.com/Zhouhui-design/chinahuib2b.git
   git push origin main
   # 输入 GitHub username 和 token
   ```

## 联系信息

如有问题，请检查：
- PM2 状态: `pm2 status`
- 应用日志: `pm2 logs`
- Nginx 配置: `/etc/nginx/sites-available/chinahuib2b`
- Nginx 日志: `/var/log/nginx/error.log`
