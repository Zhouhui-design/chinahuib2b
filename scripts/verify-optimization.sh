#!/bin/bash

# ChinaHuiB2B 项目优化验证脚本
# 用于验证优化是否成功执行

echo "🔍 ChinaHuiB2B 项目优化验证"
echo "================================"
echo ""

# 1. 检查根目录 Markdown 文件数量
echo "1️⃣  检查根目录文档..."
MD_COUNT=$(find . -maxdepth 1 -name "*.md" -type f | wc -l)
if [ "$MD_COUNT" -le 5 ]; then
    echo "   ✅ 根目录 Markdown 文件: $MD_COUNT 个（优秀）"
else
    echo "   ⚠️  根目录 Markdown 文件: $MD_COUNT 个（建议整理）"
fi
echo ""

# 2. 检查文档目录结构
echo "2️⃣  检查文档目录结构..."
REQUIRED_DIRS=("docs/guides" "docs/reports" "docs/specs" "docs/features" "docs/deployment" "docs/archive/2026-Q2")
ALL_EXIST=true

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        COUNT=$(ls -1 "$dir" 2>/dev/null | wc -l)
        echo "   ✅ $dir: $COUNT 个文件"
    else
        echo "   ❌ $dir: 不存在"
        ALL_EXIST=false
    fi
done
echo ""

# 3. 检查备份文件
echo "3️⃣  检查备份文件..."
BAK_COUNT=$(find . -name "*.bak" -type f 2>/dev/null | wc -l)
if [ "$BAK_COUNT" -eq 0 ]; then
    echo "   ✅ 无备份文件残留"
else
    echo "   ⚠️  发现 $BAK_COUNT 个备份文件"
    find . -name "*.bak" -type f 2>/dev/null | head -5
fi
echo ""

# 4. 检查 ESLint 配置
echo "4️⃣  检查 ESLint 配置..."
if [ -f ".eslintignore" ]; then
    echo "   ✅ .eslintignore 文件存在"
else
    echo "   ❌ .eslintignore 文件缺失"
fi
echo ""

# 5. 检查关键配置文件
echo "5️⃣  检查关键配置文件..."
CONFIG_FILES=("next.config.ts" "package.json" "prisma/schema.prisma" ".env.local")
for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file 缺失"
    fi
done
echo ""

# 6. 运行 ESLint 快速检查
echo "6️⃣  运行 ESLint 快速检查..."
LINT_OUTPUT=$(npm run lint 2>&1)
WARNING_COUNT=$(echo "$LINT_OUTPUT" | grep -c "warning" || true)
ERROR_COUNT=$(echo "$LINT_OUTPUT" | grep -c "error" || true)

if [ "$ERROR_COUNT" -eq 0 ]; then
    echo "   ✅ 无错误"
else
    echo "   ⚠️  发现 $ERROR_COUNT 个错误"
fi

if [ "$WARNING_COUNT" -lt 20 ]; then
    echo "   ✅ 警告数: $WARNING_COUNT（可接受）"
else
    echo "   ⚠️  警告数: $WARNING_COUNT（建议修复）"
fi
echo ""

# 7. 检查构建状态
echo "7️⃣  检查构建状态..."
if [ -d ".next" ]; then
    echo "   ✅ .next 目录存在（已构建）"
else
    echo "   ℹ️  .next 目录不存在（未构建）"
fi
echo ""

# 8. 总结
echo "================================"
echo "📊 验证总结"
echo "================================"
echo ""

SCORE=0
TOTAL=7

# 评分逻辑
[ "$MD_COUNT" -le 5 ] && ((SCORE++))
[ "$ALL_EXIST" = true ] && ((SCORE++))
[ "$BAK_COUNT" -eq 0 ] && ((SCORE++))
[ -f ".eslintignore" ] && ((SCORE++))
[ -f "next.config.ts" ] && ((SCORE++))
[ "$ERROR_COUNT" -eq 0 ] && ((SCORE++))
[ -d ".next" ] && ((SCORE++))

PERCENTAGE=$((SCORE * 100 / TOTAL))

echo "得分: $SCORE/$TOTAL ($PERCENTAGE%)"
echo ""

if [ "$PERCENTAGE" -ge 90 ]; then
    echo "🎉 优秀！项目优化非常成功"
elif [ "$PERCENTAGE" -ge 70 ]; then
    echo "✅ 良好！项目优化基本完成"
elif [ "$PERCENTAGE" -ge 50 ]; then
    echo "⚠️  一般！还有改进空间"
else
    echo "❌ 需要更多优化工作"
fi

echo ""
echo "💡 建议："
if [ "$MD_COUNT" -gt 5 ]; then
    echo "   - 运行 scripts/organize-docs.sh 整理文档"
fi
if [ "$BAK_COUNT" -gt 0 ]; then
    echo "   - 删除备份文件: find . -name '*.bak' -delete"
fi
if [ "$WARNING_COUNT" -gt 20 ]; then
    echo "   - 修复 ESLint 警告: npm run lint"
fi
if [ ! -f ".eslintignore" ]; then
    echo "   - 创建 .eslintignore 文件"
fi

echo ""
echo "验证完成！"
