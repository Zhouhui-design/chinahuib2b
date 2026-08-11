#!/bin/bash
# URL 健康检查 / SEO 抓取监控脚本（多语言多平台版本）
# 用法: ./monitor-ai-seo-all.sh [days]
#
# days: 重新检查 N 天内已检查过的 FAILED 记录（默认 7）
#
# 此脚本最初由 cron 引用但文件缺失，导致 PENDING 任务从未执行。
# 现在作为 url-crawl-worker.ts 的 shell 封装。

set -u
DAYS="${1:-7}"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="/var/log/ai-monitoring"
REPORT_DIR="${PROJECT_DIR}/reports/ai-seo"
TSX="${PROJECT_DIR}/node_modules/.bin/tsx"
WORKER="${PROJECT_DIR}/scripts/url-crawl-worker.ts"
SYS_ENV_FILE="${PROJECT_DIR}/.env.production"
LOCALE_ENV_FILE="${PROJECT_DIR}/.env.local"

mkdir -p "$LOG_DIR" "$REPORT_DIR"

echo "=========================================="
echo "  x2xhub URL Health / SEO Crawl Monitor"
echo "  Days:        ${DAYS}"
echo "  Project:     ${PROJECT_DIR}"
echo "  Start time:  $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

cd "$PROJECT_DIR"

# Load env in a sub-shell safe way: pass via node dotenv
export CRAWL_ENV_FILES="${SYS_ENV_FILE},${LOCALE_ENV_FILE}"

if [ ! -x "$TSX" ]; then
  echo "❌ tsx not found at $TSX — please run: npm install tsx"
  exit 1
fi

if [ ! -f "$WORKER" ]; then
  echo "❌ worker not found at $WORKER"
  exit 1
fi

START=$(date +%s)

# Phase 1: Discover new URLs from sitemap
echo "📦 Phase 1/2: Discover URLs from sitemap..."
"$TSX" "$WORKER" "$DAYS" --discover
PHASE1_RC=$?

# Phase 2: Process PENDING / stale FAILED URLs
echo ""
echo "🔎 Phase 2/2: Crawl pending / stale URLs (concurrency=8, limit=500)..."
"$TSX" "$WORKER" "$DAYS" --crawl --limit=500
PHASE2_RC=$?

END=$(date +%s)
DURATION=$(( END - START ))

echo ""
echo "=========================================="
echo "  Done. Duration: ${DURATION}s"
echo "  RC (discover): ${PHASE1_RC}  RC (crawl): ${PHASE2_RC}"
echo "  Finish time:   $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="

exit $(( PHASE1_RC + PHASE2_RC ))
