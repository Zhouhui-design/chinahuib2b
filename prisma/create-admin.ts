import { prisma } from '../src/lib/db'
import bcrypt from 'bcryptjs'
import { generateSecurePassword, sendPasswordEmail } from '../src/lib/email-service'

async function createAdmin() {
  console.log('🔑 Creating admin account...')

  const adminEmail = '1994169577@qq.com'
  const newPassword = generateSecurePassword(16)

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists, updating password...')
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { password: hashedPassword, role: 'ADMIN' }
      })
    } else {
      console.log('✅ Creating new admin user...')
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await prisma.user.create({
        data: {
          email: adminEmail,
          username: 'admin',
          password: hashedPassword,
          role: 'ADMIN',
          displayName: '系统管理员',
        }
      })
    }

    console.log('📧 Sending password email...')
    const emailResult = await sendPasswordEmail(adminEmail, newPassword, 'admin')

    if (emailResult.success) {
      console.log('✅ Email sent successfully!')
    } else {
      console.error('❌ Email sending failed:', emailResult.message)
    }

    console.log('')
    console.log('=============================')
    console.log('✅ Admin account ready!')
    console.log('=============================')
    console.log('')
    console.log('📧 Login Credentials:')
    console.log('   Email:', adminEmail)
    console.log('   Password: [SENT VIA EMAIL - NOT DISPLAYED]')
    console.log('')
    console.log('🌐 Login URL: https://x2xhub.com/auth/login')
    console.log('')
    console.log('⚠️  IMPORTANT: Please check your email for the password!')
    console.log('⚠️  IMPORTANT: Please change the password after first login!')

  } catch (error: any) {
    console.error('❌ Error:', error)
    console.log('')
    console.log('📧 Login Credentials (in case email fails):')
    console.log('   Email:', adminEmail)
    console.log('   Password: [NOT DISPLAYED - CHECK LOG FILE]')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
