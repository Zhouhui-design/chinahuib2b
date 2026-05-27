# Cloudflare API Key 轮换指南

**日期**: 2026-05-28
**状态**: 待用户手动执行

---

## 为什么需要轮换 API Key？

当前 `.env.local` 中的 Cloudflare API Key 已暴露在代码仓库中，存在安全风险。

---

## 轮换步骤

### 1. 登录 Cloudflare Dashboard

访问: https://dash.cloudflare.com/

### 2. 创建新的 API Token

1. 点击右上角头像 → "My Profile"
2. 选择 "API Tokens" 选项卡
3. 点击 "Create Token"
4. 选择 "Custom token" → "Get started"
5. 配置权限:
   - **Zone Permissions**:
     - `Zone:Read`
     - `Cache Purge:Edit` (如果需要清除缓存)
   - **Account Permissions**:
     - `Account Settings:Read`

6. 设置 Account Resources:
   - Include: 您的特定账户

7. 设置 TTL (建议: 90 天)

8. 点击 "Create Token"

### 3. 更新环境变量

编辑 `/home/sardenesy/projects/chinahuib2b/.env.local`:

```bash
# 替换旧的 API Key
CLOUDFLARE_API_KEY=您的新APIKey
```

### 4. 撤销旧 Token

1. 在 Cloudflare Dashboard 的 API Tokens 页面
2. 找到旧的 Token
3. 点击 "Revoke"

---

## 验证步骤

```bash
# 测试新的 API Key
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer 您的新APIKey" \
  -H "Content-Type: application/json"
```

---

## 重要提醒

⚠️ **定期轮换**: 建议每 90 天轮换一次
⚠️ **不要提交**: 永远不要将 API Key 提交到 Git
⚠️ **使用环境变量**: 始终使用 `.env.local` 文件
