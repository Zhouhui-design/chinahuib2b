import { prisma } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function resetAdminPassword() {
  console.log('🔑 Resetting admin password...')

  const adminEmail = 'admin@chinahuib2b.top'
  const newPassword = 'Admin@2024Secure!'

  // Find admin user
  const admin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!admin) {
    console.error('❌ Admin user not found!')
    process.exit(1)
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  
  // Update password
  await prisma.user.update({
    where: { id: admin.id },
    data: { password: hashedPassword }
  })

  console.log('✅ Admin password reset successfully!')
  console.log('')
  console.log('📧 Login Credentials:')
  console.log('   Email:', adminEmail)
  console.log('   Password:', newPassword)
  console.log('')
  console.log('🌐 Login URL: https://chinahuib2b.top/login')
  console.log('🎯 TDK Admin Panel: https://chinahuib2b.top/admin/seo')
  console.log('')
  console.log('⚠️  IMPORTANT: Please change the password after first login!')
}

resetAdminPassword()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
