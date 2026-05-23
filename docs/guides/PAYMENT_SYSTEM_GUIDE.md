# 支付宝收款系统 - 完整使用指南

## 📋 目录

1. [功能概述](#功能概述)
2. [商家操作流程](#商家操作流程)
3. [管理员操作流程](#管理员操作流程)
4. [图片上传说明](#图片上传说明)
5. [部署指南](#部署指南)
6. [常见问题](#常见问题)

---

## 功能概述

本系统实现了完整的支付宝收款和付款凭证审核流程：

### ✅ 已实现功能

- **商家端**
  - 支付宝二维码收款页面
  - 付款凭证提交表单
  - 多语言支持（中文/英文）

- **管理员端**
  - 付款凭证列表查看
  - 凭证审核（通过/拒绝）
  - 自动激活商家账户
  - 审核备注功能

- **工具**
  - SCP 文件上传脚本
  - 自动化部署脚本

---

## 商家操作流程

### 1. 访问充值页面

```
https://chinahuib2b.top/zh/seller/subscription-required
```

### 2. 扫描支付宝二维码

1. 打开支付宝 App
2. 点击"扫一扫"
3. 扫描页面上的二维码
4. 输入金额：**$10 USD**（约 ¥72 CNY）
5. 完成支付

### 3. 提交付款凭证

1. 点击页面上的"提交付款凭证"按钮
2. 填写以下信息：
   - **注册邮箱**（必填）
   - **交易单号**（可选）
   - **支付金额**（必填，最低 $10）
   - **备注**（可选）
   - **付款截图**（建议上传）
3. 点击"提交凭证"

### 4. 等待审核

- 管理员将在 **24 小时内**审核
- 审核通过后账户自动激活
- 会收到邮件通知（待实现）

---

## 管理员操作流程

### 1. 访问管理员审核界面

```
https://chinahuib2b.top/admin/payment-proofs
```

**前提条件：** 用户角色必须是 `ADMIN`

### 2. 查看待审核凭证

默认显示所有 **PENDING**（待审核）状态的付款凭证。

可以使用筛选器切换查看：
- **全部** - 所有凭证
- **待审核** - 未处理的凭证
- **已通过** - 已批准的凭证
- **已拒绝** - 已拒绝的凭证

### 3. 审核凭证

点击凭证右侧的 **"审核"** 按钮，弹出审核对话框。

#### 审核对话框包含：

- **商家信息**
  - 公司名称
  - 注册邮箱
  - 支付金额
  
- **付款截图**
  - 显示已上传的截图（如有）
  
- **管理员备注**
  - 可输入审核意见
  
- **操作按钮**
  - **通过并激活账户** - 批准付款，自动激活商家账户
  - **拒绝** - 拒绝付款凭证
  - **取消** - 关闭对话框

### 4. 通过付款凭证

点击 **"通过并激活账户"** 后：

1. 付款凭证状态更新为 `APPROVED`
2. 商家账户自动激活：
   - `subscriptionStatus` → `ACTIVE`
   - `subscriptionAmount` → 支付金额
   - `subscriptionExpiry` → 1 年后
   - `isActive` → `true`
3. 记录审核时间和备注

### 5. 拒绝付款凭证

点击 **"拒绝"** 后：

1. 付款凭证状态更新为 `REJECTED`
2. 记录审核时间和备注
3. 商家账户保持不变

---

## 图片上传说明

### 使用 SCP 脚本上传截图

我们使用 SCP 命令将付款截图上传到生产服务器。

#### 方法 1：使用上传脚本（推荐）

```bash
./upload-payment-proof.sh <截图文件路径> [proofId]
```

**示例：**

```bash
# 上传截图（不提供 proofId）
./upload-payment-proof.sh ~/Desktop/payment-screenshot.jpg

# 上传截图并提供 proofId（会自动重命名文件）
./upload-payment-proof.sh ~/Desktop/payment-screenshot.jpg cm1234567890
```

**脚本功能：**
1. 自动创建远程目录
2. 上传文件到服务器
3. 验证上传成功
4. 显示访问 URL
5. 生成数据库更新 SQL（如果提供了 proofId）

#### 方法 2：手动 SCP 命令

```bash
# 基本上传
scp <本地文件路径> root@139.59.108.156:/var/www/chinahuib2b/public/payment-proofs/

# 示例
scp ~/Desktop/screenshot.jpg root@139.59.108.156:/var/www/chinahuib2b/public/payment-proofs/
```

#### 方法 3：SSH 登录后上传

```bash
# 1. SSH 登录服务器
ssh root@139.59.108.156

# 2. 进入项目目录
cd /var/www/chinahuib2b

# 3. 使用本地 SCP（从本地电脑传）
# 或使用 SFTP 工具（如 FileZilla、WinSCP）
```

### 更新数据库记录截图 URL

上传截图后，需要更新数据库记录：

```sql
UPDATE "PaymentProof"
SET "screenshotUrl" = 'https://chinahuib2b.top/payment-proofs/文件名.jpg'
WHERE id = 'proofId';
```

**使用上传脚本时会自动生成此 SQL。**

---

## 部署指南

### 自动部署（推荐）

```bash
./deploy-payment.sh
```

**脚本会自动完成：**
1. ✅ 提交代码到 Git
2. ✅ 推送到远程仓库
3. ✅ SSH 连接服务器并拉取代码
4. ✅ 安装依赖
5. ✅ 运行数据库迁移
6. ✅ 生成 Prisma Client
7. ✅ 创建必要目录
8. ✅ 构建项目
9. ✅ 重启 PM2
10. ✅ 验证部署状态

### 手动部署

如果需要手动部署，按以下步骤操作：

#### 1. 推送代码

```bash
git add -A
git commit -m "feat: 添加支付宝收款功能"
git push origin main
```

#### 2. SSH 连接服务器

```bash
ssh root@139.59.108.156
```

#### 3. 拉取最新代码

```bash
cd /var/www/chinahuib2b
git pull origin main
```

#### 4. 安装依赖

```bash
npm install
```

#### 5. 运行数据库迁移

```bash
npx prisma migrate deploy
npx prisma generate
```

#### 6. 创建必要目录

```bash
mkdir -p public/payment-proofs
```

#### 7. 构建项目

```bash
npm run build
```

#### 8. 重启服务

```bash
pm2 restart nextjs-app
```

#### 9. 验证部署

```bash
# 检查 PM2 状态
pm2 status nextjs-app

# 查看日志
pm2 logs nextjs-app

# 测试访问
curl -I https://chinahuib2b.top
```

---

## 常见问题

### Q1: 如何创建管理员账户？

**方法 1：通过数据库直接修改**

```sql
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'your-admin-email@example.com';
```

**方法 2：在注册时指定**

需要修改注册 API，添加角色选择（目前默认是 BUYER）。

### Q2: 商家提交凭证后看不到截图？

**原因：** 截图上传功能需要手动通过 SCP 上传。

**解决方案：**
1. 商家通过邮件或其他方式发送截图给管理员
2. 管理员使用 SCP 脚本上传截图
3. 更新数据库中的 `screenshotUrl` 字段

### Q3: 审核通过后商家仍然无法访问后台？

**检查步骤：**

1. 确认 `subscriptionStatus` 是否为 `ACTIVE`
2. 确认 `subscriptionAmount` 是否 >= 10
3. 确认 `isActive` 是否为 `true`
4. 确认 `subscriptionExpiry` 是否在未来

```sql
SELECT 
  "subscriptionStatus",
  "subscriptionAmount",
  "isActive",
  "subscriptionExpiry"
FROM "SellerProfile"
WHERE "userId" = '商家userId';
```

### Q4: 如何查看所有待审核的凭证？

**方法 1：在管理员界面查看**
```
https://chinahuib2b.top/admin/payment-proofs
```

**方法 2：通过数据库查询**
```sql
SELECT 
  pp.id,
  pp.amount,
  pp.status,
  u.email,
  sp."companyName",
  pp."submittedAt"
FROM "PaymentProof" pp
JOIN "User" u ON pp."userId" = u.id
LEFT JOIN "SellerProfile" sp ON pp."sellerProfileId" = sp.id
WHERE pp.status = 'PENDING'
ORDER BY pp."submittedAt" DESC;
```

### Q5: 如何批量处理多个凭证？

目前管理员界面一次只能处理一个凭证。如果需要批量处理：

```sql
-- 批量批准所有待审核的凭证
UPDATE "PaymentProof"
SET 
  status = 'APPROVED',
  "reviewedAt" = NOW(),
  "adminNotes" = '批量审核通过'
WHERE status = 'PENDING';

-- 注意：这不会自动激活商家账户
-- 需要单独执行激活逻辑
```

### Q6: SCP 上传失败怎么办？

**常见问题：**

1. **权限被拒绝**
   ```bash
   # 确保使用正确的用户
   ssh root@139.59.108.156
   ```

2. **连接超时**
   ```bash
   # 检查服务器是否可访问
   ping 139.59.108.156
   ```

3. **目录不存在**
   ```bash
   # 手动创建目录
   ssh root@139.59.108.156 "mkdir -p /var/www/chinahuib2b/public/payment-proofs"
   ```

4. **使用详细模式调试**
   ```bash
   scp -v <文件> root@139.59.108.156:/var/www/chinahuib2b/public/payment-proofs/
   ```

---

## 技术架构

### 数据库模型

```prisma
model PaymentProof {
  id              String        @id @default(cuid())
  userId          String
  sellerProfileId String?
  amount          Decimal       @db.Decimal(10, 2)
  currency        String        @default("USD")
  transactionId   String?
  paymentMethod   String        @default("ALIPAY")
  screenshotUrl   String?
  notes           String?
  status          PaymentStatus @default(PENDING)
  adminNotes      String?
  submittedAt     DateTime      @default(now())
  reviewedAt      DateTime?
}

enum PaymentStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### API 端点

| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/api/seller/subscription/submit-proof` | POST | 认证用户 | 提交付款凭证 |
| `/api/admin/payment-proofs` | GET | 管理员 | 获取凭证列表 |
| `/api/admin/payment-proofs/[id]/approve` | POST | 管理员 | 批准凭证 |
| `/api/admin/payment-proofs/[id]/reject` | POST | 管理员 | 拒绝凭证 |

### 文件结构

```
src/app/
├── [locale]/seller/subscription-required/page.tsx  # 充值页面
├── (dashboard)/
│   ├── seller/submit-payment-proof/page.tsx        # 凭证提交页面
│   ── admin/payment-proofs/page.tsx               # 管理员审核页面
└── api/
    ├── seller/subscription/submit-proof/route.ts   # 提交凭证 API
    ── admin/payment-proofs/
        ├── route.ts                                # 获取凭证列表
        └── [proofId]/
            ├── approve/route.ts                    # 批准 API
            ── reject/route.ts                     # 拒绝 API

public/
├── alipay-qrcode.jpg                               # 支付宝收款码
── payment-proofs/                                 # 付款截图存储目录

upload-payment-proof.sh                             # SCP 上传脚本
deploy-payment.sh                                   # 自动化部署脚本
```

---

## 安全建议

1. **收款码安全**
   - 定期更换支付宝收款码
   - 监控收款账户
   - 设置收款提醒

2. **审核安全**
   - 仔细核对付款金额
   - 验证付款截图真实性
   - 保留所有审核记录

3. **访问控制**
   - 管理员界面需要 ADMIN 角色
   - 定期检查管理员账户
   - 启用强密码策略

4. **数据备份**
   - 定期备份数据库
   - 保存付款凭证截图
   - 记录审核日志

---

## 联系方式

**技术支持：**
- Email: admin@chinahuib2b.top
- 支付宝: 华容辉(*辉)

**服务器信息：**
- IP: 139.59.108.156
- SSH: root@139.59.108.156
- 项目路径: /var/www/chinahuib2b

---

**最后更新：** 2026-04-28  
**版本：** 1.0.0  
**状态：** ✅ 已部署到生产环境
