#!/bin/bash
# 清理所有图片相关的Redis缓存
# 在修复数据库中的图片引用后执行此脚本，确保store/exhibition页面立即显示最新数据
#
# 使用方法：
#   bash scripts/clear-image-caches.sh
#
# 此脚本清理以下缓存键：
#   seller:*      - 卖家资料缓存（包括store/[slug]页面缓存）
#   booth:*       - 展位缓存
#   booths:*      - 展位列表缓存
#   exhibition:*  - 展会缓存
#   product:*     - 产品缓存
#   products:*    - 产品列表缓存

set -euo pipefail

echo "=== 清理图片相关Redis缓存 ==="

PATTERNS=("seller:*" "booth:*" "booths:*" "exhibition:*" "product:*" "products:*")
TOTAL_DELETED=0

for pattern in "${PATTERNS[@]}"; do
  # 使用 --scan 避免阻塞Redis（keys命令在大数据集上会阻塞）
  keys=$(redis-cli --scan --pattern "$pattern" 2>/dev/null || true)
  if [ -n "$keys" ]; then
    count=$(echo "$keys" | wc -l)
    echo "$keys" | xargs -r redis-cli DEL > /dev/null 2>&1
    echo "  清理 $pattern : $count 个键"
    TOTAL_DELETED=$((TOTAL_DELETED + count))
  else
    echo "  清理 $pattern : 0 个键"
  fi
done

echo ""
echo "✅ 缓存清理完成，共删除 $TOTAL_DELETED 个键"
echo "所有store/exhibition页面将在下次访问时获取最新数据"
