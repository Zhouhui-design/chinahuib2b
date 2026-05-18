#!/bin/bash

# AI 爬虫活动监控脚本
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
    COUNT=$(echo "$LOG_FILES" | xargs grep -c "$bot" 2>/dev/null || echo "0")
    if [ "$COUNT" -gt 0 ]; then
        printf "%-20s %d 次访问\n" "$bot" "$COUNT"
    fi
done

echo ""
echo "=== 详细访问记录（最近50条）==="
echo ""

echo "$LOG_FILES" | xargs grep -E "$AI_PATTERNS" 2>/dev/null | tail -50 | while IFS= read -r line; do
    # 提取关键信息
    IP=$(echo "$line" | awk '{print $1}')
    DATE=$(echo "$line" | grep -oP '\[.*?\]' | head -1)
    METHOD=$(echo "$line" | grep -oP '"(GET|POST|PUT|DELETE)' | tr -d '"')
    PATH=$(echo "$line" | grep -oP '"(GET|POST|PUT|DELETE) \K[^ ]*')
    STATUS=$(echo "$line" | awk '{print $9}')
    BOT=$(echo "$line" | grep -oP "$AI_PATTERNS" | head -1)
    
    printf "%-15s %-25s %-6s %-40s %s [%s]\n" "$IP" "$DATE" "$STATUS" "$PATH" "$METHOD" "$BOT"
done

echo ""
echo "=== 热门访问路径 Top 10 ==="
echo ""

echo "$LOG_FILES" | xargs grep -E "$AI_PATTERNS" 2>/dev/null | \
    grep -oP '"(GET|POST|PUT|DELETE) \K[^ ]*' | \
    sort | uniq -c | sort -rn | head -10 | \
    while read count path; do
        printf "%-5d %s\n" "$count" "$path"
    done

echo ""
echo "=== 按小时分布 ==="
echo ""

echo "$LOG_FILES" | xargs grep -E "$AI_PATTERNS" 2>/dev/null | \
    grep -oP '\[\d{2}/\w+/\d{4}:\K\d{2}' | \
    sort | uniq -c | sort -k2 | \
    while read count hour; do
        BAR=$(printf '%0.s█' $(seq 1 $((count / 5 + 1))))
        printf "%s:00  %-4d %s\n" "$hour" "$count" "$BAR"
    done

echo ""
echo "=== 响应状态码分布 ==="
echo ""

echo "$LOG_FILES" | xargs grep -E "$AI_PATTERNS" 2>/dev/null | \
    awk '{print $9}' | sort | uniq -c | sort -rn | \
    while read count status; do
        case $status in
            200) ICON="✅" ;;
            301|302|307) ICON="↩️" ;;
            403) ICON="🚫" ;;
            404) ICON="❌" ;;
            500|502|503) ICON="⚠️" ;;
            *) ICON="❓" ;;
        esac
        printf "%s %-4s %d 次\n" "$ICON" "$status" "$count"
    done

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
    echo "$LOG_FILES" | xargs grep -E "$AI_PATTERNS" 2>/dev/null
} > "$REPORT_FILE"

echo ""
echo "=========================================="
echo "  监控完成"
echo "=========================================="
