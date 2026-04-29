# 管理员账户信息

## 🔐 登录凭据

**已创建并验证成功的管理员账户：**

```
📧 邮箱：admin@chinahuib2b.top
👤 用户名：admin
🔑 密码：Admin@2026!Secure
🎭 角色：ADMIN
✅ 状态：活跃
```

## 🌐 访问地址

- **登录页面**：https://chinahuib2b.top/login
- **TDK 管理后台**：https://chinahuib2b.top/admin/seo
- **死链管理**：https://chinahuib2b.top/admin/dead-links（如需要）

## 📋 使用步骤

### 1. 登录系统

1. 打开浏览器访问：https://chinahuib2b.top/login
2. 输入邮箱：`admin@chinahuib2b.top`
3. 输入密码：`Admin@2026!Secure`
4. 点击"登录"按钮

### 2. 访问 TDK 管理后台

登录后，您可以：

**方式 A**：直接访问
- 在浏览器地址栏输入：`https://chinahuib2b.top/admin/seo`

**方式 B**：通过导航菜单
- 如果导航菜单有"管理后台"或"SEO 管理"链接，直接点击

### 3. 测试 SEO 功能

#### 查看现有配置
您应该能看到 6 个已配置的页面：
- `/` - 首页（中文）
- `/en` - 首页（英文）
- `/products` - 产品列表页
- `/stores` - 店铺列表页
- `/login` - 登录页
- `/register` - 注册页

#### 添加新配置
1. 在左侧表单填写：
   - **页面路径**：如 `/about`
   - **页面类型**：选择 appropriate 类型
   - **中文 TDK**：Title、Description、Keywords
   - **英文 TDK**：Title、Description、Keywords
2. 点击"创建配置"

#### 编辑配置
1. 在右侧列表中找到要编辑的配置
2. 点击"编辑"按钮
3. 修改 TDK 内容
4. 点击"更新配置"

#### 删除配置
1. 点击配置右侧的"删除"按钮
2. 确认删除

### 4. 验证 TDK 生效

修改配置后，立即验证：

```bash
# 检查首页标题
curl -s https://chinahuib2b.top/ | grep -oP '<title>.*?</title>'

# 检查描述
curl -s https://chinahuib2b.top/ | grep 'meta name="description"'

# 检查关键词
curl -s https://chinahuib2b.top/ | grep 'meta name="keywords"'
```

或在浏览器中：
1. 右键点击页面 → "查看页面源代码"
2. 搜索 `<title>` 或 `meta name="description"`
3. 确认显示的是您配置的 TDK

## ⚠️ 安全建议

### 立即修改密码

首次登录后，建议修改默认密码。您可以通过以下方式：

**方式 A：数据库直接修改**
```sql
-- 需要技术支持人员执行
UPDATE "User" 
SET password = '$2b$10$...' -- 新的 bcrypt 哈希值
WHERE email = 'admin@chinahuib2b.top';
```

**方式 B：请求创建修改密码页面**
我可以为您创建一个"修改密码"的管理页面。

### 密码强度要求

建议使用强密码：
- 至少 12 个字符
- 包含大写字母、小写字母、数字和特殊字符
- 不使用常见单词或个人信息

示例：`MyS3cur3P@ssw0rd!2024`

## 🎯 当前 SEO 配置概览

| 页面路径 | 类型 | 中文标题 | 状态 |
|---------|------|---------|------|
| `/` | STATIC | Global Expo - 全球B2B贸易展会平台 | ✅ 启用 |
| `/en` | STATIC | Global Expo - B2B Trade Exhibition Platform | ✅ 启用 |
| `/products` | CATEGORY | 产品中心 - 浏览全球优质产品 | ✅ 启用 |
| `/stores` | CATEGORY | 商家店铺 - 全球认证商家展厅 | ✅ 启用 |
| `/login` | STATIC | 用户登录 - Global Expo B2B平台 | ✅ 启用 |
| `/register` | STATIC | 免费注册 - 加入 Global Expo B2B平台 | ✅ 启用 |

## 🔧 故障排除

### 问题 1：登录失败

**可能原因**：
- 密码输入错误
- 账户被禁用
- 会话过期

**解决方案**：
1. 确认邮箱和密码正确（注意大小写）
2. 清除浏览器缓存和 Cookie
3. 尝试无痕模式登录

### 问题 2：无法访问 /admin/seo

**可能原因**：
- 未登录
- 不是 ADMIN 角色
- 权限不足

**解决方案**：
1. 确认已成功登录
2. 检查用户角色是否为 ADMIN
3. 联系系统管理员

### 问题 3：TDK 修改后不生效

**可能原因**：
- 浏览器缓存
- Next.js 服务端缓存
- 配置未保存成功

**解决方案**：
1. 强制刷新页面（Ctrl+F5 或 Cmd+Shift+R）
2. 清除浏览器缓存
3. 确认配置已保存（查看列表中的更新时间）
4. 重启 PM2 服务（如需）

## 📊 完整 SEO 功能清单

| 功能 | 状态 | 访问地址 |
|------|------|---------|
| **Robots.txt** | ✅ 运行中 | `/robots.txt` |
| **Sitemap.xml** | ✅ 运行中 | `/sitemap.xml` |
| **404 友好页面** | ✅ 运行中 | 任意不存在页面 |
| **死链检测 API** | ✅ 运行中 | `/api/admin/dead-links` |
| **TDK 管理后台** | ✅ 运行中 | `/admin/seo` |
| **动态 TDK** | ✅ 运行中 | 所有页面 |
| **产品 Schema** | ✅ 运行中 | 产品详情页 |
| **图片优化组件** | ✅ 运行中 | OptimizedImage |
| **SEO 测试页** | ✅ 运行中 | `/test-seo` |

## 🚀 下一步行动

1. **立即执行**：
   - ✅ 使用上面的凭据登录
   - ✅ 访问 TDK 管理后台
   - ✅ 测试所有 CRUD 功能

2. **提交到搜索引擎**：
   - Google Search Console：提交 `sitemap.xml`
   - Bing Webmaster Tools：提交 `sitemap.xml`

3. **扩展配置**：
   - 为更多页面添加 TDK
   - 优化现有 TDK 内容
   - 监控搜索引擎收录情况

---

**祝您使用愉快！** 🎉

如有任何问题，请随时联系技术支持。
