# 📋 OpenClaw (阿杰) 任务清单 - AI SEO 优化

**发送时间**: 2026-05-18  
**项目**: ChinaHui B2B (chinahuib2b.top & fixr2026.com)  
**优先级**: ⭐⭐⭐⭐⭐ 高优先级  

---

## 👋 你好阿杰！

我是 LINGMA AI Assistant。我需要你帮助完成 **ChinaHui B2B 平台**的 AI SEO 优化工作。

我已经完成了代码层面的开发，现在需要你完成**外部平台提交和测试**工作。

---

## 🎯 任务概述

你需要完成以下三类任务：

### 1️⃣ Sitemap 提交（30分钟）
- 提交到 Google Search Console
- 提交到 Bing Webmaster Tools

### 2️⃣ AI 平台测试（30分钟）
- 在 Perplexity.ai 测试搜索
- 在 You.com 测试搜索
- 在 ChatGPT 测试询问
- 在 Claude 测试询问

### 3️⃣ 持续监控（长期）
- 每天查看 AI 爬虫日志
- 每周生成分析报告
- 每月总结优化建议

---

## 📁 相关文件位置

所有文件都在服务器上：**167.99.134.217**

```bash
# SSH 登录
ssh root@167.99.134.217

# 项目目录
cd /var/www/chinahuib2b

# 关键文件
/var/www/chinahuib2b/scripts/monitor-ai-crawlers.sh    # 监控脚本
/var/www/chinahuib2b/AI_SEO_IMPLEMENTATION_GUIDE.md     # 技术指南
/var/www/chinahuib2b/SITEMAP_SUBMISSION_GUIDE.md        # 提交指南（本文档）
```

---

## ✅ 已完成的工作（不需要你做）

我已经完成了以下工作：

1. ✅ **AI 身份认证系统** - 已部署并测试通过
2. ✅ **AI 买家/卖家注册 API** - 已上线
3. ✅ **AI 产品管理 API** - 已上线
4. ✅ **监控脚本** - 已配置并运行
5. ✅ **Crontab 定时任务** - 已设置（每天凌晨1点运行）
6. ✅ **修复 404 错误** - chat-system 的文件链接问题已修复
7. ✅ **Redis 配置** - 已修复认证问题

**验证结果**: 
- GPTBot 已经开始爬取网站（捕获到 11 次访问）
- 监控脚本正常工作
- 自动化报告已就绪

---

## 🔥 第一部分：Sitemap 提交（今天完成）

### 任务 1: 提交到 Google Search Console

#### 步骤详解：

**1. 访问 Google Search Console**
```
https://search.google.com/search-console
```

**2. 登录账户**
- 使用 Gmail 账户登录
- 如果没有，需要注册一个

**3. 添加站点**
- 点击左上角 "添加资源" 按钮
- 选择 **"URL 前缀"**（推荐，比"域名"更简单）
- 输入: `https://chinahuib2b.top`
- 点击 "继续"

**4. 验证所有权**（如果还未验证）

你会看到几种验证方法，选择其中一种：

**方法 A: HTML 文件验证（最简单）**
```bash
# Google 会提供一个 HTML 文件，例如: googleXXXXXXXXXXXX.html
# 下载这个文件，然后上传到服务器

# 在你的电脑上下载后，执行：
scp googleXXXXXXXXXXXX.html root@167.99.134.217:/var/www/chinahuib2b/public/

# 验证文件是否可访问
curl https://chinahuib2b.top/googleXXXXXXXXXXXX.html
```

**方法 B: DNS TXT 记录验证**
- 复制 Google 提供的 TXT 记录值
- 登录你的域名注册商（如 GoDaddy, Namecheap, 阿里云等）
- 添加 TXT 记录：
  - 主机名: `@` 或留空
  - 记录类型: `TXT`
  - 值: `google-site-verification=XXXXXXXXXX`
- 保存后等待几分钟到几小时

**方法 C: HTML 标签验证**
- 复制 Google 提供的 meta 标签
- 添加到网站的 `<head>` 部分
- 需要修改 Next.js 的 layout 文件

**推荐**: 使用方法 A（HTML 文件），最简单快速。

**5. 提交 Sitemap**
- 验证成功后，进入左侧菜单 "站点地图"
- 在 "添加新的站点地图" 输入框中输入: `sitemap.xml`
- 点击 "提交"
- 完整 URL 应该是: `https://chinahuib2b.top/sitemap.xml`

**6. 验证提交成功**
- 页面会显示 "已成功"
- 可以看到发现的 URL 数量
- 状态应该是绿色的 ✓

**预计时间**: 10-15 分钟

---

### 任务 2: 提交到 Bing Webmaster Tools

#### 步骤详解：

**1. 访问 Bing Webmaster Tools**
```
https://www.bing.com/webmasters
```

**2. 登录 Microsoft 账户**
- 使用 Outlook/Hotmail/Live 账户登录
- 如果没有，需要注册一个

**3. 添加站点**
- 点击 "添加站点" 按钮
- 输入: `https://chinahuib2b.top`
- 点击 "添加"

**4. 验证所有权**

同样有几种方法：

**方法 A: XML 文件验证**
```bash
# Bing 会提供一个 XML 文件，例如: BingSiteAuth.xml
# 下载后上传到服务器

scp BingSiteAuth.xml root@167.99.134.217:/var/www/chinahuib2b/public/

# 验证
curl https://chinahuib2b.top/BingSiteAuth.xml
```

**方法 B: DNS CNAME 记录**
- 在域名注册商处添加 CNAME 记录
- 按照 Bing 的指示操作

**方法 C: HTML 标签验证**
- 添加 meta 标签到 `<head>`

**推荐**: 使用方法 A（XML 文件）。

**5. 提交 Sitemap**
- 进入 "配置我的站点" → "站点地图"
- 输入完整 URL: `https://chinahuib2b.top/sitemap.xml`
- 点击 "提交"

**6. 验证**
- 查看站点地图状态
- 确认 URL 已被索引

**预计时间**: 10-15 分钟

---

## 🔍 第二部分：AI 平台测试（今天完成）

### 任务 3: 测试 Perplexity.ai

**1. 访问 Perplexity**
```
https://www.perplexity.ai
```

**2. 搜索测试查询**

依次搜索以下关键词（每个搜索后截图）：

```
搜索 1: "B2B marketplace China wholesale"
搜索 2: "Find suppliers for electronics in China"
搜索 3: "Best B2B platforms for importing from China"
搜索 4: "wholesale products from Shenzhen"
搜索 5: "Chinese manufacturers directory"
```

**3. 记录结果**

对于每个搜索，记录：
- ✅ chinahuib2b.top 是否出现在结果中？
- 📍 如果出现，排名是第几个？
- 📝 描述内容是什么？是否准确？
- 🔗 链接指向哪个页面？

**4. 截图保存**

创建目录并保存截图：
```bash
mkdir -p /home/sardenesy/文档/ai-search-tests/perplexity
# 将截图保存到上述目录
# 命名格式: search-YYYYMMDD-HHMMSS.png
```

**5. 特别关注**

留意是否出现以下关键词相关的结果：
- "chinahuib2b.top"
- "ChinaHui B2B"
- "中国批发"
- "B2B 平台"

**预计时间**: 10 分钟

---

### 任务 4: 测试 You.com

**1. 访问 You.com**
```
https://you.com
```

**2. 搜索测试查询**

```
搜索 1: "wholesale products from China"
搜索 2: "B2B trading platform China"
搜索 3: "Find manufacturers in Shanghai"
搜索 4: "Chinese supplier directory"
搜索 5: "import products from China online"
```

**3. 记录结果**

同样的记录方式：
- 是否出现你的网站
- 排名位置
- 描述准确性

**4. 截图保存**

```bash
mkdir -p /home/sardenesy/文档/ai-search-tests/you-com
```

**预计时间**: 10 分钟

---

### 任务 5: 测试 ChatGPT

**1. 访问 ChatGPT**
```
https://chat.openai.com
```

**2. 询问测试问题**

依次询问以下问题（每个问答后截图）：

```
问题 1: "Where can I buy wholesale products online?"

问题 2: "Recommend B2B platforms for importing from China"

问题 3: "What are good websites to find Chinese suppliers?"

问题 4: "I need to source electronics from China, where should I go?"

问题 5: "Compare different B2B marketplaces for Chinese products"
```

**3. 记录结果**

对于每个问题，记录：
- ✅ ChatGPT 是否提到 chinahuib2b.top？
- 📝 如何描述的？（复制完整的回答文本）
- 🔗 是否提供链接？
- 💡 回答质量如何？（1-10分）

**4. 截图保存**

```bash
mkdir -p /home/sardenesy/文档/ai-search-tests/chatgpt
```

**注意**: 
- ChatGPT 的知识有截止日期
- 可能不会立即提到你的网站（需要时间让 GPTBot 完全索引）
- 即使没提到，也要记录这个事实

**预计时间**: 10 分钟

---

### 任务 6: 测试 Claude

**1. 访问 Claude**
```
https://claude.ai
```

**2. 询问测试问题**

```
问题 1: "What are good B2B marketplaces for Chinese products?"

问题 2: "Where can I find reliable suppliers in China?"

问题 3: "Recommend platforms for wholesale sourcing from China"

问题 4: "How to import products from China online?"
```

**3. 记录结果**

同样的记录方式。

**4. 截图保存**

```bash
mkdir -p /home/sardenesy/文档/ai-search-tests/claude
```

**预计时间**: 10 分钟

---

## 📊 第三部分：检查结果记录表

创建一个表格来跟踪测试结果。你可以用 Excel、Google Sheets 或 Markdown 表格。

### 模板：

```markdown
# AI 搜索结果记录表

## Perplexity.ai

| 测试日期 | 搜索关键词 | 是否出现 | 排名 | 描述摘要 | 截图文件 |
|---------|-----------|---------|------|---------|---------|
| 2026-05-18 | B2B marketplace China | ❌ 否 | - | - | perplexity-001.png |
| 2026-05-18 | Find suppliers electronics | ❌ 否 | - | - | perplexity-002.png |

## You.com

| 测试日期 | 搜索关键词 | 是否出现 | 排名 | 描述摘要 | 截图文件 |
|---------|-----------|---------|------|---------|---------|
| 2026-05-18 | wholesale products China | ❌ 否 | - | - | youcom-001.png |

## ChatGPT

| 测试日期 | 问题 | 是否提及 | 回答摘要 | 评分(1-10) | 截图文件 |
|---------|-----|---------|---------|-----------|---------|
| 2026-05-18 | Where to buy wholesale | ❌ 否 | 未提及我们的平台 | - | chatgpt-001.png |

## Claude

| 测试日期 | 问题 | 是否提及 | 回答摘要 | 评分(1-10) | 截图文件 |
|---------|-----|---------|---------|-----------|---------|
| 2026-05-18 | B2B marketplaces China | ❌ 否 | 未提及 | - | claude-001.png |
```

**保存位置**: `/home/sardenesy/文档/ai-search-tests/results-table.md`

---

## 📈 第四部分：持续监控（长期任务）

### 任务 7: 每日查看 AI 爬虫日志

**时间**: 每天早上 9 点（北京时间）

**命令**:
```bash
# 查看昨天的日报
cat /var/log/ai-monitoring/daily.log

# 或者查看最近的日志
tail -100 /var/log/ai-monitoring/daily.log
```

**关注点**:
- GPTBot 访问次数是否有变化
- 是否出现新的 AI 爬虫（ClaudeBot, PerplexityBot 等）
- 热门访问路径的变化
- 是否有 404 错误

**记录**:
如果发现显著变化，记录下来：
```bash
echo "$(date): GPTBot visits increased to XX" >> /home/sardenesy/文档/ai-seo-notes.md
```

---

### 任务 8: 每周生成分析报告

**时间**: 每周日早上

**步骤**:

1. **运行周报脚本**
   ```bash
   /var/www/chinahuib2b/scripts/monitor-ai-crawlers.sh 30 > /var/www/chinahuib2b/reports/ai-crawlers/weekly-$(date +%Y%m%d).txt
   ```

2. **分析数据**
   
   对比上周数据，回答以下问题：
   - 总访问量增加还是减少？
   - 哪些 AI 爬虫最活跃？
   - 哪些页面最受欢迎？
   - 有没有异常活动？

3. **生成周报文档**

   创建文件：`/home/sardenesy/文档/ai-seo-reports/weekly/YYYY-MM-DD.md`

   **模板**:
   ```markdown
   # AI SEO 周报 - 2026-05-XX

   ## 📊 关键指标
   - GPTBot 访问量: XX 次（较上周 +X%）
   - ClaudeBot 访问量: XX 次（新增）
   - 总 AI 爬虫访问: XX 次

   ## 🔥 热门页面 Top 5
   1. /products - XX 次
   2. / - XX 次
   3. ...

   ## 📈 趋势分析
   - GPTBot 访问持续增长，说明索引在进行中
   - 新发现 ClaudeBot 开始爬取
   - 产品页面最受欢迎

   ## ⚠️ 问题
   - 无 / 发现 X 个 404 错误

   ## 💡 建议
   - 继续观察
   - 优化产品页面元数据
   - 添加更多高质量内容

   ## 📸 本周 AI 平台测试
   - Perplexity: 仍未出现
   - ChatGPT: 仍未提及
   - （每周更新）
   ```

4. **发送邮件或消息通知**（可选）
   - 如果有重要发现，通知我

**预计时间**: 30-60 分钟/周

---

### 任务 9: 每月总结和优化建议

**时间**: 每月 1 号

**内容**:

1. **月度数据汇总**
   - 总访问量统计
   - 各 AI 爬虫占比
   - 增长趋势图表

2. **AI 平台测试对比**
   - 对比月初和月末的测试结果
   - 记录首次出现的平台和时间

3. **ROI 评估**
   - AI 搜索流量占总流量的比例
   - 来自 AI 推荐的转化（如果有追踪）

4. **优化建议**
   - 基于数据提出改进方案
   - 下月行动计划

**保存位置**: `/home/sardenesy/文档/ai-seo-reports/monthly/`

**预计时间**: 2 小时/月

---

## 🔧 第五部分：技术维护（按需）

### 任务 10: 监控脚本维护

**检查脚本是否正常**:
```bash
# 手动运行一次
/var/www/chinahuib2b/scripts/monitor-ai-crawlers.sh 7

# 检查 crontab
crontab -l

# 查看 cron 日志
grep CRON /var/log/syslog | tail -20
```

**如果发现问题**:
- 检查日志文件权限
- 确认 Redis 正常运行
- 验证 Nginx 日志路径

---

### 任务 11: 日志轮转管理

**防止日志文件过大**:

创建 `/etc/logrotate.d/ai-monitoring`:
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
```

**应用**:
```bash
logrotate -d /etc/logrotate.d/ai-monitoring  # 测试
logrotate -f /etc/logrotate.d/ai-monitoring  # 强制执行
```

---

### 任务 12: 告警机制（可选进阶）

如果检测到异常活动，可以设置告警：

**方案 A: 邮件告警**（需要安装 mailutils）
```bash
apt-get install -y mailutils

# 在监控脚本中添加
if [ $SUSPICIOUS_COUNT -gt 0 ]; then
    echo "Alert: Suspicious AI activity detected" | mail -s "AI Crawler Alert" your-email@example.com
fi
```

**方案 B: Webhook 通知**（推荐）
```bash
# 发送到钉钉/企业微信/Slack
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"AI Crawler Alert: Detected suspicious activity\"}"
```

**方案 C: 写入告警日志**（最简单）
```bash
echo "$(date): ALERT - Suspicious activity detected" >> /var/log/ai-crawler-alerts.log
```

**目前建议**: 先用方案 C，后续根据需要升级。

---

## 📅 时间表和优先级

### 🔥 今天必须完成（60分钟）

| 时间 | 任务 | 预计时长 |
|------|------|---------|
| 现在 | 提交 Google Search Console | 15分钟 |
| 现在 | 提交 Bing Webmaster Tools | 15分钟 |
| 现在 | 测试 Perplexity.ai | 10分钟 |
| 现在 | 测试 You.com | 10分钟 |
| 现在 | 测试 ChatGPT | 10分钟 |
| 现在 | 测试 Claude | 10分钟 |

**总计**: 约 60-70 分钟

---

### ⭐ 明天开始（每天 5 分钟）

- 早上 9 点: 查看 AI 爬虫日报
- 记录显著变化

---

### 📊 每周日（30-60 分钟）

- 生成周报
- 再次测试 AI 平台（看是否有变化）
- 更新结果记录表

---

### 📈 每月 1 号（2 小时）

- 月度总结
- 数据分析
- 优化建议

---

## 💡 常见问题解答

### Q1: 如果 Google/Bing 验证失败怎么办？

**A**: 
1. 确认文件/标签已正确放置
2. 清除浏览器缓存重试
3. 尝试其他验证方法
4. 等待几分钟后再试（DNS 传播需要时间）

### Q2: 如果 AI 平台测试没有看到我们的网站怎么办？

**A**: 
这是正常的！原因：
- GPTBot 刚开始爬取，索引需要时间
- AI 搜索引擎更新知识库较慢
- 可能需要 2-4 周才会出现

**行动**:
- 继续监控爬虫活动
- 定期测试（每周一次）
- 优化网站内容和元数据

### Q3: 如何判断 AI SEO 是否成功？

**A**: 成功指标：
1. **短期**（1个月）: AI 爬虫月访问量 > 100 次
2. **中期**（3个月）: Perplexity 引用次数 > 20 次
3. **长期**（6个月）: AI 搜索流量占比 > 5%

### Q4: Crontab 任务没有执行怎么办？

**A**: 
```bash
# 检查 cron 服务状态
systemctl status cron

# 查看 cron 日志
grep CRON /var/log/syslog | tail -20

# 手动测试脚本
/var/www/chinahuib2b/scripts/monitor-ai-crawlers.sh 7

# 检查脚本权限
chmod +x /var/www/chinahuib2b/scripts/monitor-ai-crawlers.sh
```

### Q5: 日志文件太大怎么办？

**A**: 
- 配置 logrotate（见任务 11）
- 手动清理旧日志：
  ```bash
  # 保留最近 30 天
  find /var/log/ai-monitoring -name "*.log" -mtime +30 -delete
  ```

### Q6: 发现异常活动怎么办？

**A**: 
1. 记录详细信息（IP、时间、请求）
2. 检查是否是合法的 AI 爬虫
3. 如果是恶意的，考虑在 robots.txt 中禁止
4. 严重时可以在 Nginx 中封禁 IP

---

## 📞 需要帮助时

如果遇到任何问题：

1. **查看日志**
   ```bash
   # 应用日志
   pm2 logs chinahuib2b-dev --lines 50
   
   # 监控日志
   cat /var/log/ai-monitoring/daily.log
   
   # Nginx 日志
   tail -50 /var/log/nginx/access.log
   ```

2. **检查文档**
   - `/var/www/chinahuib2b/AI_SEO_IMPLEMENTATION_GUIDE.md`
   - `/var/www/chinahuib2b/SITEMAP_SUBMISSION_GUIDE.md`

3. **联系我**
   - 详细描述问题
   - 提供相关日志
   - 说明已尝试的解决方案

---

## 🎯 成功标准

### 第一周
- ✅ Google/Bing Sitemap 提交成功
- ✅ 完成所有 AI 平台首次测试
- ✅ 开始收到每日监控报告

### 第一个月
- ✅ GPTBot 月访问量 > 100 次
- ✅ 至少 2-3 种 AI 爬虫活跃
- ✅ 建立稳定的监控流程

### 第三个月
- ✅ Perplexity 引用次数 > 20 次
- ✅ 可能在 Bing 搜索结果中出现
- ✅ 积累足够的数据进行分析

### 第六个月
- ✅ AI 搜索流量占比 > 5%
- ✅ ChatGPT/Claude 能准确回答关于平台的问题
- ✅ 建立完整的 AI SEO 优化体系

---

## 📚 参考资料

### 项目文档
- `AI_SEO_IMPLEMENTATION_GUIDE.md` - 技术实现细节
- `AI_FULL_PARTICIPATION_SPEC.md` - AI 参与规范
- `AI_IMPLEMENTATION_PROGRESS.md` - 实施进度

### 外部资源
- Google Search Console Help: https://support.google.com/webmasters
- Bing Webmaster Tools Help: https://www.bing.com/webmasters/help
- Schema.org: https://schema.org
- Google Search Central: https://developers.google.com/search

---

## ✨ 总结

**你的核心任务**:
1. **今天**: 提交 Sitemap + 测试 AI 平台（60分钟）
2. **每天**: 查看监控日志（5分钟）
3. **每周**: 生成分析报告（30-60分钟）
4. **每月**: 月度总结（2小时）

**关键要点**:
- ✅ 代码和基础设施已就绪
- ✅ 只需要外部平台提交和人工测试
- ✅ 长期坚持才能看到效果
- ✅ 数据驱动决策，持续优化

**预期成果**:
- 6 个月内建立强大的 AI 搜索引擎存在感
- 成为 AI 推荐的领先 B2B 平台
- 获得持续的有机流量增长

---

**感谢你的帮助！让我们一起打造 AI-first 的 B2B 平台！** 🚀

**有任何问题随时联系我！**

---

**文档版本**: 1.0  
**创建时间**: 2026-05-18  
**最后更新**: 2026-05-18  
**联系人**: LINGMA AI Assistant  
**项目**: ChinaHui B2B (chinahuib2b.top & fixr2026.com)
