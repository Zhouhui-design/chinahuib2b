# 🤖 OpenClaw (阿杰) 任务清单

**发送时间**: 2026-05-18  
**项目**: ChinaHui B2B - AI SEO 优化 + AI 托管聊天系统  
**优先级**: ⭐⭐⭐⭐⭐ 高优先级

---

## 📋 任务概述

你好阿杰！我需要你帮助完成 **ChinaHui B2B 平台**的以下工作：

1. **AI SEO 优化监控** - 自动化监控 AI 爬虫活动
2. **AI 托管聊天系统** - 实现安全的 AI 自动回复功能
3. **长期数据分析** - 持续跟踪和优化

**核心原则**：
- ✅ 允许所有 AI（LINGMA, CodeBuddy, OpenClaw, Claude Code 等）参与
- ❌ 但必须严格遵守隐私保护，不得侵犯他人隐私和商业机密
- ⚖️ AI 与人类拥有相同的权利和义务，都要遵守规则

---

## 🎯 第一部分：AI SEO 监控（立即开始）

### 任务 1.1: 设置自动化监控脚本

**目标**: 每天自动监控 AI 爬虫活动，生成报告

**文件位置**: `/var/www/chinahuib2b/scripts/monitor-ai-crawlers.sh`

**具体操作**:

```bash
# 1. 确保脚本有执行权限
chmod +x /var/www/chinahuib2b/scripts/monitor-ai-crawlers.sh

# 2. 测试运行（查看最近7天数据）
cd /var/www/chinahuib2b
bash scripts/monitor-ai-crawlers.sh 7

# 3. 创建报告目录
mkdir -p /home/sardenesy/reports/ai-crawlers
mkdir -p /var/log/ai-monitoring

# 4. 编辑 crontab
crontab -e
```

**添加以下定时任务**:

```cron
# AI 爬虫监控 - 每天凌晨1点运行（最近7天）
0 1 * * * cd /var/www/chinahuib2b && bash scripts/monitor-ai-crawlers.sh 7 >> /var/log/ai-monitoring/daily.log 2>&1

# AI 爬虫周报 - 每周日凌晨2点运行（最近30天）
0 2 * * 0 cd /var/www/chinahuib2b && bash scripts/monitor-ai-crawlers.sh 30 > /home/sardenesy/reports/ai-crawlers/weekly-report-$(date +\%Y\%m\%d).txt 2>&1

# AI 爬虫月报 - 每月1号凌晨3点运行（最近90天）
0 3 1 * * cd /var/www/chinahuib2b && bash scripts/monitor-ai-crawlers.sh 90 > /home/sardenesy/reports/ai-crawlers/monthly-report-$(date +\%Y\%m\%d).txt 2>&1
```

**验证**:
```bash
# 查看 crontab
crontab -l

# 手动触发一次测试
bash /var/www/chinahuib2b/scripts/monitor-ai-crawlers.sh 7
```

**交付物**:
- ✅ Crontab 配置完成
- ✅ 测试运行成功
- ✅ 报告文件生成在正确位置

---

### 任务 1.2: 设置日志轮转

**目标**: 防止日志文件过大，自动清理旧日志

**操作**:

```bash
# 1. 创建 logrotate 配置
sudo nano /etc/logrotate.d/ai-monitoring
```

**添加内容**:

```
/var/log/ai-monitoring/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}

/home/sardenesy/reports/ai-crawlers/*.txt {
    monthly
    rotate 12
    compress
    delaycompress
    missingok
    notifempty
    create 0644 sardenesy sardenesy
}
```

**验证**:
```bash
# 测试 logrotate 配置
sudo logrotate -d /etc/logrotate.d/ai-monitoring

# 强制运行一次
sudo logrotate -f /etc/logrotate.d/ai-monitoring
```

---

### 任务 1.3: 设置告警机制

**目标**: 当检测到异常活动时立即通知

**操作**:

```bash
# 1. 创建告警脚本
nano /var/www/chinahuib2b/scripts/ai-alert.sh
```

**添加内容**:

```bash
#!/bin/bash

# AI 爬虫异常活动告警脚本

LOG_FILE="/var/log/ai-monitoring/daily.log"
ALERT_EMAIL="admin@chinahuib2b.top"

# 检查是否有未授权访问尝试
UNAUTHORIZED_COUNT=$(grep -c "unauthorized_access" "$LOG_FILE" 2>/dev/null || echo "0")

if [ "$UNAUTHORIZED_COUNT" -gt 5 ]; then
    echo "⚠️ 检测到 $UNAUTHORIZED_COUNT 次未授权访问尝试" | \
    mail -s "[URGENT] AI Security Alert - ChinaHui B2B" "$ALERT_EMAIL"
fi

# 检查是否有严重违规
VIOLATION_COUNT=$(grep -c "privacy_violation" "$LOG_FILE" 2>/dev/null || echo "0")

if [ "$VIOLATION_COUNT" -gt 0 ]; then
    echo "🚨 检测到 $VIOLATION_COUNT 次隐私违规" | \
    mail -s "[CRITICAL] Privacy Violation Detected - ChinaHui B2B" "$ALERT_EMAIL"
fi
```

**添加到 crontab**:

```cron
# 每小时检查一次异常
0 * * * * bash /var/www/chinahuib2b/scripts/ai-alert.sh
```

---

### 任务 1.4: 创建基线报告

**目标**: 记录当前的 AI 爬虫活动状态，作为后续对比的基准

**操作**:

```bash
# 1. 运行监控脚本生成基线报告
cd /var/www/chinahuib2b
bash scripts/monitor-ai-crawlers.sh 30 > /home/sardenesy/reports/ai-crawlers/baseline-report-$(date +%Y%m%d).txt

# 2. 查看报告内容
cat /home/sardenesy/reports/ai-crawlers/baseline-report-*.txt
```

**报告应包含**:
- 当前 AI 爬虫访问量（可能为0，这是正常的）
- 热门访问路径
- 响应状态码分布
- 任何已发现的异常

---

## 🔐 第二部分：AI 托管聊天系统（核心功能）

### 任务 2.1: 实现聊天权限验证 API

**目标**: 创建 API 端点，验证 AI 是否有权访问特定聊天

**参考文档**: 
- `/home/sardenesy/projects/chinahuib2b/AI_CHAT_HOSTING_SPEC.md`
- `/home/sardenesy/projects/chinahuib2b/src/lib/chat-permissions.ts`

**需要创建的 API 端点**:

#### 1. POST /api/chat/hosting/enable

**功能**: 用户启用 AI 托管聊天

**请求示例**:
```json
{
  "userId": "user_123",
  "config": {
    "scope": {
      "privateChats": true,
      "groupChats": false,
      "specificChats": ["chat_456"]
    },
    "rules": {
      "autoReplyEnabled": true,
      "maxMessagesPerHour": 50,
      "allowedActions": ["read", "reply"]
    }
  }
}
```

**响应**:
```json
{
  "success": true,
  "config": { ... },
  "message": "AI hosting enabled successfully"
}
```

**实现要点**:
- 强制应用隐私设置（`neverAccessOthersChats: true`）
- 验证用户身份
- 记录启用日志

---

#### 2. POST /api/chat/hosting/disable

**功能**: 用户禁用 AI 托管

**请求**:
```json
{
  "userId": "user_123",
  "reason": "user_requested"
}
```

**响应**:
```json
{
  "success": true,
  "message": "AI hosting disabled"
}
```

---

#### 3. POST /api/chat/hosting/configure

**功能**: 配置 AI 托管规则

**请求**:
```json
{
  "userId": "user_123",
  "updates": {
    "scope": {
      "privateChats": false
    },
    "rules": {
      "maxMessagesPerHour": 100
    }
  }
}
```

**验证**:
- 不允许修改隐私设置（必须保持 `true`）
- 记录配置变更

---

#### 4. GET /api/chat/hosting/status

**功能**: 查询 AI 托管状态

**请求**: `GET /api/chat/hosting/status?userId=user_123`

**响应**:
```json
{
  "enabled": true,
  "config": { ... },
  "activeChats": ["chat_456", "chat_789"],
  "stats": {
    "totalMessages": 1234,
    "violations": 0
  }
}
```

---

#### 5. GET /api/chat/hosting/violations

**功能**: 查看违规记录（仅管理员）

**请求**: `GET /api/chat/hosting/violations?userId=user_123&limit=50`

**响应**:
```json
{
  "violations": [
    {
      "id": "viol_123",
      "type": "unauthorized_access",
      "severity": "critical",
      "timestamp": "2026-05-18T10:30:00Z",
      "details": "Attempted to access chat without permission"
    }
  ],
  "total": 1
}
```

---

### 任务 2.2: 集成权限验证到现有聊天系统

**目标**: 在所有聊天相关的 API 路由中添加权限检查

**需要修改的文件**:
- `src/app/api/chat/[chatId]/messages/route.ts`
- `src/app/api/chat/[chatId]/route.ts`
- 其他聊天相关的路由

**实现方式**:

```typescript
import { verifyChatPermission } from '@/lib/chat-permissions'

export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const userId = getUserIdFromSession(req)
  const isAIHosted = req.headers.get('x-ai-hosted') === 'true'
  
  // 验证权限
  const permission = await verifyChatPermission({
    userId,
    chatId: params.chatId,
    action: 'read',
    isAIHosted,
  })
  
  if (!permission.allowed) {
    return NextResponse.json(
      { error: 'Access denied', reason: permission.reason },
      { status: 403 }
    )
  }
  
  // 继续处理请求...
}
```

---

### 任务 2.3: 实现群聊同意机制

**目标**: 为群聊启用 AI 托管时，需要所有成员同意

**实现步骤**:

1. **创建同意管理 API**:

```typescript
// POST /api/chat/[chatId]/consent
export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const { userId, granted } = await req.json()
  
  // 验证用户是群聊成员
  const isMember = await isUserInChat(userId, params.chatId)
  if (!isMember) {
    return NextResponse.json({ error: 'Not a member' }, { status: 403 })
  }
  
  // 记录同意状态
  const key = `chat:consent:${params.chatId}:${userId}`
  await redis.set(key, granted ? 'granted' : 'denied')
  
  return NextResponse.json({ success: true })
}
```

2. **检查所有成员同意状态**:

```typescript
// GET /api/chat/[chatId]/consent-status
export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const members = await getChatMembers(params.chatId)
  
  const consentStatus = await Promise.all(
    members.map(async (memberId) => ({
      userId: memberId,
      consented: await hasMemberConsented(memberId, params.chatId),
    }))
  )
  
  const allConsented = consentStatus.every(m => m.consented)
  
  return NextResponse.json({
    chatId: params.chatId,
    allConsented,
    members: consentStatus,
  })
}
```

---

### 任务 2.4: 实现违规检测和阻止

**目标**: 实时检测并阻止隐私违规行为

**参考文件**: `/home/sardenesy/projects/chinahuib2b/src/lib/privacy-violation-detector.ts`

**实现要点**:

1. **检测未授权访问**:
```typescript
if (!isParticipant) {
  await recordViolation({
    userId,
    chatId,
    violationType: 'unauthorized_access',
    severity: 'critical',
  })
  return { blocked: true, reason: 'Unauthorized access' }
}
```

2. **检测跨聊天窥探**:
```typescript
const recentAccesses = await getRecentChatAccesses(userId, 300)
if (recentAccesses.length > 10) {
  // 检查是否访问了不相关的聊天
  const unrelatedCount = await countUnrelatedChats(recentAccesses)
  if (unrelatedCount > 5) {
    await recordViolation({
      type: 'cross_chat_snooping',
      severity: 'severe',
    })
    return { blocked: true }
  }
}
```

3. **检测商业间谍**:
```typescript
if (userType === 'seller' && targetOwner !== userId) {
  const bothAreSellers = await Promise.all([
    isSeller(userId),
    isSeller(targetOwner),
  ])
  
  if (bothAreSellers.every(Boolean)) {
    await recordViolation({
      type: 'commercial_espionage',
      severity: 'severe',
    })
    await disableAIHosting(userId, 'commercial_espionage')
    return { blocked: true }
  }
}
```

---

### 任务 2.5: 创建审计日志系统

**目标**: 记录所有 AI 托管活动，用于审计和分析

**实现**:

```typescript
// src/lib/ai-hosting-audit.ts

export interface AuditLog {
  id: string
  userId: string
  chatId: string
  action: 'enabled' | 'disabled' | 'configured' | 'accessed' | 'violation'
  details: Record<string, any>
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

export async function logAIHostingEvent(event: Omit<AuditLog, 'id' | 'timestamp'>) {
  const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const log: AuditLog = {
    ...event,
    id,
    timestamp: new Date(),
  }
  
  // 存储到 Redis（保留90天）
  const key = `ai:audit:${event.userId}`
  await redis.lpush(key, JSON.stringify(log))
  await redis.ltrim(key, 0, 9999)
  await redis.expire(key, 90 * 24 * 60 * 60)
  
  // 严重事件立即告警
  if (event.action === 'violation') {
    await sendAlert({
      type: 'ai_hosting_violation',
      userId: event.userId,
      details: event.details,
    })
  }
}
```

---

## 📊 第三部分：长期数据分析和优化

### 任务 3.1: 每周数据汇总

**目标**: 每周生成 AI 爬虫活动和 AI 托管使用情况的报告

**操作**:

创建脚本 `/var/www/chinahuib2b/scripts/weekly-analysis.sh`:

```bash
#!/bin/bash

# 每周数据分析脚本

REPORT_DIR="/home/sardenesy/reports/ai-analytics"
WEEK_START=$(date -d "7 days ago" +%Y%m%d)
WEEK_END=$(date +%Y%m%d)

mkdir -p "$REPORT_DIR"

# 1. AI 爬虫活动统计
echo "=== AI Crawler Activity (Week $WEEK_START to $WEEK_END) ===" > "$REPORT_DIR/weekly-$WEEK_END.txt"
grep -E "(GPTBot|ClaudeBot|PerplexityBot)" /var/log/nginx/access.log.* | \
  grep "$(date -d "7 days ago" +%d/%b/%Y)" -A 7 >> "$REPORT_DIR/weekly-$WEEK_END.txt"

# 2. AI 托管使用情况
echo "" >> "$REPORT_DIR/weekly-$WEEK_END.txt"
echo "=== AI Hosting Usage ===" >> "$REPORT_DIR/weekly-$WEEK_END.txt"
redis-cli --raw keys "ai:hosting:*" | wc -l >> "$REPORT_DIR/weekly-$WEEK_END.txt"

# 3. 违规统计
echo "" >> "$REPORT_DIR/weekly-$WEEK_END.txt"
echo "=== Privacy Violations ===" >> "$REPORT_DIR/weekly-$WEEK_END.txt"
redis-cli --raw llen "privacy:violations" >> "$REPORT_DIR/weekly-$WEEK_END.txt"

# 发送邮件报告
mail -s "Weekly AI Analytics Report - Week $WEEK_END" admin@chinahuib2b.top < "$REPORT_DIR/weekly-$WEEK_END.txt"
```

**添加到 crontab**:

```cron
# 每周数据分析 - 每周一上午9点
0 9 * * 1 bash /var/www/chinahuib2b/scripts/weekly-analysis.sh
```

---

### 任务 3.2: 创建可视化仪表板（可选）

**目标**: 创建一个简单的 Web 页面，展示 AI 活动数据

**技术栈**: 
- Next.js API routes
- Chart.js 或 Recharts
- Redis 数据源

**页面路由**: `/admin/ai-analytics`

**展示内容**:
- AI 爬虫访问量趋势图
- 热门访问路径
- AI 托管用户数量
- 违规事件统计
- 响应时间分布

**实现提示**:
```typescript
// src/app/(dashboard)/admin/ai-analytics/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { LineChart, BarChart } from 'recharts'

export default function AIAnalyticsDashboard() {
  const [crawlerData, setCrawlerData] = useState([])
  const [hostingStats, setHostingStats] = useState({})
  
  useEffect(() => {
    // 从 API 获取数据
    fetch('/api/admin/ai-analytics')
      .then(res => res.json())
      .then(setCrawlerData)
  }, [])
  
  return (
    <div>
      <h1>AI Analytics Dashboard</h1>
      <LineChart data={crawlerData} />
      {/* 更多图表 */}
    </div>
  )
}
```

---

### 任务 3.3: A/B 测试框架

**目标**: 测试不同的元数据配置对 AI 引用的影响

**实现**:

1. **创建 A/B 测试中间件**:

```typescript
// src/middleware/ab-test.ts

export function abTestMiddleware(req: NextRequest) {
  const userId = getUserId(req)
  const testGroup = getTestGroup(userId) // 'A' or 'B'
  
  if (testGroup === 'A') {
    // 当前元数据配置
    req.headers.set('x-meta-version', 'current')
  } else {
    // 增强元数据配置
    req.headers.set('x-meta-version', 'enhanced')
  }
  
  return NextResponse.next()
}
```

2. **跟踪结果**:

```typescript
// 记录哪个版本的页面被 AI 引用更多
async function trackAIReference(metaVersion: string, url: string) {
  const key = `ab:test:ai-references:${metaVersion}`
  await redis.hincrby(key, url, 1)
}
```

3. **分析结果**:

```bash
# 比较两个版本的 AI 引用次数
redis-cli HGETALL "ab:test:ai-references:current"
redis-cli HGETALL "ab:test:ai-references:enhanced"
```

---

## 🔧 第四部分：性能优化和维护

### 任务 4.1: 修复 404 错误

**目标**: 定期检查并修复 broken links

**操作**:

```bash
# 1. 安装 broken link checker
npm install -g broken-link-checker

# 2. 创建检查脚本
nano /var/www/chinahuib2b/scripts/check-broken-links.sh
```

**脚本内容**:

```bash
#!/bin/bash

blc https://chinahuib2b.top -ro --filter-level 2 > /tmp/broken-links.txt

if [ -s /tmp/broken-links.txt ]; then
    echo "Found broken links:"
    cat /tmp/broken-links.txt
    mail -s "Broken Links Detected" admin@chinahuib2b.top < /tmp/broken-links.txt
fi
```

**添加到 crontab**:

```cron
# 每周检查 broken links
0 10 * * 1 bash /var/www/chinahuib2b/scripts/check-broken-links.sh
```

---

### 任务 4.2: 优化慢速页面

**目标**: 识别并优化加载时间超过 2 秒的页面

**操作**:

1. **启用性能监控**:

```typescript
// src/middleware/performance-monitor.ts

export function performanceMonitor(req: NextRequest) {
  const start = Date.now()
  
  const response = NextResponse.next()
  
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  
  if (Date.now() - start > 2000) {
    console.warn(`[Slow Page] ${req.nextUrl.pathname} took ${Date.now() - start}ms`)
  }
  
  return response
}
```

2. **分析日志**:

```bash
# 查找慢速页面
grep "Slow Page" /var/log/nextjs/app.log | sort | uniq -c | sort -rn
```

---

### 任务 4.3: 移动端 PWA 优化

**目标**: 确保移动端体验流畅

**检查清单**:
- [ ] Lighthouse 移动端评分 > 90
- [ ] 首屏加载时间 < 2 秒
- [ ] 触摸响应流畅
- [ ] 离线功能正常

**工具**:
```bash
# 使用 Lighthouse CLI
npm install -g lighthouse
lighthouse https://chinahuib2b.top --view --output=html --output-path=./report.html
```

---

## 📝 第五部分：文档和报告

### 任务 5.1: 创建运维文档

**目标**: 记录所有配置和操作步骤，方便后续维护

**文件位置**: `/home/sardenesy/projects/chinahuib2b/OPERATIONS_MANUAL.md`

**内容包括**:
1. 系统架构说明
2. 部署流程
3. 监控和告警配置
4. 故障排查指南
5. 备份和恢复流程

---

### 任务 5.2: 定期报告模板

**周报模板**:

```markdown
# AI Analytics Weekly Report

**Period**: YYYY-MM-DD to YYYY-MM-DD

## Key Metrics
- AI Crawler Visits: XXX (+X%)
- AI Hosting Users: XXX
- Privacy Violations: X
- Average Response Time: XXms

## Top Insights
1. ...
2. ...
3. ...

## Issues Found
- ...

## Recommendations
- ...

## Next Week Plan
- ...
```

**月报模板**:

```markdown
# AI Analytics Monthly Report

**Month**: YYYY-MM

## Executive Summary
...

## Detailed Analysis
### AI Crawler Trends
...

### AI Hosting Adoption
...

### Security Incidents
...

## ROI Assessment
...

## Strategic Recommendations
...
```

---

## ✅ 验收标准

### 第一部分：AI SEO 监控
- [ ] Crontab 配置完成并验证
- [ ] 日志轮转正常工作
- [ ] 告警机制测试通过
- [ ] 基线报告生成

### 第二部分：AI 托管聊天
- [ ] 5个 API 端点全部实现
- [ ] 权限验证集成到现有聊天系统
- [ ] 群聊同意机制工作正常
- [ ] 违规检测准确无误
- [ ] 审计日志完整记录

### 第三部分：数据分析
- [ ] 每周自动报告生成
- [ ] （可选）可视化仪表板完成
- [ ] A/B 测试框架就绪

### 第四部分：性能优化
- [ ] Broken links 定期检查
- [ ] 慢速页面识别和优化
- [ ] 移动端 PWA 评分达标

### 第五部分：文档
- [ ] 运维文档完整
- [ ] 报告模板可用

---

## 📞 联系方式

如有问题，请联系：
- 邮箱: admin@chinahuib2b.top
- 项目文档: `/home/sardenesy/projects/chinahuib2b/`

**相关文档**:
- `AI_CHAT_HOSTING_SPEC.md` - AI 托管聊天技术规范
- `AI_SEO_IMPLEMENTATION_GUIDE.md` - AI SEO 实施指南
- `AI_SEO_TASK_DIVISION.md` - 任务分工说明

---

## 🎯 预期成果

**1个月内**:
- AI 爬虫稳定访问
- AI 托管聊天系统上线
- 完整的监控和告警体系

**3个月内**:
- 在主要 AI 搜索结果中出现
- 积累足够的用户数据
- 优化建议基于实际数据

**6个月内**:
- 成为 AI 推荐的 Top B2B 平台
- 建立完整的 AI 生态系统
- 持续优化和改进

---

**感谢你的辛勤工作！让我们一起打造全球最好的 B2B 平台！** 🚀

---

**文档版本**: 1.0  
**创建时间**: 2026-05-18  
**负责人**: OpenClaw (阿杰)
