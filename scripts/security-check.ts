/**
 * Security Check Script
 * Quick check for compromised accounts and suspicious activity
 */

import { prisma } from "../src/lib/db"

async function securityCheck() {
  console.log("🔍 开始安全检查...\n")
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Get all users
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
    },
    orderBy: { lastLoginAt: 'desc' },
  })

  console.log(`📊 总用户数: ${allUsers.length}\n`)

  // Check recent logins
  const recentLogins = allUsers.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > twentyFourHoursAgo)
  console.log(`⏰ 过去24小时登录用户: ${recentLogins.length}`)

  if (recentLogins.length > 0) {
    console.log("\n📝 最近登录的用户:")
    recentLogins.forEach(u => {
      console.log(`  - ${u.email} (${u.role}) - ${u.lastLoginAt?.toLocaleString()}`)
    })
  }

  // Check admin/owner users
  const adminUsers = allUsers.filter(u => u.role === 'OWNER' || u.role === 'ADMIN')
  console.log(`\n👑 管理员用户: ${adminUsers.length}`)

  if (adminUsers.length > 0) {
    console.log("\n📋 管理员列表:")
    adminUsers.forEach(u => {
      const isActive = u.isActive ? '✅' : '❌'
      const lastLogin = u.lastLoginAt ? u.lastLoginAt.toLocaleString() : '从未登录'
      console.log(`  ${isActive} ${u.email} (${u.role}) - 最后登录: ${lastLogin}`)
    })
  }

  // Check newly created accounts (in last 7 days)
  const newAccounts = allUsers.filter(u => new Date(u.createdAt) > sevenDaysAgo)
  console.log(`\n🆕 过去7天新注册用户: ${newAccounts.length}`)

  if (newAccounts.length > 0) {
    console.log("\n📋 新用户列表:")
    newAccounts.forEach(u => {
      console.log(`  - ${u.email} (${u.role}) - 创建于: ${u.createdAt.toLocaleString()}`)
    })
  }

  // Check for inactive admin accounts
  const inactiveAdmins = adminUsers.filter(u => !u.isActive)
  if (inactiveAdmins.length > 0) {
    console.log("\n⚠️ 警告: 发现禁用的管理员账户!")
    inactiveAdmins.forEach(u => {
      console.log(`  - ${u.email}`)
    })
  }

  // Summary
  console.log("\n" + "=".repeat(60))
  console.log("📊 安全检查摘要")
  console.log("=".repeat(60))
  console.log(`总用户数: ${allUsers.length}`)
  console.log(`管理员数: ${adminUsers.length}`)
  console.log(`最近登录: ${recentLogins.length}`)
  console.log(`新注册用户: ${newAccounts.length}`)
  console.log("\n✅ 检查完成!")

  if (newAccounts.length > 5) {
    console.log("\n⚠️  建议: 新注册用户较多，请检查是否有可疑账户")
  }
  if (adminUsers.length > 3) {
    console.log("\n⚠️  建议: 管理员账户较多，请确认是否都需要")
  }
}

securityCheck()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
