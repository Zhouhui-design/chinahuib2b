#!/bin/bash
#
# 清理 /uploads/products/ 目录下的孤儿图片文件
# 孤儿文件 = 服务器上存在但数据库中没有任何引用的图片
#
# 用法: bash scripts/cleanup-orphan-images.sh
# 参数:
#   --dry-run  仅检查不删除
#   --force    跳过确认直接执行
#
set -e

# ========== 配置 ==========
PROJECT_DIR="${1:-/var/www/chinahuib2b}"
UPLOAD_DIR="$PROJECT_DIR/public/uploads/products"
BACKUP_DIR="$PROJECT_DIR/backup/orphan-images-$(date +%Y%m%d)"
NEXT_CACHE_DIR="$PROJECT_DIR/.next/cache/images"
DB_USER="expo_dev"
DB_NAME="global_expo_dev"
DB_HOST="127.0.0.1"
DB_PORT="5432"
DB_PASS="dev123"
DRY_RUN=false

# 解析参数
for arg in "$@"; do
  case $arg in
    --dry-run) DRY_RUN=true ;;
    --force) FORCE=true ;;
  esac
done

echo "=========================================="
echo "  WebP 孤儿图片清理脚本"
echo "  日期: $(date)"
echo "  模式: $([ "$DRY_RUN" = true ] && echo '预览(不删除)' || echo '执行(备份后删除)')"
echo "=========================================="
echo ""

# ========== 1. 获取数据库引用的图片列表 ==========
echo "=== 1. 获取数据库引用的图片列表 ==="
PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -t -A -c "
SELECT DISTINCT img FROM (
    SELECT unnest(images) AS img FROM \"Product\" WHERE images IS NOT NULL
    UNION
    SELECT \"mainImageUrl\" AS img FROM \"Product\" WHERE \"mainImageUrl\" LIKE '/uploads/products/%'
    UNION
    SELECT \"logoUrl\" AS img FROM \"Booth\" WHERE \"logoUrl\" LIKE '/uploads/products/%'
    UNION
    SELECT \"bannerUrl\" AS img FROM \"Booth\" WHERE \"bannerUrl\" LIKE '/uploads/products/%'
    UNION
    SELECT \"logoUrl\" AS img FROM \"SellerProfile\" WHERE \"logoUrl\" LIKE '/uploads/products/%'
    UNION
    SELECT \"bannerUrl\" AS img FROM \"SellerProfile\" WHERE \"bannerUrl\" LIKE '/uploads/products/%'
) sub
WHERE img LIKE '/uploads/products/%'
ORDER BY img;
" > /tmp/db_images_check.txt
DB_COUNT=$(grep -c "uploads" /tmp/db_images_check.txt 2>/dev/null || echo 0)
echo "数据库引用的图片数: $DB_COUNT"
echo ""

# ========== 2. 找出孤儿文件 ==========
echo "=== 2. 查找孤儿文件 ==="
ORPHAN_LIST=""
ORPHAN_COUNT=0
FREED_SPACE=0

for f in "$UPLOAD_DIR"/*.webp "$UPLOAD_DIR"/*.jpg "$UPLOAD_DIR"/*.png "$UPLOAD_DIR"/*.jpeg; do
    [ ! -f "$f" ] && continue
    BASENAME=$(basename "$f")

    if ! grep -q "$BASENAME" /tmp/db_images_check.txt; then
        SIZE=$(stat -c%s "$f")
        SIZE_HR=$(du -h "$f" | cut -f1)
        echo "  🔸 孤儿: $BASENAME ($SIZE_HR)"
        ORPHAN_LIST="$ORPHAN_LIST $f"
        ORPHAN_COUNT=$((ORPHAN_COUNT + 1))
        FREED_SPACE=$((FREED_SPACE + SIZE))
    fi
done

echo ""
echo "孤儿文件总数: $ORPHAN_COUNT"
echo "可释放空间: $((FREED_SPACE / 1024))KB"
echo ""

if [ "$ORPHAN_COUNT" -eq 0 ]; then
    echo "✅ 没有孤儿文件，无需清理"
    exit 0
fi

# ========== 3. 预览模式或确认 ==========
if [ "$DRY_RUN" = true ]; then
    echo "=== 预览模式完成 (未删除任何文件) ==="
    echo "如需执行清理，请去掉 --dry-run 参数重新运行"
    exit 0
fi

if [ "$FORCE" != "true" ]; then
    read -p "确认清理以上 $ORPHAN_COUNT 个孤儿文件？(y/N) " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "已取消"
        exit 0
    fi
fi

# ========== 4. 备份并删除孤儿文件 ==========
echo ""
echo "=== 3. 备份并清理孤儿文件 ==="
mkdir -p "$BACKUP_DIR"
echo "备份目录: $BACKUP_DIR"

for f in $ORPHAN_LIST; do
    [ ! -f "$f" ] && continue
    mv "$f" "$BACKUP_DIR/"
    echo "  🗑️ 已移除: $(basename "$f")"
done

echo ""
echo "已清理: $ORPHAN_COUNT 个文件"
echo "释放空间: $((FREED_SPACE / 1024))KB"

# ========== 5. 清除 Next.js 图片优化缓存 ==========
echo ""
echo "=== 4. 清除 Next.js 图片优化缓存 ==="
if [ -d "$NEXT_CACHE_DIR" ]; then
    CACHE_SIZE=$(du -sh "$NEXT_CACHE_DIR" | cut -f1)
    CACHE_FILES=$(find "$NEXT_CACHE_DIR" -type f | wc -l)
    rm -rf "$NEXT_CACHE_DIR"/*
    echo "已清除 $CACHE_FILES 个缓存文件 ($CACHE_SIZE)"
fi

# ========== 6. 最终状态 ==========
echo ""
echo "=== 5. 清理后状态 ==="
echo "uploads/products/ 剩余文件: $(ls "$UPLOAD_DIR"/*.* 2>/dev/null | wc -l) 个"
echo "备份的孤儿文件: $(ls "$BACKUP_DIR"/*.* 2>/dev/null | wc -l) 个"
echo ""
echo "=========================================="
echo "  ✅ 清理完成！"
echo "  如需恢复: cp $BACKUP_DIR/* $UPLOAD_DIR/"
echo "=========================================="
