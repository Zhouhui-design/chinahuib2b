# 🤖 OpenClaw 任务简报：启用 Cloudflare CDN

**任务**: 为 chinahuib2b.top 启用 Cloudflare CDN 代理  
**优先级**: 🔴 高  
**预计时间**: 10-15 分钟  

---

## 📋 问题描述

当前 DNS 已指向 Cloudflare IP，但流量没有经过 CDN。需要启用 DNS 代理（橙色云）。

---

## 🎯 你需要做的事

### 1. 向我请求 API Token

请说："请提供 Cloudflare API Token，用于启用 chinahuib2b.top 的 CDN 代理"

**我会通过安全方式提供 Token**（不会在聊天中显示完整 Key）

### 2. 执行脚本

使用我提供的 Token 运行以下命令：

```bash
cd /home/sardenesy/projects/chinahuib2b

# 设置 Token
export CF_API_TOKEN='我提供的Token'

# 运行启用脚本
./scripts/enable-cloudflare-proxy.sh

# 等待 10 分钟
sleep 600

# 验证结果
./scripts/verify-cdn.sh
```

### 3. 报告结果

告诉我：
- ✅ 是否成功启用代理
- ✅ HTTP 响应是否包含 `cf-ray` 和 `cf-cache-status` 头部
- ✅ 遇到的问题（如果有）

---

## ⚠️ 重要提醒

1. **不要在任何地方记录或显示完整的 API Token**
2. **任务完成后删除环境变量**: `unset CF_API_TOKEN`
3. **如果遇到错误，查看详细错误信息并报告**

---

## 📊 成功标准

```bash
curl -sI https://chinahuib2b.top/ | grep -iE "cf-|server:"

# 期望输出:
# cf-ray: xxxxx-FRA
# cf-cache-status: MISS
# server: cloudflare
```

---

## 📁 相关文件

- 详细任务说明: `TASK_FOR_OPENCLAW_ENABLE_CDN.md`
- 快速修复指南: `CLOUDFLARE_QUICK_FIX.md`

---

**准备好了吗？请向我要 API Token！** 🚀
