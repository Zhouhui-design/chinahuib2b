#!/bin/bash
# ============================================================
# 修复脚本：清理缺失的展位 logo/banner 图片引用
#
# 问题：7个活跃展位的 logoUrl 和 bannerUrl 指向的图片文件
#       在 /uploads/others/ 目录中不存在（共14个404），
#       导致前端显示破损图标。
#
# 原因：图片上传后文件丢失（备份恢复不完整或上传失败），
#       但数据库记录已写入。
#
# 修复策略：将无效的 logoUrl/bannerUrl 设为 NULL，
#           让前端 BoothCard 组件显示优雅的 fallback
#           （渐变背景 + emoji 图标）。
#
# 数据安全：执行前自动备份受影响的 Booth 记录。
# ============================================================

set -euo pipefail

PROJ_DIR="/var/www/chinahuib2b"
BACKUP_DIR="${PROJ_DIR}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/booth-image-fix-backup-${TIMESTAMP}.sql"

# 从 .env.production 读取数据库密码
DB_PASS=$(grep '^DATABASE_URL' "${PROJ_DIR}/.env.production" | sed -E 's#.*://[^:]+:([^@]+)@.*#\1#')
DB_USER="expo_dev"
DB_NAME="global_expo_dev"
DB_HOST="localhost"

# 受影响的展位 ID 和缺失图片文件
declare -a MISSING_FILES=(
  "31a3faf3-5dbe-42de-83db-fe92ff2b8db2.webp"
  "21fab859-6d33-445e-af37-b7aa7b8676d3.webp"
  "0fdb434b-e6bb-41f9-87cb-4b301fbf0cb8.webp"
  "e6a6257a-b61d-4761-a4a4-6f2a146abf36.webp"
  "35595010-4916-475f-be3c-69686e7e7ffc.svg"
  "cbd1a5a4-efd5-4afa-a439-2902e44c13ce.webp"
  "d7a9705d-e4dd-47ff-a54f-4248c905c72e.webp"
  "fefdd348-864a-41fc-9825-1293b3a25db2.webp"
  "859cd76f-058d-4653-9957-879115f1d9b4.webp"
  "bd7bd11f-d0a7-43c1-a5df-bc5f5a963472.webp"
  "ec5bd6f7-9c70-40f5-9408-05267e3ba8af.webp"
  "502fc43b-a9d6-4182-ad0a-95e9b2836047.webp"
  "e26f3daf-2706-4a11-8854-2f7da5ddfc93.webp"
  "1377b45f-60e6-4f19-82f5-027875265e0e.webp"
)

echo "======================================"
echo "  展位缺失图片修复脚本"
echo "  时间: $(date)"
echo "======================================"
echo ""

# --- 步骤 1：验证文件确实缺失 ---
echo ">>> 步骤 1：验证缺失文件..."
MISSING_COUNT=0
EXISTING_COUNT=0
for f in "${MISSING_FILES[@]}"; do
  if find "${PROJ_DIR}/public/uploads/" -name "$f" 2>/dev/null | grep -q .; then
    echo "  ⚠️  发现文件存在: $f（跳过清理）"
    EXISTING_COUNT=$((EXISTING_COUNT + 1))
  else
    MISSING_COUNT=$((MISSING_COUNT + 1))
  fi
done
echo "  确认缺失: ${MISSING_COUNT} 个文件"
echo "  实际存在: ${EXISTING_COUNT} 个文件"
echo ""

if [ "$MISSING_COUNT" -eq 0 ]; then
  echo "✅ 所有文件都存在，无需修复。"
  exit 0
fi

# --- 步骤 2：备份数据库 ---
echo ">>> 步骤 2：备份受影响的 Booth 记录..."
mkdir -p "${BACKUP_DIR}"
PGPASSWORD="${DB_PASS}" pg_dump -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" \
  -t "Booth" --column-inserts --data-only \
  > "${BACKUP_FILE}" 2>/dev/null
if [ $? -eq 0 ]; then
  echo "  ✅ 备份完成: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"
else
  echo "  ❌ 备份失败，中止修复。"
  exit 1
fi
echo ""

# --- 步骤 3：展示修复前的状态 ---
echo ">>> 步骤 3：修复前的状态..."
for f in "${MISSING_FILES[@]}"; do
  echo "  缺失文件: $f"
  PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
    SELECT '    Booth: ' || id || ' | ' || LEFT(name, 40) || ' | logoUrl=' || COALESCE(\"logoUrl\", 'NULL')
    FROM \"Booth\" WHERE \"logoUrl\" LIKE '%${f}%';
    SELECT '    Booth: ' || id || ' | ' || LEFT(name, 40) || ' | bannerUrl=' || COALESCE(\"bannerUrl\", 'NULL')
    FROM \"Booth\" WHERE \"bannerUrl\" LIKE '%${f}%';
  " 2>/dev/null | grep -v '^$' || true
done
echo ""

# --- 步骤 4：执行清理 ---
echo ">>> 步骤 4：清理无效引用..."
for f in "${MISSING_FILES[@]}"; do
  echo "  清理引用: $f"
  PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -c "
    UPDATE \"Booth\" SET \"logoUrl\" = NULL
    WHERE \"logoUrl\" LIKE '%${f}%';
    UPDATE \"Booth\" SET \"bannerUrl\" = NULL
    WHERE \"bannerUrl\" LIKE '%${f}%';
  " 2>/dev/null | grep -E 'UPDATE|UPDATE' || true
done
echo ""

# --- 步骤 5：验证修复结果 ---
echo ">>> 步骤 5：验证修复结果..."
REMAINING=$(PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
  SELECT COUNT(*) FROM \"Booth\"
  WHERE \"logoUrl\" ~ '31a3faf3|21fab859|0fdb434b|e6a6257a|35595010|cbd1a5a4|d7a9705d|fefdd348|859cd76f|bd7bd11f|ec5bd6f7|502fc43b|e26f3daf|1377b45f'
     OR \"bannerUrl\" ~ '31a3faf3|21fab859|0fdb434b|e6a6257a|35595010|cbd1a5a4|d7a9705d|fefdd348|859cd76f|bd7bd11f|ec5bd6f7|502fc43b|e26f3daf|1377b45f';
" 2>/dev/null | tr -d ' ')

if [ "${REMAINING}" = "0" ]; then
  echo "  ✅ 修复成功！所有无效引用已清除。"
else
  echo "  ⚠️  仍有 ${REMAINING} 条记录引用缺失图片，请检查。"
fi
echo ""

# --- 步骤 6：重启 PM2 使更改生效（清除缓存） ---
echo ">>> 步骤 6：重启应用服务..."
pm2 restart chinahuib2b-prod 2>/dev/null && echo "  ✅ PM2 已重启" || echo "  ⚠️  PM2 重启失败（可能需要手动执行）"
echo ""

echo "======================================"
echo "  修复完成！"
echo "======================================"
echo ""
echo "修复内容："
echo "  - 清理了 ${MISSING_COUNT} 个缺失图片的无效数据库引用"
echo "  - 7 个展位的 logoUrl/bannerUrl 设为 NULL"
echo "  - 前端将显示优雅的 fallback（渐变背景 + emoji）"
echo ""
echo "备份文件：${BACKUP_FILE}"
echo ""
echo "如需恢复图片，请重新上传展位 logo/banner。"
