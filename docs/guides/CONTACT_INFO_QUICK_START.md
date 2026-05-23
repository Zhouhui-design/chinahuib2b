# 📞 联系信息功能 - 快速使用指南

## 🎯 功能概述

现在，**每个商家和买家都可以展示自己的联系方式和官网**，包括：
- 📱 电话号码
- 📧 邮箱地址
- 🌐 官方网站
- 💬 WhatsApp / WeChat / Telegram
- 🔗 LinkedIn / Facebook / Instagram
- 📍 详细地址

---

## 👤 买家如何设置个人资料

### 步骤 1: 访问个人资料页面
登录后访问：**https://chinahuib2b.top/buyer/profile**

### 步骤 2: 填写联系信息

```
显示名称: John Doe
公司: ABC Trading Co.
邮箱: john@abc.com
电话: +1 234 567 8900
网站: https://www.abctrading.com
位置: New York, USA
简介: We are a leading importer of...
```

### 步骤 3: 保存
点击 **"Save Changes"** 按钮

---

## 🏪 卖家如何设置联系信息

### 步骤 1: 访问卖家设置
登录后访问：**https://chinahuib2b.top/seller/settings**

### 步骤 2: 切换到 "Profile" 标签

### 步骤 3: 填写基本信息
```
公司名称: ABC Manufacturing
联系人: John Smith
邮箱: contact@abc.com
电话: +86 123 4567 8900
网站: https://www.abcmanufacturing.com
国家: China
城市: Shanghai
地址: No. 123, Main Street
公司简介: We specialize in...
```

### 步骤 4: 填写社交媒体（新增！）

#### 即时通讯
```
WhatsApp: +8612345678900
WeChat: abc_wechat_id
Telegram: @abc_telegram
```

#### 社交网络
```
LinkedIn: https://linkedin.com/company/abc-manufacturing
Facebook: https://facebook.com/abcmanufacturing
Instagram: https://instagram.com/abc_mfg
```

### 步骤 5: 保存
点击 **"Save Changes"** 按钮

---

## 🌟 联系信息在哪里显示？

### 1. 店铺页面（待集成）
买家在浏览店铺时，会看到：
```
┌─────────────────────────────────────┐
│ Contact Information                 │
├─────────────────────────────────────┤
│ ABC Manufacturing                   │
│ Shanghai, China                     │
│                                     │
│ 📞 +86 123 4567 8900               │
│ 📧 contact@abc.com                  │
│ 🌐 abcmanufacturing.com             │
│                                     │
│ [View Full Contact Info]            │
└─────────────────────────────────────┘
```

点击 **"View Full Contact Info"** 后展开：
```
┌─────────────────────────────────────┐
│ Social Media & Messaging            │
├─────────────────────────────────────┤
│ 💬 WhatsApp    💬 WeChat            │
│ 💬 Telegram    🔗 LinkedIn          │
│ 🔗 Facebook    🔗 Instagram         │
├─────────────────────────────────────┤
│ Address                             │
│ No. 123, Main Street                │
└─────────────────────────────────────┘
```

### 2. 产品页面（待集成）
在产品详情页也会显示卖家的联系信息

---

## ✨ 特色功能

### 1. 一键操作
- **点击电话** → 直接拨打
- **点击邮箱** → 打开邮件客户端
- **点击网站** → 新标签页打开
- **点击 WhatsApp** → 直接开始聊天
- **点击 Telegram** → 直接开始聊天

### 2. 渐进式披露
- 主要联系方式始终可见
- 社交媒体需要点击展开（避免视觉混乱）

### 3. 多语言支持
界面自动适配用户的语言设置（支持 10 种语言）

### 4. 移动端优化
- 响应式设计
- 触摸友好的按钮
- 原生应用深度链接

---

## 🔒 隐私控制

### 当前状态
所有填写的联系信息都会公开显示在店铺和产品页面。

### 未来计划（可选功能）
- [ ] 允许卖家选择公开哪些联系方式
- [ ] 买家需要登录才能查看完整联系方式
- [ ] 付费会员可查看高级联系方式（如私人电话）

---

## 📊 数据分析（未来计划）

可以追踪：
- 多少人查看了卖家的联系信息
- 哪个联系方式被点击最多
- 转化率提升情况

---

## 🛠️ 技术实现

### 数据库字段
- `User` 表：买家联系信息
- `SellerProfile` 表：卖家联系信息

### API 端点
- `GET /api/user/profile` - 获取买家资料
- `PUT /api/user/profile` - 更新买家资料
- `GET /api/seller/profile` - 获取卖家资料
- `PUT /api/seller/profile` - 更新卖家资料

### React 组件
- `ContactInfoEditor` - 编辑联系信息的表单
- `SellerContactDisplay` - 展示卖家联系信息的卡片

---

## 💡 最佳实践

### 对于卖家

1. **填写完整的联系信息**
   - 至少提供电话和邮箱
   - 添加官网增加可信度
   - 提供多种即时通讯方式

2. **保持信息最新**
   - 定期检查联系方式是否有效
   - 更换号码后及时更新

3. **专业形象**
   - 使用公司邮箱而非个人邮箱
   - 官网应该是专业的企业网站
   - LinkedIn 应该完善公司信息

### 对于买家

1. **建立信任**
   - 填写真实的公司名称
   - 提供有效的联系方式
   - 写一段简短的自我介绍

2. **便于沟通**
   - 提供常用的即时通讯账号
   - 注明最佳联系时间

---

## 🚀 下一步行动

### 立即可以做
1. ✅ 卖家登录并更新联系信息
2. ✅ 买家登录并完善个人资料

### 待开发
- [ ] 将 `SellerContactDisplay` 组件集成到店铺页面
- [ ] 将 `SellerContactDisplay` 组件集成到产品页面
- [ ] 添加联系查看统计功能
- [ ] 实现隐私控制设置

---

## ❓ 常见问题

### Q: 我的联系信息安全吗？
A: 是的，只有您自己可以修改自己的联系信息。其他人只能查看公开的信息。

### Q: 我可以隐藏某些联系方式吗？
A: 目前所有填写的信息都会公开显示。未来我们会添加隐私控制功能。

### Q: 如果我不填写某些字段会怎样？
A: 没关系的，只填写您愿意公开的联系方式即可。未填写的字段不会显示。

### Q: 如何验证我的联系方式？
A: 目前系统不会主动验证联系方式。请确保填写的信息准确有效。

---

## 📞 需要帮助？

如果您在设置联系信息时遇到任何问题，请通过以下方式联系我们：
- 邮箱: support@chinahuib2b.top
- 在线客服: 点击页面右下角的聊天图标

---

**祝您在 Global Expo Network 上生意兴隆！** 🎉
