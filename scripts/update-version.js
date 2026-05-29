#!/usr/bin/env node

/**
 * 版本更新脚本
 * 用法: node scripts/update-version.js [patch|minor|major]
 * 默认: patch
 */

const fs = require('fs')
const path = require('path')

const versionType = process.argv[2] || 'patch'

// 读取 package.json
const packagePath = path.join(process.cwd(), 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

// 解析当前版本
const currentVersion = packageJson.version
const versionParts = currentVersion.split('.').map(Number)

// 更新版本号
switch (versionType) {
  case 'major':
    versionParts[0]++
    versionParts[1] = 0
    versionParts[2] = 0
    break
  case 'minor':
    versionParts[1]++
    versionParts[2] = 0
    break
  case 'patch':
  default:
    versionParts[2]++
    break
}

const newVersion = versionParts.join('.')
const buildTimestamp = Date.now().toString()

// 更新 package.json
packageJson.version = newVersion
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n')

// 创建 .env.local 文件（如果不存在）
const envPath = path.join(process.cwd(), '.env.local')
let envContent = ''

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8')
  
  // 更新或添加版本相关环境变量
  const lines = envContent.split('\n')
  const newLines = []
  let hasVersion = false
  let hasTimestamp = false
  
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_APP_VERSION=')) {
      newLines.push(`NEXT_PUBLIC_APP_VERSION=${newVersion}`)
      hasVersion = true
    } else if (line.startsWith('NEXT_PUBLIC_BUILD_TIMESTAMP=')) {
      newLines.push(`NEXT_PUBLIC_BUILD_TIMESTAMP=${buildTimestamp}`)
      hasTimestamp = true
    } else {
      newLines.push(line)
    }
  }
  
  if (!hasVersion) {
    newLines.push(`NEXT_PUBLIC_APP_VERSION=${newVersion}`)
  }
  if (!hasTimestamp) {
    newLines.push(`NEXT_PUBLIC_BUILD_TIMESTAMP=${buildTimestamp}`)
  }
  
  envContent = newLines.join('\n')
} else {
  envContent = `# 自动生成的版本信息
NEXT_PUBLIC_APP_VERSION=${newVersion}
NEXT_PUBLIC_BUILD_TIMESTAMP=${buildTimestamp}
`
}

fs.writeFileSync(envPath, envContent)

console.log(`✅ 版本已更新: ${currentVersion} → ${newVersion}`)
console.log(`📦 构建时间戳: ${buildTimestamp}`)
console.log(`📝 更新类型: ${versionType}`)
console.log('')
console.log('💡 提示:')
console.log('  - 运行 npm run build 构建新版本')
console.log('  - 部署后用户将收到更新通知')
console.log('')
