# ChinaHuiB2B 项目优化 - 快速参考

## 📊 优化成果

| 指标 | 结果 |
|------|------|
| 根目录文档减少 | 99.8% (1,549 → 3) |
| ESLint 警告减少 | 90% (300+ → 30) |
| 备份文件清理 | 100% |
| 验证评分 | 85/100 ✅ |

---

## 📁 文档结构

```
docs/
├── guides/ (41)      # 使用指南
├── reports/ (36)     # 报告文档
├── specs/ (21)       # 技术规范
├── features/ (65)    # 功能说明
├── deployment/ (5)   # 部署文档
└── archive/2026-Q2/  # 历史归档
```

---

## 🛠️ 常用命令

### 文档整理
```bash
# 运行文档整理脚本
bash scripts/organize-docs.sh

# 验证优化效果
bash scripts/verify-optimization.sh
```

### 代码质量
```bash
# 检查 ESLint
npm run lint

# 修复自动可修复的问题
npm run lint -- --fix

# TypeScript 类型检查
npx tsc --noEmit
```

### 构建与测试
```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 运行测试
npm test
npm run test:coverage
```

### 数据库
```bash
# 查看迁移状态
npx prisma migrate status

# 应用迁移
npx prisma migrate deploy

# 生成 Prisma Client
npx prisma generate
```

---

## 🔍 快速检查清单

### 日常检查
- [ ] 根目录 .md 文件 ≤ 5 个
- [ ] 无 .bak 文件
- [ ] ESLint 无错误
- [ ] 新文档已归档

### 每周检查
- [ ] 运行 `npm audit`
- [ ] 检查依赖更新
- [ ] 审查新增文档

### 每月检查
- [ ] 运行验证脚本
- [ ] Lighthouse 审计
- [ ] 轮换密钥
- [ ] 更新文档索引

---

## 📋 关键文件位置

### 配置文件
- Next.js: `next.config.ts`
- ESLint: `eslint.config.mjs`
- Prisma: `prisma/schema.prisma`
- 环境: `.env.local` (未提交)

### 文档
- README: `README.md`
- 检验报告: `INSPECTION_AND_OPTIMIZATION_REPORT.md`
- 完成报告: `OPTIMIZATION_COMPLETION_REPORT.md`
- 部署指南: `docs/guides/DEPLOYMENT.md`

### 脚本
- 文档整理: `scripts/organize-docs.sh`
- 优化验证: `scripts/verify-optimization.sh`

---

## ⚠️ 注意事项

### 环境变量安全
- ✅ `.env.local` 已在 `.gitignore`
- ⚠️ 定期轮换密钥
- ⚠️ 不要提交敏感信息

### TypeScript any 类型
- 当前有 ~180 个 `any` 类型使用
- 不影响功能，但降低类型安全
- 建议逐步替换为具体类型

### 文档管理
- 新文档立即放入合适目录
- 避免在根目录创建文档
- 定期运行整理脚本

---

## 🎯 优先级任务

### 高优先级（本周）
1. 轮换 NEXTAUTH_SECRET
2. 修复核心文件的 TypeScript 类型
3. 审查数据库迁移

### 中优先级（本月）
1. Lighthouse 性能审计
2. 修复 React Hooks 警告
3. 更新关键依赖

### 低优先级（季度）
1. 架构评估
2. 安全渗透测试
3. 监控完善

---

## 📞 获取帮助

- 查看文档: `ls docs/guides/`
- 运行验证: `bash scripts/verify-optimization.sh`
- 查看报告: `cat OPTIMIZATION_COMPLETION_REPORT.md`

---

**最后更新**: 2026-05-22  
**版本**: 1.0
