import { exec } from 'child_process'
import { promisify } from 'util'
import { prisma } from '../src/lib/db'

const execAsync = promisify(exec)

async function main() {
  const date = new Date().toISOString().split('T')[0]
  const backupDir = '/var/backups'
  const backupFile = `${backupDir}/db_${date}.sql`
  
  console.log(`Creating backup: ${backupFile}`)
  
  try {
    await execAsync(`mkdir -p ${backupDir}`)
    
    const DATABASE_URL = process.env.DATABASE_URL || ''
    const match = DATABASE_URL.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
    
    if (!match) {
      console.error('Could not parse DATABASE_URL')
      process.exit(1)
    }
    
    const [, user, password, host, port, dbname] = match
    
    const command = `PGPASSWORD=${password} pg_dump -U ${user} -h ${host} -p ${port} -d ${dbname} > ${backupFile}`
    await execAsync(command)
    
    const stats = await execAsync(`ls -lh ${backupFile}`)
    console.log(`Backup created successfully: ${stats.stdout.trim()}`)
    
    await execAsync(`find ${backupDir} -name "db_*.sql" -mtime +30 -delete`)
    console.log('Cleaned up backups older than 30 days')
    
  } catch (error) {
    console.error('Backup failed:', error)
    process.exit(1)
  }
  
  await prisma.$disconnect()
}

main()
