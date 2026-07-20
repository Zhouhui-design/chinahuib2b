const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function resetAdminPassword() {
  console.log('🔑 Resetting admin password...')

  const prisma = new PrismaClient()
  
  const adminEmail = 'admin@chinahuib2b.top'
  const newPassword = 'Admin@2024Secure!'

  try {
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!admin) {
      console.error('❌ Admin user not found!')
      process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
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
    console.log('⚠️  IMPORTANT: Please change the password after first login!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()