#!/bin/bash

# 修复 Next.js 15 params 类型问题
# Next.js 15 中 params 现在是 Promise，需要更新类型定义

echo "🔧 开始修复 Next.js 15 params 类型问题..."
echo ""

# 查找所有需要修复的文件
FILES=$(grep -r "{ params }: { params: { " src/app/api --include="*.ts" -l | grep -v node_modules)

if [ -z "$FILES" ]; then
    echo "✅ 没有发现需要修复的文件"
    exit 0
fi

echo "📝 发现 $(echo "$FILES" | wc -l) 个文件需要修复"
echo ""

# 备份并修复每个文件
for file in $FILES; do
    echo "处理: $file"
    
    # 创建备份
    cp "$file" "$file.bak"
    
    # 修复类型定义
    # 将 { params: { id: string } } 替换为 { params: Promise<{ id: string }> }
    sed -i 's/{ params }: { params: { \([^}]*\) } }/{ params }: { params: Promise<{ \1 }> }/g' "$file"
    
    # 同时需要在使用 params 的地方添加 await
    # 查找 const { id } = params 并替换为 const { id } = await params
    sed -i 's/const { \([^}]*\) } = params$/const { \1 } = await params/g' "$file"
    
    echo "  ✅ 修复完成"
done

echo ""
echo "✨ 所有文件修复完成！"
echo ""
echo "⚠️  请检查以下文件确保修复正确："
echo "$FILES"
echo ""
echo "💡 提示：如果有问题，可以使用 .bak 文件恢复"
