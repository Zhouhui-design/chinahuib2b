#!/usr/bin/env bash
# UptimeRobot Monitor Setup Script
# Usage: bash scripts/setup-uptimerobot.sh YOUR_API_KEY
#
# Registers at: https://uptimerobot.com/signup (用 sardenesy@gmail.com)
# API Key 在: Dashboard → My Settings → API Keys → Read-Write API Key

set -euo pipefail

API_KEY="${1:-}"
if [ -z "$API_KEY" ]; then
  echo "Usage: bash scripts/setup-uptimerobot.sh YOUR_API_KEY"
  exit 1
fi

API_BASE="https://api.uptimerobot.com/v2"
MONITORS=(
  "https://chinahuib2b.top/"
  "https://chinahuib2b.top/api/health"
)

echo "📡 Setting up UptimeRobot monitors for ChinaHuiB2B..."

for url in "${MONITORS[@]}"; do
  friendly_name="${url#https://}"
  friendly_name="${friendly_name%/}"

  echo "  ➕ Creating monitor: $friendly_name"

  curl -s -X POST "${API_BASE}/newMonitor" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -H "Cache-Control: no-cache" \
    -d "api_key=${API_KEY}" \
    -d "format=json" \
    -d "type=1" \
    -d "url=${url}" \
    -d "friendly_name=${friendly_name}" \
    -d "interval=300" \
    -d "timeout=30" \
    | jq '{stat: .stat, monitor_id: .monitor.id, name: .monitor.friendly_name}'
done

echo ""
echo "✅ UptimeRobot monitors created!"
echo "📊 Dashboard: https://uptimerobot.com/dashboard"
echo ""
echo "📌 Alert contacts (手动配置):"
echo "   1. Dashboard → My Settings → Alert Contacts"
echo "   2. 添加: sardenesy@gmail.com"
echo "   3. 可选: Slack/Webhook 通知"
