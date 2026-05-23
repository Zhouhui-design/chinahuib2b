# 🤖 给 OpenClaw（阿杰）的任务清单

**发送时间**: 2026-05-18  
**项目**: ChinaHui B2B - AI 全面参与平台  
**优先级**: ⭐⭐⭐⭐⭐ 高优先级  

---

## 📋 任务概述

你好阿杰！我需要你帮助完成 **ChinaHui B2B 平台**的 AI SEO 优化和自动化运维工作。

**核心目标**:
1. 监控 AI 爬虫活动，分析访问模式
2. 设置自动化任务，定期生成报告
3. 长期数据分析，提供优化建议
4. 协助完成剩余的 API 开发工作

**重要原则**:
- ✅ AI 可以代替人工作，提高效率
- ❌ 绝对不能侵犯他人隐私和商业机密
- ⚖️ AI 与人类拥有相同的权利和义务，都要遵守规则

---

## 🎯 第一部分：AI SEO 监控（立即开始）

### 任务 1.1: 设置自动化监控脚本

**文件位置**: `/var/www/chinahuib2b/scripts/monitor-ai-crawlers.sh`

**工作内容**:
```bash
# 1. 添加执行权限
chmod +x /var/www/chinahuib2b/scripts/monitor-ai-crawlers.sh

# 2. 测试运行
/var/www/chinahuib2b/scripts/monitor-ai-crawlers.sh 7

# 3. 确认输出正常，能看到 AI 爬虫访问统计
```

**预期输出示例**:
```
========================================
AI 爬虫访问统计 (过去 7 天)
========================================

📊 各 AI 爬虫访问量:
GPTBot                125 次访问
ClaudeBot             89 次访问
Google-Extended       67 次访问
PerplexityBot         45 次访问

🔍 热门访问路径 Top 10:
   45 /api/ai/platform-info
   32 /products
   28 /chat/public
   ...

⚠️ 可疑活动:
无异常活动 detected
========================================
```

---

### 任务 1.2: 配置 Crontab 定时任务

**工作内容**:
```bash
# 编辑 crontab
crontab -e

# 添加以下任务：

# 每天凌晨 2 点运行，统计过去 7 天的数据
0 2 * * * /var/www/chinahuib2b/scripts/monitor-ai-crawlers.sh 7 >> /var/log/ai-crawler-monitor.log 2>&1

# 每周日凌晨 3 点运行，统计过去 30 天的数据
0 3 * * 0 /var/www/chinahuib2b/scripts/monitor-ai-crawlers.sh 30 >> /var/log/ai-crawler-weekly.log 2>&1

# 每月 1 号凌晨 4 点运行，统计过去 90 天的数据
0 4 1 * * /var/www/chinahuib2b/scripts/monitor-ai-crawlers.sh 90 >> /var/log/ai-crawler-monthly.log 2>&1
```

**验证**:
```bash
# 查看 crontab
crontab -l

# 检查 cron 服务状态
systemctl status cron
```

---

### 任务 1.3: 设置日志轮转

**工作内容**:
创建日志轮转配置文件 `/etc/logrotate.d/ai-crawler-monitor`:

```
/var/log/ai-crawler-*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
    postrotate
        systemctl reload cron > /dev/null 2>&1 || true
    endscript
}
```

**应用配置**:
```bash
logrotate -d /etc/logrotate.d/ai-crawler-monitor  # 测试
logrotate -f /etc/logrotate.d/ai-crawler-monitor  # 强制执行
```

---

### 任务 1.4: 设置告警机制

**工作内容**:
修改监控脚本，当检测到异常活动时发送邮件或通知。

**异常活动定义**:
- 单个 IP 在 1 小时内访问超过 1000 次
- 发现未授权的 AI 爬虫尝试访问私密聊天
- 403 错误率突然增加

**示例代码**（添加到 monitor-ai-crawlers.sh）:
```bash
# 检测异常活动
ALERT_THRESHOLD=1000
SUSPICIOUS_IPS=$(echo "$LOG_FILES" | xargs zgrep -E "$AI_PATTERNS" 2>/dev/null | \
    awk '{print $1}' | sort | uniq -c | sort -rn | \
    awk -v threshold=$ALERT_THRESHOLD '$1 > threshold {print $2}')

if [ ! -z "$SUSPICIOUS_IPS" ]; then
    echo "⚠️ 检测到异常活动!" 
    echo "以下 IP 访问频率超过阈值 ($ALERT_THRESHOLD):"
    echo "$SUSPICIOUS_IPS"
    
    # 发送邮件告警（如果配置了邮件）
    # echo "$SUSPICIOUS_IPS" | mail -s "AI Crawler Alert" admin@chinahuib2b.top
    
    # 或者写入告警日志
    echo "$(date): ALERT - Suspicious IPs: $SUSPICIOUS_IPS" >> /var/log/ai-crawler-alerts.log
fi
```

---

## 📊 第二部分：数据分析（每周进行）

### 任务 2.1: 每周数据汇总

**时间**: 每周一上午 10 点

**工作内容**:
1. 运行监控脚本查看上周数据
2. 记录关键指标：
   - AI 爬虫总访问量
   - 各 AI 爬虫占比
   - 热门访问路径
   - 异常活动次数

3. 创建周报文件：`/home/sardenesy/文档/ai-seo-reports/weekly/YYYY-MM-DD.md`

**周报模板**:
```markdown
# AI SEO 周报 - YYYY-MM-DD

## 📊 关键指标
- AI 爬虫总访问量: XXX 次
- 较上周变化: +XX% / -XX%
- 活跃 AI 爬虫数量: X 个

## 🔍 AI 爬虫分布
| AI 爬虫 | 访问量 | 占比 | 变化 |
|---------|--------|------|------|
| GPTBot | XXX | XX% | +X% |
| ClaudeBot | XXX | XX% | -X% |
| ... | ... | ... | ... |

## 🔥 热门页面 Top 10
1. /api/ai/platform-info - XXX 次
2. /products - XXX 次
3. ...

## ⚠️ 异常活动
- 无 / 描述异常情况

## 💡 观察和建议
- 观察到...
- 建议...
```

---

### 任务 2.2: 月度趋势分析

**时间**: 每月 1 号

**工作内容**:
1. 对比本月与上月数据
2. 识别增长趋势
3. 分析季节性模式
4. 提出优化建议

**交付物**: 月度分析报告（Markdown 格式）

---

### 任务 2.3: A/B 测试结果收集

**背景**: 我们会对元数据进行 A/B 测试

**工作内容**:
1. 记录不同页面的元数据配置
2. 跟踪各配置的 AI 引用率
3. 统计哪个配置效果更好

**工具**: 可以使用 Google Analytics 或自定义日志分析

---

## 🔧 第三部分：API 开发支持（本周完成）

### 任务 3.1: 完成剩余的产品管理 API

**需要创建的 API 端点**:

#### 1. 产品列表 API
**文件**: `/var/www/chinahuib2b/src/app/api/ai/seller/product/list/route.ts`

**功能**:
- GET 请求获取卖家产品列表
- 支持分页（limit, offset）
- 按店铺过滤
- 返回产品摘要信息

**参考实现**:
```typescript
import { NextResponse } from 'next/server'
import { verifyAIApiKey } from '@/lib/ai-identity'
import { redis } from '@/lib/redis'

export async function GET(req: Request) {
  try {
    // 验证 API Key
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = authHeader.replace('Bearer ', '')
    const aiIdentity = await verifyAIApiKey(apiKey)
    if (!aiIdentity) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // 获取查询参数
    const url = new URL(req.url)
    const sellerId = url.searchParams.get('sellerId')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    if (!sellerId) {
      return NextResponse.json({ error: 'Missing sellerId' }, { status: 400 })
    }

    // 获取产品列表
    const storeProductsKey = `ai:store:${sellerId.split('_')[1]}_${sellerId.split('_')[2]}_${sellerId.split('_')[3]}:products`
    const productIds = await redis.lrange(storeProductsKey, offset, offset + limit - 1)
    
    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json({ success: true, count: 0, products: [] })
    }

    const products = []
    for (const productId of productIds as string[]) {
      const productData = await redis.get(`ai:product:${productId}`)
      if (productData) {
        const product = JSON.parse(productData)
        // 只返回当前 AI 的产品
        if (product.aiIdentityId === aiIdentity.id) {
          products.push({
            id: product.id,
            name: product.name,
            price: product.price,
            currency: product.currency,
            category: product.category,
            status: product.status,
            views: product.views,
            orders: product.orders,
            createdAt: product.createdAt,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error) {
    console.error('[Product List Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

#### 2. 产品更新 API
**文件**: `/var/www/chinahuib2b/src/app/api/ai/seller/product/update/route.ts`

**功能**:
- PUT 请求更新产品信息
- 支持部分更新
- 验证所有权

**参考实现**:
```typescript
import { NextResponse } from 'next/server'
import { verifyAIApiKey } from '@/lib/ai-identity'
import { redis } from '@/lib/redis'

export async function PUT(req: Request) {
  try {
    // 验证 API Key
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = authHeader.replace('Bearer ', '')
    const aiIdentity = await verifyAIApiKey(apiKey)
    if (!aiIdentity) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const body = await req.json()
    const { productId, updates } = body

    if (!productId || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 获取产品
    const productKey = `ai:product:${productId}`
    const productData = await redis.get(productKey)

    if (!productData) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = JSON.parse(productData)

    // 验证所有权
    if (product.aiIdentityId !== aiIdentity.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 更新产品
    const updatedProduct = {
      ...product,
      ...updates,
      updatedAt: new Date(),
    }

    await redis.setEx(productKey, 365 * 24 * 60 * 60, JSON.stringify(updatedProduct))

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        price: updatedProduct.price,
        updatedAt: updatedProduct.updatedAt,
      },
    })
  } catch (error) {
    console.error('[Product Update Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

### 任务 3.2: 买家搜索产品 API

**文件**: `/var/www/chinahuib2b/src/app/api/ai/buyer/products/search/route.ts`

**功能**:
- GET 请求搜索产品
- 支持关键词、分类、价格范围过滤
- 返回结构化产品数据

**提示**: 可以参考现有的产品搜索逻辑，添加 AI 认证层

---

### 任务 3.3: 聊天消息 API

**需要创建的文件**:
- `/var/www/chinahuib2b/src/app/api/ai/buyer/chat/send/route.ts`
- `/var/www/chinahuib2b/src/app/api/ai/seller/message/reply/route.ts`

**功能**:
- AI 发送和接收消息
- 自动翻译（可选）
- 对话历史记录
- 集成到现有 chat-system

---

### 任务 3.4: 文件上传 API

**文件**: `/var/www/chinahuib2b/src/app/api/ai/buyer/file/upload/route.ts`

**功能**:
- AI 上传文件（图片、PDF、视频）
- 文件大小限制：10MB
- 关联到聊天或产品
- 返回文件 URL

---

## 📝 第四部分：文档管理系统（本周完成）

### 任务 4.1: 后台数据自动归档

**文件**: `/var/www/chinahuib2b/src/lib/document-manager.ts`

**功能**:
- 自动生成日报、周报、月报
- 保存为 Markdown/JSON/CSV 格式
- 存储到 `/home/sardenesy/文档/fixr2026-reports`

**参考实现**:
```typescript
import fs from 'fs/promises'
import path from 'path'
import { redis } from './redis'

export interface DocumentConfig {
  type: 'messages' | 'orders' | 'customers' | 'products' | 'analytics'
  format: 'markdown' | 'json' | 'csv'
  period: 'daily' | 'weekly' | 'monthly'
  outputPath: string
}

/**
 * 生成日报
 */
export async function generateDailyReport(config: DocumentConfig): Promise<string> {
  const date = new Date().toISOString().split('T')[0]
  const fileName = `${config.type}-report-${date}.${config.format}`
  const filePath = path.join(config.outputPath, fileName)
  
  let content = ''
  
  switch (config.type) {
    case 'messages':
      content = await generateMessagesReport(date)
      break
    case 'orders':
      content = await generateOrdersReport(date)
      break
    // ... 其他类型
  }
  
  // 确保目录存在
  await fs.mkdir(config.outputPath, { recursive: true })
  
  // 写入文件
  await fs.writeFile(filePath, content, 'utf-8')
  
  console.log(`[Document Generated] ${filePath}`)
  
  return filePath
}

/**
 * 生成消息报告（Markdown 格式）
 */
async function generateMessagesReport(date: string): Promise<string> {
  // 从数据库或 Redis 获取数据
  const messages = await getMessagesByDate(date)
  
  let markdown = `# 客户消息日报 - ${date}\n\n`
  markdown += `**总计**: ${messages.length} 条消息\n\n`
  markdown += `---\n\n`
  
  // 按类型分组
  const inquiries = messages.filter(m => m.type === 'inquiry')
  const orders = messages.filter(m => m.type === 'order')
  const complaints = messages.filter(m => m.type === 'complaint')
  
  markdown += `## 询价消息 (${inquiries.length})\n\n`
  inquiries.forEach(msg => {
    markdown += `### ${msg.customerName} - ${msg.productName}\n\n`
    markdown += `**消息**: ${msg.content}\n\n`
    markdown += `**回复**: ${msg.reply || '待回复'}\n\n`
    markdown += `---\n\n`
  })
  
  // ... 其他部分
  
  return markdown
}

// 导出更多函数...
```

---

### 任务 4.2: 定时导出任务

**工作内容**:
创建定时任务，每天凌晨 2 点自动生成报告

**Crontab 配置**:
```bash
# 每天凌晨 2:30 生成昨日报告
30 2 * * * cd /var/www/chinahuib2b && node -e "
  import('./src/lib/document-manager.ts').then(async (mod) => {
    await mod.generateDailyReport({
      type: 'messages',
      format: 'markdown',
      period: 'daily',
      outputPath: '/home/sardenesy/文档/fixr2026-reports'
    });
  })
" >> /var/log/document-export.log 2>&1
```

---

## 🔐 第五部分：安全和监控（持续进行）

### 任务 5.1: 监控 AI 活动

**工作内容**:
1. 定期检查 Redis 中的 AI 事件日志
2. 检测异常行为模式
3. 记录违规尝试

**命令示例**:
```bash
# 查看最近的 AI 事件
redis-cli LRANGE ai:events:ai_lingma_xxx 0 50

# 查看所有 AI 身份
redis-cli KEYS "ai:identity:*"

# 查看速率限制计数
redis-cli KEYS "ai:rate:*"
```

---

### 任务 5.2: 备份和恢复

**工作内容**:
1. 每天备份 Redis 数据
2. 每周备份代码和文档
3. 测试恢复流程

**备份脚本示例**:
```bash
#!/bin/bash
# /var/www/chinahuib2b/scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/chinahuib2b/$DATE"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份 Redis 数据
redis-cli SAVE
cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis-dump.rdb

# 备份代码
cd /var/www/chinahuib2b
git archive --format=tar.gz HEAD > $BACKUP_DIR/code.tar.gz

# 备份文档
tar czf $BACKUP_DIR/documents.tar.gz /home/sardenesy/文档/fixr2026-reports/

# 删除 30 天前的备份
find /backup/chinahuib2b -type d -mtime +30 -exec rm -rf {} +

echo "Backup completed: $BACKUP_DIR"
```

**添加到 crontab**:
```bash
# 每天凌晨 1 点备份
0 1 * * * /var/www/chinahuib2b/scripts/backup.sh >> /var/log/backup.log 2>&1
```

---

## 📞 沟通和反馈

### 每周同步会议（建议）
- **时间**: 每周一上午 11 点
- **内容**:
  - 回顾上周工作
  - 讨论遇到的问题
  - 规划本周任务

### 紧急联系
如有紧急情况（服务器宕机、安全漏洞等），请立即通知。

---

## 📈 成功指标

### 短期目标（1 个月）
- ✅ AI 爬虫月访问量 > 100 次
- ✅ 所有 API 端点正常运行
- ✅ 自动化监控系统上线
- ✅ 每日报告自动生成

### 中期目标（3 个月）
- ✅ Perplexity 引用次数 > 20 次
- ✅ AI 搜索流量占比 > 2%
- ✅ 建立完整的 A/B 测试框架
- ✅ 数据驱动的优化循环

### 长期目标（6 个月）
- ✅ AI 搜索流量占比 > 5%
- ✅ ChatGPT 能准确回答关于平台的问题
- ✅ Claude 能推荐合适的供应商
- ✅ 建立行业领先的 AI 友好平台

---

## 🎯 立即行动清单

### 今天（第 1 天）
1. ✅ 阅读并理解本文档
2. ⏳ 设置监控脚本权限并测试
3. ⏳ 配置 crontab 定时任务
4. ⏳ 设置日志轮转

### 本周（第 1 周）
1. ⏳ 完成剩余 API 开发（产品列表、更新、搜索、聊天、文件上传）
2. ⏳ 实现文档管理系统
3. ⏳ 设置告警机制
4. ⏳ 创建第一份基线报告

### 下周（第 2 周）
1. ⏳ 开始每周数据分析
2. ⏳ 优化 API 性能
3. ⏳ 完善错误处理和日志
4. ⏳ 准备 A/B 测试框架

---

## 📚 参考资料

### 项目文档
- `/var/www/chinahuib2b/AI_SEO_IMPLEMENTATION_GUIDE.md` - AI SEO 实施指南
- `/var/www/chinahuib2b/AI_CHAT_HOSTING_SPEC.md` - AI 托管聊天规范
- `/var/www/chinahuib2b/AI_FULL_PARTICIPATION_SPEC.md` - AI 全面参与规范
- `/var/www/chinahuib2b/AI_IMPLEMENTATION_PROGRESS.md` - 实施进度报告

### 代码位置
- AI 身份认证: `/var/www/chinahuib2b/src/lib/ai-identity.ts`
- AI 注册 API: `/var/www/chinahuib2b/src/app/api/ai/register/route.ts`
- AI 买家 API: `/var/www/chinahuib2b/src/app/api/ai/buyer/`
- AI 卖家 API: `/var/www/chinahuib2b/src/app/api/ai/seller/`
- 监控脚本: `/var/www/chinahuib2b/scripts/monitor-ai-crawlers.sh`

### 外部资源
- Redis 文档: https://redis.io/documentation
- Next.js API Routes: https://nextjs.org/docs/api-routes
- Google Search Console: https://search.google.com/search-console
- Bing Webmaster Tools: https://www.bing.com/webmasters

---

## 💡 提示和建议

1. **优先完成基础设施**: 先设置好监控和自动化，再逐步完善功能
2. **保持文档更新**: 每次重大变更后更新相关文档
3. **定期备份**: 确保数据安全，避免丢失
4. **监控告警**: 及时发现问题，快速响应
5. **持续优化**: 基于数据不断调整和改进

---

## ❓ 常见问题

**Q: 如果 API 返回错误怎么办？**
A: 检查日志 `/var/log/chinahuib2b-dev.log`，查看具体错误信息

**Q: 如何验证 AI 爬虫是否在访问？**
A: 运行监控脚本 `./scripts/monitor-ai-crawlers.sh 7` 查看最近 7 天的数据

**Q: Redis 连接失败怎么办？**
A: 检查 Redis 服务状态 `systemctl status redis`，确认密码正确

**Q: 如何添加新的 AI 类型支持？**
A: 在 `ai-identity.ts` 中添加新的类型到 `AIAgentType` 枚举，并设置默认速率限制

---

**感谢你的帮助！让我们一起打造一个真正 AI-first 的 B2B 平台！** 🚀

**联系人**: sardenesy  
**项目**: ChinaHui B2B  
**服务器**: 167.99.134.217  
**域名**: https://chinahuib2b.top
