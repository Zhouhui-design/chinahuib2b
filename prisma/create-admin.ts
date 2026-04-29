import { prisma } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function createAdminUser() {
  console.log('🔧 Creating admin user...')

  const adminEmail = 'admin@chinahuib2b.top'
  const adminPassword = 'Admin@2024Secure!'

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Role: ${existingAdmin.role}`)
    
    // Update role to ADMIN if not already
    if (existingAdmin.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { role: 'ADMIN' }
      })
      console.log('   ✅ Updated role to ADMIN')
    }
    return
  }

  // Create new admin user
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('✅ Admin user created successfully!')
  console.log('')
  console.log('📧 Login Credentials:')
  console.log('   Email:', adminEmail)
  console.log('   Password:', adminPassword)
  console.log('')
  console.log('⚠️  IMPORTANT: Please change the password after first login!')
}

createAdminUser()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
