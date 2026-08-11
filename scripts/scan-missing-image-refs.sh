#!/bin/bash
# 在生产服务器上执行：导出所有 /uploads/ 引用，比对文件系统
set -uo pipefail

PROJ_DIR="/var/www/chinahuib2b"
DB_PASS=$(grep '^DATABASE_URL' "${PROJ_DIR}/.env.production" | sed -E 's#.*://[^:]+:([^@]+)@.*#\1#')
REPORT="/tmp/all-image-refs-$(date +%Y%m%d_%H%M%S).txt"
MISSING="/tmp/missing-image-refs-$(date +%Y%m%d_%H%M%S).txt"

echo "=== 导出所有图片引用 ==="
PGPASSWORD="${DB_PASS}" psql -h localhost -U expo_dev -d global_expo_dev -t -A -F '|' -f /tmp/extract_all_image_refs.sql > "$REPORT" 2>/dev/null

TOTAL=$(grep -c '|' "$REPORT")
echo "总引用数: $TOTAL"

echo "=== 比对文件系统 ==="
echo "table|column|record_id|missing_path" > "$MISSING"
MISSING_COUNT=0
EXISTING_COUNT=0

while IFS='|' read -r tbl col rid path; do
  [ -z "$tbl" ] && continue
  [ "$tbl" = "tbl" ] && continue  # skip header
  [ -z "$path" ] && continue
  # 去除查询参数
  clean_path="${path%%\?*}"
  full_path="${PROJ_DIR}/public${clean_path}"
  if [ -f "$full_path" ]; then
    EXISTING_COUNT=$((EXISTING_COUNT + 1))
  else
    MISSING_COUNT=$((MISSING_COUNT + 1))
    echo "${tbl}|${col}|${rid}|${clean_path}" >> "$MISSING"
  fi
done < "$REPORT"

echo ""
echo "=== 扫描结果 ==="
echo "总引用: $TOTAL"
echo "存在:   $EXISTING_COUNT"
echo "缺失:   $MISSING_COUNT"
echo ""
if [ "$MISSING_COUNT" -gt 0 ]; then
  echo "=== 缺失引用按表分布 ==="
  tail -n +2 "$MISSING" | cut -d'|' -f1 | sort | uniq -c | sort -rn
  echo ""
  echo "=== 缺失引用按列分布 ==="
  tail -n +2 "$MISSING" | cut -d'|' -f1,2 | sort | uniq -c | sort -rn
  echo ""
  echo "=== 缺失详情（前30条）==="
  head -31 "$MISSING" | tail -30 | column -t -s'|'
  echo ""
  echo "完整报告: $MISSING"
else
  echo "✅ 所有图片引用都有效！"
fi
