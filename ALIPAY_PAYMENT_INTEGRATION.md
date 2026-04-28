# 支付宝收款集成说明

## ✅ 已完成的功能

### 1. 充值页面 (`/seller/subscription-required`)
- ✅ 显示支付宝收款二维码
- ✅ 提供详细的支付步骤说明
- ✅ 支持多语言（中文/英文）
- ✅ 提交付款凭证按钮

### 2. 付款凭证提交页面 (`/seller/submit-payment-proof`)
- ✅ 表单收集付款信息
- ✅ 上传付款截图（UI 已完成，文件上传功能待实现）
- ✅ 提交到后端 API
- ✅ 成功/失败状态反馈

### 3. 后端 API (`/api/seller/subscription/submit-proof`)
- ✅ 验证用户身份
- ✅ 保存付款凭证记录到数据库
- ✅ 状态管理（PENDING/APPROVED/REJECTED）

### 4. 数据库模型
- ✅ PaymentProof 表已创建
- ✅ 关联 User 和 SellerProfile
- ✅ 支持多币种和多种支付方式

## 📋 使用流程

### 商家端流程

1. **访问充值页面**
   ```
   http://localhost:3000/zh/seller/subscription-required
   或
   http://localhost:3000/en/seller/subscription-required
   ```

2. **扫描支付宝二维码**
   - 打开支付宝 App
   - 点击"扫一扫"
   - 扫描页面上的二维码
   - 输入金额：$10 USD（约 ¥72 CNY）
   - 完成支付

3. **提交付款凭证**
   - 点击"提交付款凭证"按钮
   - 填写注册邮箱
   - 填写交易单号（可选）
   - 确认支付金额
   - 上传付款截图
   - 提交表单

4. **等待审核**
   - 管理员将在 24 小时内审核
   - 审核通过后账户自动激活
   - 通过邮件通知审核结果

### 管理员端流程（待实现）

1. **查看待审核的付款凭证**
   ```sql
   SELECT * FROM "PaymentProof" WHERE status = 'PENDING';
   ```

2. **审核付款凭证**
   - 确认收到款项（检查支付宝账户）
   - 核对付款金额
   - 更新状态为 APPROVED 或 REJECTED

3. **激活商家账户**
   ```typescript
   await prisma.sellerProfile.update({
     where: { userId: sellerUserId },
     data: {
       subscriptionStatus: 'ACTIVE',
       subscriptionAmount: paymentAmount,
       lastPaymentAt: new Date(),
       subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年
       isActive: true,
     },
   });
   ```

##  待完善的功能

### 1. 文件上传功能
当前凭证提交页面的文件上传按钮还未连接实际的文件存储服务。

**建议方案：**
- 使用现有的 DigitalOcean Spaces
- 或集成阿里云 OSS（更适合国内用户）

**实现步骤：**
```typescript
// 1. 更新 /api/upload 路由支持图片上传
// 2. 在 submit-payment-proof 页面添加实际上传逻辑
// 3. 保存 screenshotUrl 到 PaymentProof 记录
```

### 2. 管理员审核界面
需要创建一个管理后台页面来审核付款凭证。

**建议路由：** `/admin/payment-proofs`

**功能需求：**
- 查看所有待审核的付款凭证
- 查看付款截图
- 批准/拒绝按钮
- 添加审核备注
- 批量操作

### 3. 邮件通知
支付成功后自动发送邮件通知。

**需要实现：**
- 用户提交凭证后 → 通知管理员
- 管理员审核通过后 → 通知用户
- 审核被拒绝后 → 通知用户并说明原因

**可以使用：**
- Nodemailer + SMTP
- SendGrid API
- 阿里云邮件推送

### 4. 自动激活逻辑
审核通过后自动更新商家账户状态。

```typescript
// 在 API 中添加 approve 端点
POST /api/seller/subscription/approve/:proofId
{
  adminNotes: "Payment verified"
}
```

## 📊 数据库 Schema

### PaymentProof 表结构

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

## 🚀 部署到生产环境

### 1. 更新收款码
确保生产环境使用正确的支付宝收款码：
```bash
# 替换 public/alipay-qrcode.jpg
```

### 2. 配置环境变量
```bash
# .env.production
NEXTAUTH_URL="https://chinahuib2b.top"
```

### 3. 运行数据库迁移
```bash
npx prisma migrate deploy
```

### 4. 重启服务
```bash
pm2 restart nextjs-app
```

## 💡 注意事项

1. **收款码安全性**
   - 定期更换收款码
   - 监控支付宝账户收款情况
   - 设置收款提醒

2. **人工审核**
   - 确保及时审核（24小时内）
   - 保留所有付款凭证记录
   - 建立审核日志

3. **用户体验**
   - 提供清晰的支付指引
   - 多语言支持
   - 及时的状态反馈

4. **合规性**
   - 遵守支付宝个人收款码使用规范
   - 保留交易记录
   - 必要时申请商户版收款码

## 📞 联系方式

如有问题，请联系：
- Email: admin@chinahuib2b.top
- 支付宝账号: 华容辉(*辉)

---

**最后更新**: 2026-04-28  
**状态**: ✅ 基础功能已完成，待完善文件上传和管理员审核界面
