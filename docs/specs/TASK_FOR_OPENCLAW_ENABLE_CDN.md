# 🤖 OpenClaw 任务：启用 Cloudflare CDN 代理

**任务优先级**: 🔴 高优先级  
**执行人**: OpenClaw (阿杰)  
**域名**: chinahuib2b.top  
**预计耗时**: 10-15 分钟  

---

## 📋 任务背景

### 当前问题
- ✅ DNS 已指向 Cloudflare IP（172.67.209.245, 104.21.77.165）
- ❌ 但流量没有经过 CDN（请求直接到达 Nginx）
- ❌ HTTP 响应缺少 Cloudflare 头部（cf-ray, cf-cache-status）

### 根本原因
Cloudflare DNS 记录的**代理状态未启用**（灰色云而非橙色云）

---

## 🎯 任务目标

启用 Cloudflare CDN 代理，使流量经过 Cloudflare 边缘节点，实现：
- 🌍 全球加速
- 🛡️ DDoS 防护
- 💾 智能缓存
- 🔒 SSL/TLS 加密

---

## 🔧 需要执行的操作

### 步骤 1: 获取 Cloudflare API Token

**重要**: 不要使用 Global API Key！使用权限受限的 API Token。

#### 创建 API Token

1. 访问: https://dash.cloudflare.com/profile/api-tokens
2. 点击 "Create Token"
3. 选择模板: "Edit zone DNS" 或创建自定义权限

**所需权限**:
```
Zone.Zone: Read
Zone.DNS: Edit
Zone.Cache Purge: Purge
```

**或者**，如果您已有 Token，请确保它包含上述权限。

---

### 步骤 2: 检查并启用 DNS 代理

使用 Cloudflare API 检查并启用代理：

```bash
#!/bin/bash
# enable-cloudflare-proxy.sh

DOMAIN="chinahuib2b.top"
API_TOKEN="YOUR_API_TOKEN_HERE"  # 替换为实际 Token

echo "=========================================="
echo "Enabling Cloudflare Proxy for $DOMAIN"
echo "=========================================="
echo ""

# Step 1: Get Zone ID
echo "Step 1: Getting Zone ID..."
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN" \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json" | \
     jq -r '.result[0].id')

if [ -z "$ZONE_ID" ] || [ "$ZONE_ID" = "null" ]; then
    echo "❌ Error: Could not find zone for $DOMAIN"
    exit 1
fi

echo "✅ Zone ID: $ZONE_ID"
echo ""

# Step 2: Get current DNS records
echo "Step 2: Checking current DNS records..."
DNS_RECORDS=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A" \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json")

echo "Current DNS Records:"
echo "$DNS_RECORDS" | jq -r '.result[] | select(.type=="A") | "  - \(.name): proxied=\(.proxied)"'
echo ""

# Step 3: Enable proxy for each A record
echo "Step 3: Enabling proxy for A records..."

for record_id in $(echo "$DNS_RECORDS" | jq -r '.result[] | select(.type=="A") | .id'); do
    record_name=$(echo "$DNS_RECORDS" | jq -r --arg id "$record_id" '.result[] | select(.id==$id) | .name')
    record_content=$(echo "$DNS_RECORDS" | jq -r --arg id "$record_id" '.result[] | select(.id==$id) | .content')
    
    echo "  Updating: $record_name ($record_content)"
    
    # Update record to enable proxy
    UPDATE_RESULT=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$record_id" \
         -H "Authorization: Bearer $API_TOKEN" \
         -H "Content-Type: application/json" \
         --data "{
           \"type\": \"A\",
           \"name\": \"$record_name\",
           \"content\": \"$record_content\",
           \"proxied\": true,
           \"ttl\": 1
         }")
    
    success=$(echo "$UPDATE_RESULT" | jq -r '.success')
    if [ "$success" = "true" ]; then
        echo "  ✅ Success: $record_name is now proxied"
    else
        echo "  ❌ Failed: $record_name"
        echo "  Error: $(echo "$UPDATE_RESULT" | jq -r '.errors[0].message')"
    fi
done

echo ""

# Step 4: Verify SSL/TLS settings
echo "Step 4: Checking SSL/TLS settings..."
SSL_SETTINGS=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/ssl" \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json")

SSL_VALUE=$(echo "$SSL_SETTINGS" | jq -r '.result.value')
echo "Current SSL/TLS Mode: $SSL_VALUE"

if [ "$SSL_VALUE" != "full" ] && [ "$SSL_VALUE" != "full_strict" ]; then
    echo ""
    echo "⚠️  WARNING: SSL/TLS mode is not optimal!"
    echo "Recommended: Full or Full (strict)"
    echo "Current: $SSL_VALUE"
    echo ""
    echo "To change SSL mode manually:"
    echo "1. Go to https://dash.cloudflare.com/"
    echo "2. Select $DOMAIN"
    echo "3. SSL/TLS → Overview"
    echo "4. Change to 'Full (strict)'"
else
    echo "✅ SSL/TLS configuration is good"
fi

echo ""

# Step 5: Purge cache
echo "Step 5: Purging CDN cache..."
PURGE_RESULT=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}')

purge_success=$(echo "$PURGE_RESULT" | jq -r '.success')
if [ "$purge_success" = "true" ]; then
    echo "✅ Cache purged successfully"
else
    echo "⚠️  Cache purge failed (may need manual action)"
fi

echo ""
echo "=========================================="
echo "Task Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Wait 5-10 minutes for DNS propagation"
echo "2. Test with: curl -sI https://$DOMAIN/ | grep -iE 'cf-|server:'"
echo "3. Expected: cf-ray and cf-cache-status headers"
echo ""
```

---

### 步骤 3: 验证配置

等待 5-10 分钟后，运行验证脚本：

```bash
#!/bin/bash
# verify-cdn.sh

DOMAIN="chinahuib2b.top"

echo "=========================================="
echo "CDN Verification for $DOMAIN"
echo "=========================================="
echo ""

# Check DNS
echo "1. DNS Resolution:"
dig +short $DOMAIN
echo ""

# Check CDN headers
echo "2. CDN Headers:"
HEADERS=$(curl -sI https://$DOMAIN/)
echo "$HEADERS" | grep -iE "cf-|server:"
echo ""

# Check response time
echo "3. Response Time:"
TIME=$(curl -s -o /dev/null -w "%{time_total}" https://$DOMAIN/)
echo "Time: ${TIME}s"
echo ""

# Verify success
if echo "$HEADERS" | grep -q "cf-ray"; then
    echo "✅ SUCCESS: CDN is working!"
else
    echo "❌ FAILED: CDN is not working yet"
    echo "   Possible reasons:"
    echo "   - DNS propagation still in progress (wait 5-10 min)"
    echo "   - Proxy not enabled in Cloudflare Dashboard"
    echo "   - SSL/TLS configuration issue"
fi

echo ""
echo "=========================================="
```

---

## ✅ 成功标准

任务成功的标志：

1. ✅ DNS 记录显示 `proxied: true`
2. ✅ HTTP 响应包含 `cf-ray` 头部
3. ✅ HTTP 响应包含 `cf-cache-status` 头部
4. ✅ Server 头部显示 `cloudflare`
5. ✅ 平均响应时间 < 500ms

---

## ⚠️ 安全注意事项

### 🔴 绝对不要做的事

1. ❌ **不要在聊天中分享完整的 API Token**
2. ❌ **不要使用 Global API Key**（权限太大）
3. ❌ **不要将 Token 硬编码在代码中并提交到 Git**

### ✅ 正确的做法

1. ✅ 使用环境变量存储 Token
   ```bash
   export CF_API_TOKEN='your_token_here'
   ```

2. ✅ 使用权限最小化的 API Token
   - 只授予必要的权限
   - 限制到特定 Zone

3. ✅ 任务完成后可以删除或禁用 Token

---

## 📝 执行清单

OpenClaw 需要执行的步骤：

- [ ] 1. 获取 Cloudflare API Token（从用户处安全获取）
- [ ] 2. 运行 `enable-cloudflare-proxy.sh` 脚本
- [ ] 3. 等待 5-10 分钟
- [ ] 4. 运行 `verify-cdn.sh` 脚本验证
- [ ] 5. 报告结果

---

## 📞 如果遇到问题

### 问题 1: API 返回 403 Forbidden

**原因**: Token 权限不足或无效

**解决**: 
- 检查 Token 是否正确
- 确认 Token 包含所需权限
- 重新创建 Token

### 问题 2: 更新后仍然没有 CDN 头部

**原因**: DNS 传播延迟

**解决**:
- 等待 10-15 分钟
- 清除本地 DNS 缓存
- 使用不同网络测试

### 问题 3: SSL/TLS 错误

**原因**: SSL 模式不匹配

**解决**:
- 手动登录 Dashboard 检查 SSL/TLS 设置
- 确保模式为 "Full" 或 "Full (strict)"

---

## 📊 预期输出示例

### 成功启用代理后

```bash
curl -sI https://chinahuib2b.top/ | head -15

HTTP/2 200
date: Thu, 22 May 2026 10:30:00 GMT
content-type: text/html; charset=utf-8
cf-ray: 8a1b2c3d4e5f6789-FRA
cf-cache-status: MISS
server: cloudflare
cache-control: public, max-age=0, must-revalidate
...
```

**关键指标**:
- ✅ `cf-ray`: 存在
- ✅ `cf-cache-status`: 存在（HIT/MISS/DYNAMIC）
- ✅ `server: cloudflare`: 显示 Cloudflare

---

## 🎯 交付物

完成任务后，请提供：

1. ✅ 执行日志（脱敏，不包含 Token）
2. ✅ 验证结果截图或输出
3. ✅ 遇到的问题及解决方案
4. ✅ 最终状态报告

---

## 📚 参考文档

- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
- [DNS Management API](https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-list-dns-records)
- [Cache Purge API](https://developers.cloudflare.com/api/operations/zone-purge-purge-all-files)

---

## 💡 提示

**给 OpenClaw 的提示**:

1. 先向用户请求 API Token（通过安全方式，如环境变量）
2. 不要在任何地方记录或显示完整的 Token
3. 执行前先用小范围测试（如只更新一个记录）
4. 遇到问题时查看详细错误信息
5. 完成后清理临时文件和敏感信息

---

**祝顺利！如有问题，请参考 Cloudflare 文档或联系支持。** 🚀
