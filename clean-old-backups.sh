#!/bin/bash

# Clean up old fixturerb2b.top backup directories
# Keeps the most recent N backups, deletes the rest

set -e

echo "========================================="
echo "🧹 清理 fixturerb2b.top 旧备份"
echo "========================================="
echo ""

# Number of recent backups to keep
KEEP_COUNT=5

# Find all backup directories
BACKUP_DIR="/var/www"
PATTERN="fixturerb2b.top_backup_*"

echo "📊 当前状态:"
echo "   备份目录: $(find $BACKUP_DIR -maxdepth 1 -name '$PATTERN' -type d | wc -l) 个"
echo "   总大小: $(du -sh $BACKUP_DIR/$PATTERN 2>/dev/null | tail -1 | awk '{print $1}')"
echo ""

# List backups by date (newest first)
echo "📋 所有备份（按日期排序，最新的在前）:"
ls -dt $BACKUP_DIR/$PATTERN 2>/dev/null | nl
echo ""

# Get list of backups to delete (all except the most recent KEEP_COUNT)
TO_DELETE=$(ls -dt $BACKUP_DIR/$PATTERN 2>/dev/null | tail -n +$((KEEP_COUNT + 1)))

if [ -z "$TO_DELETE" ]; then
    echo "✅ 不需要清理，备份数量少于或等于 $KEEP_COUNT 个"
    exit 0
fi

# Count and calculate size of backups to delete
DELETE_COUNT=$(echo "$TO_DELETE" | wc -l)
DELETE_SIZE=$(echo "$TO_DELETE" | xargs du -sh 2>/dev/null | tail -1 | awk '{print $1}')

echo "⚠️  即将删除:"
echo "   数量: $DELETE_COUNT 个备份"
echo "   大小: $DELETE_SIZE"
echo "   保留: 最近的 $KEEP_COUNT 个备份"
echo ""
echo "   将删除的备份:"
echo "$TO_DELETE" | sed 's/^/     - /'
echo ""

# Ask for confirmation
read -p "确认删除这些旧备份？(y/n): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ 已取消"
    exit 0
fi

echo ""
echo "🗑️  开始删除..."

# Delete old backups
DELETED=0
FAILED=0

while IFS= read -r dir; do
    if [ -d "$dir" ]; then
        echo "   删除: $(basename $dir)"
        rm -rf "$dir"
        if [ $? -eq 0 ]; then
            DELETED=$((DELETED + 1))
        else
            FAILED=$((FAILED + 1))
            echo "   ❌ 失败: $(basename $dir)"
        fi
    fi
done <<< "$TO_DELETE"

echo ""
echo "========================================="
echo "✅ 清理完成！"
echo "========================================="
echo ""
echo "📊 结果:"
echo "   成功删除: $DELETED 个备份"
if [ $FAILED -gt 0 ]; then
    echo "   失败: $FAILED 个备份"
fi
echo "   剩余备份: $(find $BACKUP_DIR -maxdepth 1 -name '$PATTERN' -type d | wc -l) 个"
echo "   剩余大小: $(du -sh $BACKUP_DIR/$PATTERN 2>/dev/null | tail -1 | awk '{print $1}')"
echo ""
echo "💡 提示: 可以定期运行此脚本来保持磁盘空间整洁"
echo "   建议: 每周运行一次，保留最近 5-10 个备份"

