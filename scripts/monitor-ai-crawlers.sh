#!/bin/bash

# AI 爬虫活动监控脚本（简化版）
# 用法: ./monitor-ai-crawlers.sh [days]

DAYS=${1:-7}  # 默认查看最近7天
LOG_DIR="/var/log/nginx"
REPORT_DIR="/home/sardenesy/projects/chinahuib2b/reports/ai-crawlers"

# AI 爬虫用户代理模式
AI_PATTERNS="GPTBot|ChatGPT-User|Google-Extended|ClaudeBot|Claude-Web|PerplexityBot|BingBot|msnbot|YouBot|CCBot|AI21Bot|cohere-ai|HuggingFaceBot"

echo "=========================================="
echo "  AI 爬虫活动监控报告"
echo "  时间范围: 最近 ${DAYS} 天"
echo "  生成时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# 创建报告目录
mkdir -p "$REPORT_DIR"

# 查找日志文件
LOG_FILES=$(find "$LOG_DIR" -name "access.log*" -mtime -${DAYS} 2>/dev/null)

if [ -z "$LOG_FILES" ]; then
    echo "❌ 未找到最近的日志文件"
    exit 1
fi

echo "📊 正在分析日志文件..."
echo ""

# 统计各 AI 爬虫的访问量
echo "=== AI 爬虫访问量统计 ==="
echo ""

for bot in GPTBot ChatGPT-User Google-Extended ClaudeBot PerplexityBot BingBot YouBot CCBot; do
    COUNT=$(echo "$LOG_FILES" | xargs zgrep -c "$bot" 2>/dev/null || echo "0")
    if [ "$COUNT" -gt 0 ] 2>/dev/null; then
        printf "%-20s %d 次访问\n" "$bot" "$COUNT"
    fi
done

echo ""
echo "=== 详细访问记录（最近20条）==="
echo ""

echo "$LOG_FILES" | xargs zgrep -E "$AI_PATTERNS" 2>/dev/null | tail -20

echo ""
echo "=== 热门访问路径 Top 10 ==="
echo ""

echo "$LOG_FILES" | xargs zgrep -E "$AI_PATTERNS" 2>/dev/null | \
    grep -oP '"(GET|POST) \K[^ ]*' 2>/dev/null | \
    sort | uniq -c | sort -rn | head -10

echo ""
echo "=== 响应状态码分布 ==="
echo ""

echo "$LOG_FILES" | xargs zgrep -E "$AI_PATTERNS" 2>/dev/null | \
    awk '{print $9}' 2>/dev/null | sort | uniq -c | sort -rn

# 生成详细报告文件
REPORT_FILE="$REPORT_DIR/ai-crawler-report-$(date '+%Y%m%d-%H%M%S').txt"

echo ""
echo "📄 详细报告已保存到: $REPORT_FILE"

{
    echo "AI Crawler Activity Report"
    echo "Generated: $(date)"
    echo "Period: Last ${DAYS} days"
    echo ""
    echo "=== Raw Data ==="
    echo "$LOG_FILES" | xargs zgrep -E "$AI_PATTERNS" 2>/dev/null
} > "$REPORT_FILE"

echo ""
echo "=========================================="
echo "  监控完成"
echo "=========================================="
