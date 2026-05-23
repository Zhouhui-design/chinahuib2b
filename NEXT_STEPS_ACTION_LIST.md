# ChinaHuiB2B 项目优化 - 后续行动清单

**日期**: 2026-05-22  
**优先级**: 按顺序执行

---

## 🔴 立即执行（今天，30分钟）

### 1. 更新环境变量安全密钥

```bash
# 步骤 1: 编辑 .env.local
nano .env.local

# 步骤 2: 替换 NEXTAUTH_SECRET
# 将这一行:
NEXTAUTH_SECRET="super-secret-key-change-in-production-12345678"

# 改为:
NEXTAUTH_SECRET="CJqp29SaXO1mWHUr+EKVqfv4DZRCP//Nd4cDFLU3Fjc="

# 步骤 3: 保存并退出 (Ctrl+X, Y, Enter)

# 步骤 4: 重启开发服务器
# Ctrl+C 停止当前服务器
npm run dev

# 步骤 5: 验证登录功能
# 访问 http://localhost:3000/auth/login
# 尝试登录，确保功能正常
```

**参考文档**: `docs/guides/ENVIRONMENT_SECURITY_UPDATE.md`

---

## 🟡 本周执行（2-3小时）

### 2. 修复 TypeScript 核心错误

#### 2.1 修复 Prisma 索引签名访问（30分钟）

**文件**: `prisma.config.ts`

```typescript
// 当前代码（第9行）
const schema = fs.readFileSync(process.env.DATABASE_URL, 'utf-8')

// 修改为
const schema = fs.readFileSync(process.env['DATABASE_URL'], 'utf-8')
```

**文件**: `src/app/(dashboard)/seller/products/[id]/edit/page.tsx`

```typescript
// 查找类似代码
const { id } = params

// 确保已添加 await（Next.js 15 要求）
const { id } = await params
```

#### 2.2 修复 React setState 类型（1小时）

**文件**: `src/app/(dashboard)/buyer/profile/page.tsx`

```typescript
// 问题代码
const [name, setName] = useState<string>()

// 修复为
const [name, setName] = useState<string>('')
```

同样修复：
- `src/app/(dashboard)/seller/products/new/page.tsx`
- `src/app/(dashboard)/seller/settings/page.tsx`

#### 2.3 修复 marketplace 页面（1小时）

**文件**: `src/app/(main)/marketplace/post/page.tsx`

```typescript
// 问题代码
formData.title

// 修复为
formData['title']

// 或者在接口定义中添加索引签名
interface FormData {
  [key: string]: any
  title: string
  description: string
  // ...
}
```

#### 2.4 验证修复

```bash
# 运行 TypeScript 检查
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "\.next/types" | wc -l

# 目标: < 50 个错误
```

---

### 3. 完成 Next.js 15 Params 修复（1小时）

#### 3.1 扫描未修复的文件

```bash
# 查找所有动态路由
find src/app -type d -name '\[*\]'

# 检查是否有未修复的 route.ts
grep -r "{ params }: { params: { " src/app/api --include="*.ts" | grep -v Promise
```

#### 3.2 运行自动化脚本

```bash
# 如果有未修复的文件，运行脚本
node scripts/fix-nextjs15-params.js
```

#### 3.3 手动检查关键文件

检查以下文件是否已修复：
- [ ] `src/app/api/categories/[slug]/route.ts`（如果存在）
- [ ] `src/app/api/sellers/[id]/route.ts`（如果存在）
- [ ] 其他 `[param]/route.ts` 文件

#### 3.4 测试 API 端点

```bash
# 启动开发服务器
npm run dev

# 测试几个 API 端点
curl http://localhost:3000/api/products/xxx
curl http://localhost:3000/api/sellers/xxx
```

---

## 🟢 本月执行（按需）

### 4. 性能优化（半天）

#### 4.1 Lighthouse 审计

```bash
# 构建生产版本
npm run build
npm start

# 在 Chrome 中打开
# DevTools → Lighthouse → Run audit
```

**目标评分**:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

#### 4.2 优化建议

根据 Lighthouse 报告：
- [ ] 优化图片加载（懒加载）
- [ ] 减少 JavaScript bundle 大小
- [ ] 优化 CSS 交付
- [ ] 实施代码分割

---

### 5. 依赖更新（1小时）

```bash
# 检查过时依赖
npm outdated

# 更新次要版本（安全）
npm update

# 更新主要版本（需要测试）
npm install next@latest react@latest
```

**注意**: 更新后运行完整测试套件

---

### 6. Cloudflare API Key 轮换（30分钟）

**步骤**:
1. 登录 Cloudflare Dashboard
2. 创建新的 API Token
3. 更新 `.env.local`
4. 撤销旧 Token

**参考**: `docs/guides/ENVIRONMENT_SECURITY_UPDATE.md`

---

## 🔵 季度执行（长期维护）

### 7. 代码审查和重构

- [ ] 审查复杂组件
- [ ] 提取重复代码
- [ ] 优化数据库查询
- [ ] 改进错误处理

### 8. 安全审计

- [ ] 运行 `npm audit`
- [ ] 检查依赖漏洞
- [ ] 审查认证流程
- [ ] 测试输入验证

### 9. 监控完善

- [ ] 集成 Sentry 错误追踪
- [ ] 设置性能监控
- [ ] 配置 uptime 监控
- [ ] 建立告警机制

---

## 📋 快速检查命令

### 日常检查

```bash
# ESLint
npm run lint

# TypeScript
npx tsc --noEmit

# 构建测试
npm run build
```

### 每周检查

```bash
# 安全审计
npm audit

# 依赖检查
npm outdated

# 文档整理检查
bash scripts/verify-optimization.sh
```

### 每月检查

```bash
# 完整测试
npm test
npm run test:coverage

# 性能审计
# Chrome DevTools → Lighthouse

# 数据库检查
npx prisma migrate status
npx prisma db pull
```

---

## ⚠️ 注意事项

### Git 提交前

```bash
# 1. 确保 .env.local 未提交
git status | grep ".env.local"
# 应该没有输出

# 2. 运行 lint
npm run lint

# 3. 运行测试
npm test

# 4. 构建测试
npm run build
```

### 备份策略

```bash
# 重要修改前创建备份
cp file.ts file.ts.bak

# 或使用 git
git add .
git commit -m "Backup before major changes"
```

### 回滚方案

如果新修改导致问题：

```bash
# 恢复单个文件
mv file.ts.bak file.ts

# 或回滚 git 提交
git revert HEAD

# 或重置到之前的提交
git reset --hard <commit-hash>
```

---

## 📞 获取帮助

### 文档
- 查看 `docs/guides/` 中的相关指南
- 阅读 `OPTIMIZATION_FINAL_SUMMARY.md` 了解完整背景

### 脚本
- `scripts/verify-optimization.sh` - 验证优化状态
- `scripts/organize-docs.sh` - 整理文档
- `scripts/fix-nextjs15-params.js` - 修复 Next.js 15 类型

### 外部资源
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## ✅ 完成标记

完成后勾选：

- [ ] 环境变量已更新
- [ ] TypeScript 核心错误已修复
- [ ] Next.js 15 params 全部修复
- [ ] Lighthouse 审计完成
- [ ] 依赖已更新
- [ ] Cloudflare 密钥已轮换
- [ ] 所有测试通过
- [ ] 生产环境部署成功

---

**创建时间**: 2026-05-22  
**最后更新**: 2026-05-22  
**下次审查**: 2026-06-22
