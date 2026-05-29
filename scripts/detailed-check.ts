/**
 * Detailed Security Check Script
 * Show all users and their details
 */

import { prisma } from "../src/lib/db"

async function detailedCheck() {
  console.log("🔍 详细安全检查...\n")
  console.log("=".repeat(80))

  // Get all users with full details
  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
  })

  console.log(`\n📊 所有用户列表 (${allUsers.length} 位):`)
  console.log("-" .repeat(80))

  allUsers.forEach((user, index) => {
    console.log(`\n${index + 1}. ${user.email}`)
    console.log(`   用户名: ${user.username}`)
    console.log(`   角色: ${user.role}`)
    console.log(`   状态: ${user.isActive ? '✅ 活跃' : '❌ 禁用'}`)
    console.log(`   创建时间: ${user.createdAt.toLocaleString()}`)
    console.log(`   最后登录: ${user.lastLoginAt ? user.lastLoginAt.toLocaleString() : '从未登录'}`)
  })

  // Check if there are any suspicious roles
  const validRoles = ['BUYER', 'SELLER', 'OWNER', 'ADMIN', 'AI_ASSISTANT', 'AI_BUYER', 'AI_SELLER']
  const invalidRoleUsers = allUsers.filter(u => !validRoles.includes(u.role))

  if (invalidRoleUsers.length > 0) {
    console.log("\n⚠️ 警告: 发现未知角色的用户!")
    invalidRoleUsers.forEach(u => {
      console.log(`   - ${u.email}: ${u.role}`)
    })
  }

  console.log("\n" + "=".repeat(80))
  console.log("\n✅ 详细检查完成!")
  console.log("\n📋 提示: 如果您担心账户被入侵，建议:")
  console.log("   1. 检查所有管理员账户的数量")
  console.log("   2. 查看最后登录时间是否可疑")
  console.log("   3. 检查是否有未授权的管理员账户")
}

detailedCheck()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
