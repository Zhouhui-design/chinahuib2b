# 🚀 Quick Start Guide - Chinahuib2b.top

## 快速开始

### 1️⃣ 本地开发环境

```bash
# 克隆仓库
git clone https://github.com/yourusername/chinahuib2b.git
cd chinahuib2b

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的配置

# 初始化数据库
npx prisma migrate dev
npx prisma db seed  # 可选：填充测试数据

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 2️⃣ Docker 部署

```bash
# 使用 Docker Compose 一键启动
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down
```

### 3️⃣ 生产部署

**方式 A: 手动部署**
```bash
# SSH 到服务器
ssh user@your-server.com

# 进入项目目录
cd /opt/chinahuib2b

# 拉取最新代码
git pull origin main

# 安装依赖
npm ci --production

# 运行迁移
npx prisma migrate deploy

# 构建应用
npm run build

# 重启 PM2
pm2 restart chinahuib2b
```

**方式 B: GitHub Actions 自动部署**
```bash
# Push 到 main 分支会自动触发部署
git push origin main

# 查看部署状态
# https://github.com/yourusername/chinahuib2b/actions
```

---

## 🔧 环境变量配置

创建 `.env.local` 文件：

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/chinahuib2b"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# DigitalOcean Spaces (optional)
DO_SPACES_ACCESS_KEY="your-access-key"
DO_SPACES_SECRET_KEY="your-secret-key"
DO_SPACES_ENDPOINT="https://sgp1.digitaloceanspaces.com"
DO_SPACES_BUCKET="global-expo-storage"

# Error Webhook (optional)
ERROR_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK"
```

---

## 📊 管理后台

### 创建管理员账户

```bash
# 运行脚本创建 admin 用户
./create-admin.sh

# 或手动创建
npx prisma studio
```

### 访问监控仪表板

```bash
# 健康检查
curl http://localhost:3000/api/health

# 监控概览（需要 admin 权限）
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/monitoring?action=overview

# 错误统计
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/monitoring?action=error-stats
```

---

## 🧪 测试

```bash
# 运行 linter
npm run lint

# 类型检查
npx tsc --noEmit

# 运行测试
npm test

# 构建生产版本
npm run build
```

---

## 📚 文档

| 文档 | 说明 |
|------|------|
| [FINAL_COMPLETION_REPORT.md](./FINAL_COMPLETION_REPORT.md) | 完整优化报告 |
| [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) | 安全防护指南 |
| [RATE_LIMITING_GUIDE.md](./RATE_LIMITING_GUIDE.md) | 速率限制指南 |
| [CICD_GUIDE.md](./CICD_GUIDE.md) | CI/CD 流水线指南 |
| [MONITORING_GUIDE.md](./MONITORING_GUIDE.md) | 监控告警指南 |
| [DATABASE_OPTIMIZATION_GUIDE.md](./DATABASE_OPTIMIZATION_GUIDE.md) | 数据库优化指南 |

---

## 🆘 常见问题

### 构建失败

```bash
# 清理缓存
rm -rf .next node_modules
npm install
npm run build
```

### 数据库连接错误

```bash
# 检查 PostgreSQL 是否运行
pg_isready

# 检查环境变量
echo $DATABASE_URL

# 运行迁移
npx prisma migrate deploy
```

### Redis 连接错误

```bash
# 检查 Redis 是否运行
redis-cli ping

# 检查环境变量
echo $REDIS_URL
```

### PM2 进程崩溃

```bash
# 查看日志
pm2 logs chinahuib2b --lines 100

# 重启进程
pm2 restart chinahuib2b

# 查看状态
pm2 status
```

---

## 📞 支持

- **GitHub Issues**: https://github.com/yourusername/chinahuib2b/issues
- **Email**: admin@chinahuib2b.top
- **Documentation**: See docs folder

---

## 🎯 下一步

1. ✅ 完成西班牙语翻译补全（6/102 键）
2. ⏳ 创建前端监控仪表板 UI
3. ⏳ 添加单元测试（目标 80% 覆盖率）
4. ⏳ 集成 A/B 测试框架

---

**Happy Coding! 🚀**
