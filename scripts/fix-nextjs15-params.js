#!/usr/bin/env node

/**
 * 批量修复 Next.js 15 params 类型问题
 * 
 * Next.js 15 Breaking Change:
 * - params 现在是 Promise，需要 await
 * - 类型定义需要从 { params: { id: string } } 改为 { params: Promise<{ id: string }> }
 */

const fs = require('fs');
const path = require('path');

// 查找所有 API route 文件
function findRouteFiles(dir) {
  const files = [];
  
  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walk(fullPath);
      } else if (item === 'route.ts' || item === 'route.js') {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

// 修复单个文件
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // 修复类型定义：{ params: { xxx } } -> { params: Promise<{ xxx }> }
  const typePattern = /\{\s*params\s*\}:\s*\{\s*params:\s*\{\s*([^}]+)\}\s*\}/g;
  
  if (typePattern.test(content)) {
    content = content.replace(typePattern, (match, paramsContent) => {
      modified = true;
      return `{ params }: { params: Promise<{ ${paramsContent.trim()} }> }`;
    });
  }
  
  // 修复解构赋值：const { xxx } = params -> const { xxx } = await params
  // 注意：只修复函数内部的，不修复已经修复过的
  const destructurePattern = /const\s+\{\s*([^}]+)\s*\}\s*=\s*params(?!\s*\.)/g;
  
  if (destructurePattern.test(content)) {
    content = content.replace(destructurePattern, (match, vars) => {
      // 检查前面是否已经有 await
      const beforeMatch = content.substring(0, content.indexOf(match));
      if (!beforeMatch.trim().endsWith('await')) {
        modified = true;
        return `const { ${vars.trim()} } = await params`;
      }
      return match;
    });
  }
  
  if (modified) {
    // 创建备份
    const backupPath = filePath + '.bak';
    fs.writeFileSync(backupPath, fs.readFileSync(filePath, 'utf-8'));
    
    // 写入修复后的内容
    fs.writeFileSync(filePath, content, 'utf-8');
    
    console.log(`✅ 修复: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  跳过: ${filePath} (无需修复)`);
    return false;
  }
}

// 主函数
function main() {
  const apiDir = path.join(__dirname, '../src/app/api');
  
  console.log('🔧 开始修复 Next.js 15 params 类型问题...\n');
  
  if (!fs.existsSync(apiDir)) {
    console.error(`❌ 目录不存在: ${apiDir}`);
    process.exit(1);
  }
  
  const routeFiles = findRouteFiles(apiDir);
  console.log(`📝 找到 ${routeFiles.length} 个 route 文件\n`);
  
  let fixedCount = 0;
  
  for (const file of routeFiles) {
    if (fixFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✨ 修复完成！共修复 ${fixedCount} 个文件`);
  console.log('\n💡 提示:');
  console.log('   - 备份文件已保存为 .bak');
  console.log('   - 请运行 TypeScript 检查确认修复正确');
  console.log('   - 如有问题，可使用 .bak 文件恢复');
}

main();
