import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://expo_dev:dev123@localhost:5432/global_expo_dev'

const pool = new Pool({
  connectionString: DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

async function normalizeEmailCase() {
  console.log('🔧 Starting email case normalization...\n')

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      }
    })

    console.log(`Found ${users.length} total users in database`)

    let fixed = 0
    let errors = 0
    let alreadyCorrect = 0

    for (const user of users) {
      try {
        const currentEmail = user.email
        const normalizedEmail = currentEmail.toLowerCase().trim()

        if (currentEmail !== normalizedEmail) {
          const existingUser = await prisma.user.findFirst({
            where: {
              email: normalizedEmail,
              id: { not: user.id }
            }
          })

          if (existingUser) {
            console.log(`⚠️ Cannot normalize ${currentEmail}: ${normalizedEmail} already exists as ${existingUser.email}`)
            errors++
            continue
          }

          await prisma.user.update({
            where: { id: user.id },
            data: { email: normalizedEmail }
          })

          console.log(`✅ Fixed: ${currentEmail} -> ${normalizedEmail}`)
          fixed++
        } else {
          alreadyCorrect++
        }
      } catch (error) {
        console.error(`❌ Error fixing ${user.email}:`, error)
        errors++
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`  Already correct: ${alreadyCorrect}`)
    console.log(`  Fixed: ${fixed}`)
    console.log(`  Errors: ${errors}`)
    console.log(`  Total: ${users.length}`)

  } catch (error) {
    console.error('Normalization error:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

normalizeEmailCase()
