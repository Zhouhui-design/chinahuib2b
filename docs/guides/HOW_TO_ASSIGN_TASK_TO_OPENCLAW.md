# 📖 如何给 OpenClaw（阿杰）分配 CDN 启用任务

**创建时间**: 2026-05-22  
**用途**: 安全地委托 OpenClaw 执行 Cloudflare CDN 配置  

---

## ⚠️ 重要安全提醒

### 🔴 绝对不要做的事

1. ❌ **不要在聊天中粘贴完整的 API Key/Token**
2. ❌ **不要截图包含完整 Token 的内容**
3. ❌ **不要通过不安全的渠道发送 Token**

### ✅ 正确的做法

1. ✅ 使用环境变量传递 Token
2. ✅ 使用权限最小化的 API Token（不是 Global API Key）
3. ✅ 任务完成后立即删除或禁用 Token

---

## 🎯 操作步骤

### 步骤 1: 准备 API Token

#### 方法 A: 创建新的 API Token（推荐）

1. 访问: https://dash.cloudflare.com/profile/api-tokens
2. 点击 "Create Token"
3. 选择模板: "Edit zone DNS"
4. 或者自定义权限：
   ```
   Zone.Zone: Read
   Zone.DNS: Edit
   Zone.Cache Purge: Purge
   ```
5. 限制到特定 Zone: `chinahuib2b.top`
6. 复制生成的 Token（只显示一次！）

#### 方法 B: 使用现有 Token

如果您已经有合适的 Token，可以直接使用。

---

### 步骤 2: 与 OpenClaw 对话

复制以下内容发送给 OpenClaw：

```
你好，阿杰！我需要你帮我启用 chinahuib2b.top 的 Cloudflare CDN 代理。

任务文件位置:
/home/sardenesy/projects/chinahuib2b/OPENCLAW_TASK_BRIEF.md

请阅读任务简报，然后告诉我你需要什么。
```

---

### 步骤 3: 提供 API Token（安全方式）

当 OpenClaw 请求 API Token 时，**不要直接在聊天中粘贴**！

#### 推荐方式 1: 通过环境变量文件

创建一个临时文件：

```bash
# 在服务器上执行
cat > /tmp/cf_token.txt << 'EOF'
export CF_API_TOKEN='your_actual_token_here'
EOF

chmod 600 /tmp/cf_token.txt
```

然后告诉 OpenClaw：
```
API Token 已保存在服务器的 /tmp/cf_token.txt 文件中
请执行: source /tmp/cf_token.txt
```

#### 推荐方式 2: 分段提供（如果必须通过聊天）

将 Token 分成 3-4 段，分别发送：

```
Token 第1段: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
Token 第2段: .eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwi
Token 第3段: aWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV
```

然后让 OpenClaw 拼接：
```bash
export CF_API_TOKEN='第1段第2段第3段'
```

**注意**: 这种方式仍然有风险，仅在没有其他选择时使用。

#### 推荐方式 3: 手动执行（最安全）

告诉 OpenClaw：
```
为了安全起见，我会手动设置环境变量。

请在你的脚本中使用 $CF_API_TOKEN 变量，不要硬编码 Token。

我现在会在服务器上执行:
export CF_API_TOKEN='my_token'

然后你运行脚本即可。
```

然后您自己在服务器上执行：
```bash
export CF_API_TOKEN='your_actual_token_here'
```

---

### 步骤 4: OpenClaw 执行任务

OpenClaw 会执行以下命令：

```bash
cd /home/sardenesy/projects/chinahuib2b

# 运行启用脚本
./scripts/enable-cloudflare-proxy.sh

# 等待 10 分钟
sleep 600

# 验证结果
./scripts/verify-cdn.sh
```

---

### 步骤 5: 清理敏感信息

任务完成后，立即清理：

```bash
# 删除环境变量
unset CF_API_TOKEN

# 删除临时文件（如果有）
rm -f /tmp/cf_token.txt

# 清除 bash 历史
history -d $(history | grep CF_API_TOKEN | tail -1 | awk '{print $1}')
```

---

## 📋 任务检查清单

OpenClaw 应该完成以下步骤：

- [ ] 1. 阅读任务简报 (`OPENCLAW_TASK_BRIEF.md`)
- [ ] 2. 请求 API Token（通过安全方式）
- [ ] 3. 运行 `enable-cloudflare-proxy.sh`
- [ ] 4. 等待 10 分钟
- [ ] 5. 运行 `verify-cdn.sh` 验证
- [ ] 6. 报告结果
- [ ] 7. 清理敏感信息

---

## 📊 预期输出

### 成功启用后

```bash
curl -sI https://chinahuib2b.top/ | grep -iE "cf-|server:"

# 期望输出:
# cf-ray: 8a1b2c3d4e5f6789-FRA
# cf-cache-status: MISS
# server: cloudflare
```

---

## ⚠️ 常见问题

### Q1: OpenClaw 要求我直接粘贴 Token？

**回答**: 
```
为了安全，请不要在聊天中直接粘贴完整 Token。

请使用以下任一方式：
1. 创建临时文件 /tmp/cf_token.txt
2. 分段提供 Token
3. 我手动设置环境变量，你使用 $CF_API_TOKEN 变量
```

### Q2: Token 泄露了怎么办？

**立即行动**:
1. 登录 Cloudflare Dashboard
2. 进入 Profile → API Tokens
3. 找到泄露的 Token
4. 点击 "Roll" 或 "Delete"
5. 创建新的 Token

### Q3: 脚本执行失败？

**检查**:
1. Token 是否正确
2. Token 是否有足够权限
3. 查看错误信息
4. 参考详细文档: `TASK_FOR_OPENCLAW_ENABLE_CDN.md`

---

## 📁 相关文件

1. **[OPENCLAW_TASK_BRIEF.md](./OPENCLAW_TASK_BRIEF.md)** - 任务简报（简洁版）
2. **[TASK_FOR_OPENCLAW_ENABLE_CDN.md](./TASK_FOR_OPENCLAW_ENABLE_CDN.md)** - 详细任务说明
3. **[CLOUDFLARE_QUICK_FIX.md](./CLOUDFLARE_QUICK_FIX.md)** - 快速修复指南
4. **`scripts/enable-cloudflare-proxy.sh`** - 启用代理脚本
5. **`scripts/verify-cdn.sh`** - 验证脚本

---

## 💡 最佳实践

### 1. 使用权限最小化的 Token

不要使用 Global API Key！创建专门的 Token，只授予必要权限。

### 2. 定期轮换 Token

每 30-90 天更换一次 API Token。

### 3. 监控 API 使用

定期检查 Cloudflare Dashboard → Analytics → API Usage

### 4. 记录操作日志

保留任务执行日志（脱敏后），便于审计。

---

## 🎯 快速开始

**最简单的流程**:

1. 您自己设置环境变量：
   ```bash
   export CF_API_TOKEN='your_token'
   ```

2. 告诉 OpenClaw：
   ```
   我已经设置了 CF_API_TOKEN 环境变量。
   请运行: ./scripts/enable-cloudflare-proxy.sh
   然后等待 10 分钟，运行: ./scripts/verify-cdn.sh
   ```

3. OpenClaw 执行脚本并报告结果

4. 任务完成后清理：
   ```bash
   unset CF_API_TOKEN
   ```

---

## ✅ 总结

**核心原则**:
- 🔒 **永远不要在聊天中暴露完整 Token**
- 🛡️ **使用权限最小化的 Token**
- 🧹 **任务完成后立即清理**
- 📝 **记录操作日志**

**祝您顺利！** 🚀
