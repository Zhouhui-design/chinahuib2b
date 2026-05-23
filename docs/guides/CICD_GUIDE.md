# 🚀 CI/CD 流水线指南

## ✅ 已完成的自动化部署系统

### 1. GitHub Actions CI/CD 流水线

**文件**: `.github/workflows/ci-cd.yml` (285行)

#### 流水线架构

```
Push to main/develop
        │
        ├─→ Job 1: Test & Lint
        │   ├─ Setup Node.js 20
        │   ├─ Install dependencies
        │   ├─ Run linter
        │   ├─ Type check (TypeScript)
        │   ├─ Run tests
        │   └─ Build project
        │
        ├─→ Job 2: Security Scan
        │   ├─ npm audit
        │   └─ Trivy vulnerability scanner
        │
        ├─→ Job 3: Build Docker Image (main only)
        │   ├─ Build multi-stage Docker image
        │   └─ Push to GitHub Container Registry
        │
        └─→ Job 4: Deploy to Production (main only)
            ├─ SSH to server
            ├─ Pull latest code
            ├─ Run migrations
            ├─ Build application
            ├─ Restart PM2
            └─ Health check
```

---

### 2. Docker 容器化配置

#### Dockerfile (多阶段构建)

**文件**: `Dockerfile` (61行)

**特点**:
- ✅ **多阶段构建**: 减小最终镜像大小
- ✅ **Alpine Linux**: 轻量级基础镜像
- ✅ **非 root 用户**: 安全最佳实践
- ✅ **健康检查**: 自动监控容器状态
- ✅ **资源限制**: CPU 和内存限制

**构建阶段**:
```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

#### Docker Compose

**文件**: `docker-compose.yml` (122行)

**服务组成**:
1. **app** - Next.js 应用
2. **postgres** - PostgreSQL 数据库
3. **redis** - Redis 缓存
4. **nginx** - 反向代理（可选）

**资源配置**:
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

**健康检查**:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
  timeout: 5s
  retries: 5
```

---

### 3. 环境配置

#### .env.example

创建 `.env.production` 文件：

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/chinahuib2b"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="https://chinahuib2b.top"

# DigitalOcean Spaces
DO_SPACES_ACCESS_KEY="your-access-key"
DO_SPACES_SECRET_KEY="your-secret-key"
DO_SPACES_ENDPOINT="https://sgp1.digitaloceanspaces.com"
DO_SPACES_BUCKET="global-expo-storage"

# Server
NODE_ENV=production
PORT=3000
```

#### GitHub Secrets

在 GitHub 仓库设置中添加以下 secrets：

| Secret | 说明 | 示例 |
|--------|------|------|
| `SERVER_HOST` | 生产服务器 IP | `139.59.108.156` |
| `SERVER_USER` | SSH 用户名 | `root` |
| `SSH_PRIVATE_KEY` | SSH 私钥 | `-----BEGIN OPENSSH...` |
| `DATABASE_URL` | 生产数据库 URL | `postgresql://...` |
| `REDIS_URL` | Redis 连接 URL | `redis://...` |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | `random-string` |
| `STAGING_SERVER_HOST` | Staging 服务器 IP | （可选） |

---

## 🔧 使用指南

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/yourusername/chinahuib2b.git
cd chinahuib2b

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local

# 4. 运行数据库迁移
npx prisma migrate dev

# 5. 启动开发服务器
npm run dev
```

### Docker 本地测试

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down

# 完全清理（包括数据卷）
docker-compose down -v
```

### 手动部署

```bash
# 1. SSH 到服务器
ssh user@your-server.com

# 2. 进入项目目录
cd /opt/chinahuib2b

# 3. 拉取最新代码
git pull origin main

# 4. 安装依赖
npm ci --production

# 5. 运行迁移
npx prisma migrate deploy

# 6. 构建应用
npm run build

# 7. 重启 PM2
pm2 restart chinahuib2b

# 8. 检查状态
pm2 status
pm2 logs chinahuib2b
```

---

## 📊 CI/CD 触发条件

### 自动触发

| 事件 | 分支 | 触发的 Jobs |
|------|------|-------------|
| Push | `main` | test, security, docker, deploy |
| Push | `develop` | test, security, deploy-staging |
| Pull Request | `main` | test, security |

### 手动触发

在 GitHub Actions 页面可以手动触发工作流。

---

## 🎯 部署策略

### 1. 蓝绿部署（推荐用于零停机）

```bash
# 部署新版本（绿色）
docker-compose -f docker-compose.green.yml up -d

# 健康检查
curl -f http://localhost:3001/api/health

# 切换流量（更新 Nginx 配置）
sudo nginx -s reload

# 停止旧版本（蓝色）
docker-compose -f docker-compose.blue.yml down
```

### 2. 滚动更新

```bash
# 逐个更新容器
docker service update --image myapp:v2 myapp
```

### 3. Canary 部署

```bash
# 部署 10% 流量到新版本
# 监控错误率
# 逐步增加流量
```

---

## 🔍 监控和日志

### 查看部署状态

```bash
# GitHub Actions
https://github.com/yourusername/chinahuib2b/actions

# PM2 监控
pm2 monit

# 应用日志
pm2 logs chinahuib2b

# Docker 日志
docker-compose logs -f app
```

### 健康检查端点

创建 `/api/health` 端点：

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'

export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`
    
    // Check Redis
    await redis.ping()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ok',
        redis: 'ok',
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}
```

---

## 🛡️ 安全最佳实践

### 1. 密钥管理

❌ **不要**:
- 在代码中硬编码密钥
- 提交 `.env` 文件到 Git
- 在日志中打印密钥

✅ **应该**:
- 使用 GitHub Secrets
- 使用环境变量
- 定期轮换密钥

### 2. SSH 密钥

生成专用部署密钥：

```bash
ssh-keygen -t ed25519 -C "deploy@chinahuib2b" -f ~/.ssh/deploy_key
```

将公钥添加到服务器：

```bash
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys
```

将私钥添加到 GitHub Secrets：

```bash
cat ~/.ssh/deploy_key | pbcopy  # macOS
# 或
cat ~/.ssh/deploy_key | xclip -selection clipboard  # Linux
```

### 3. 数据库备份

设置自动备份：

```bash
# crontab -e
0 2 * * * pg_dump -U postgres chinahuib2b > /backups/db_$(date +\%Y\%m\%d).sql
0 2 * * 0 find /backups -name "*.sql" -mtime +7 -delete
```

---

## 🚨 故障排除

### 构建失败

**问题**: TypeScript 类型错误

**解决**:
```bash
npx tsc --noEmit
# 修复所有类型错误
```

### 部署超时

**问题**: SSH 连接超时

**解决**:
- 检查防火墙规则
- 验证 SSH 密钥权限
- 增加 timeout 设置

### 数据库迁移失败

**问题**: Prisma migrate 错误

**解决**:
```bash
# 检查迁移状态
npx prisma migrate status

# 重置数据库（谨慎使用）
npx prisma migrate reset

# 重新应用迁移
npx prisma migrate deploy
```

### Docker 构建缓慢

**优化**:
```dockerfile
# 使用多阶段构建
# 利用层缓存
COPY package*.json ./
RUN npm ci
COPY . .
```

---

## 📈 性能优化

### 1. 构建缓存

GitHub Actions 自动缓存：
- node_modules
- Docker 层
- Next.js 构建输出

### 2. 并行执行

Jobs 并行运行：
- test 和 security 同时执行
- 减少总构建时间

### 3. 增量部署

只部署更改的文件：
```bash
rsync -avz --delete ./ user@server:/opt/chinahuib2b/
```

---

## 📚 参考资源

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [PM2 Process Manager](https://pm2.keymetrics.io/)
