import { execSync } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { fromEnv } from '@aws-sdk/credential-provider-env'

const BACKUP_DIR = '/var/backups'
const RETENTION_DAYS = 7
const SPACES_BUCKET = process.env.DO_SPACES_BUCKET || 'global-expo-storage'
const SPACES_ENDPOINT = process.env.DO_SPACES_ENDPOINT || 'https://sgp1.digitaloceanspaces.com'

function loadEnv(): void {
  const envPath = path.join(__dirname, '../.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.+)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    })
  }
}

function getDatabaseCredentials(): { user: string; password: string; host: string; port: string; dbname: string } {
  loadEnv()
  const databaseUrl = process.env.DATABASE_URL || ''
  const match = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):([^/]+)\/(.+)/)
  
  if (!match) {
    throw new Error('无法解析DATABASE_URL')
  }
  
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    dbname: match[5],
  }
}

function createLocalBackup(): string {
  const { user, password, host, port, dbname } = getDatabaseCredentials()
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = path.join(BACKUP_DIR, `db_${timestamp}.sql`)
  
  console.log(`📦 创建本地备份: ${backupFile}`)
  
  execSync(`mkdir -p ${BACKUP_DIR}`, { stdio: 'inherit' })
  
  const env = { ...process.env, PGPASSWORD: password }
  execSync(
    `pg_dump -U ${user} -h ${host} -p ${port} -d ${dbname} > ${backupFile}`,
    { stdio: 'inherit', env }
  )
  
  const size = execSync(`du -h ${backupFile} | cut -f1`).toString().trim()
  console.log(`✅ 备份完成，大小: ${size}`)
  
  return backupFile
}

function cleanupOldBackups() {
  console.log(`🧹 清理 ${RETENTION_DAYS} 天前的旧备份...`)
  
  try {
    const files = fs.readdirSync(BACKUP_DIR)
    
    files.forEach(file => {
      if (file.startsWith('db_') && file.endsWith('.sql')) {
        const filePath = path.join(BACKUP_DIR, file)
        const stat = fs.statSync(filePath)
        const ageDays = (Date.now() - stat.mtime.getTime()) / (1000 * 60 * 60 * 24)
        
        if (ageDays > RETENTION_DAYS) {
          fs.unlinkSync(filePath)
          console.log(`🗑️ 删除旧备份: ${file}`)
        }
      }
    })
    
    console.log('✅ 清理完成')
  } catch (error) {
    console.error('❌ 清理旧备份失败:', error)
  }
}

async function uploadToSpaces(localFile: string): Promise<void> {
  if (!SPACES_BUCKET || !process.env.DO_SPACES_ACCESS_KEY || !process.env.DO_SPACES_SECRET_KEY) {
    console.warn('⚠️ DigitalOcean Spaces 配置不完整，跳过异地备份')
    return
  }
  
  console.log(`☁️ 上传备份到 Spaces: ${SPACES_BUCKET}`)
  
  const s3Client = new S3Client({
    endpoint: SPACES_ENDPOINT,
    region: 'sgp1',
    credentials: fromEnv(),
  })
  
  const fileName = path.basename(localFile)
  const fileContent = fs.readFileSync(localFile)
  
  const uploadCommand = new PutObjectCommand({
    Bucket: SPACES_BUCKET,
    Key: `backups/${fileName}`,
    Body: fileContent,
    ContentType: 'application/sql',
    ACL: 'private',
  })
  
  try {
    await s3Client.send(uploadCommand)
    console.log(`✅ 上传成功: backups/${fileName}`)
  } catch (error) {
    console.error('❌ 上传失败:', error)
  }
}

async function cleanupSpacesBackups(): Promise<void> {
  if (!SPACES_BUCKET || !process.env.DO_SPACES_ACCESS_KEY || !process.env.DO_SPACES_SECRET_KEY) {
    return
  }
  
  console.log(`☁️ 清理 Spaces 中 ${RETENTION_DAYS} 天前的旧备份...`)
  
  const s3Client = new S3Client({
    endpoint: SPACES_ENDPOINT,
    region: 'sgp1',
    credentials: fromEnv(),
  })
  
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: SPACES_BUCKET,
      Prefix: 'backups/',
    })
    
    const response = await s3Client.send(listCommand)
    
    if (!response.Contents) return
    
    for (const item of response.Contents) {
      const key = item.Key || ''
      if (key.startsWith('backups/db_') && key.endsWith('.sql')) {
        const lastModified = item.LastModified
        if (lastModified) {
          const ageDays = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24)
          
          if (ageDays > RETENTION_DAYS) {
            const deleteCommand = new DeleteObjectCommand({
              Bucket: SPACES_BUCKET,
              Key: key,
            })
            
            await s3Client.send(deleteCommand)
            console.log(`🗑️ 删除 Spaces 旧备份: ${key}`)
          }
        }
      }
    }
    
    console.log('✅ Spaces 清理完成')
  } catch (error) {
    console.error('❌ Spaces 清理失败:', error)
  }
}

async function main() {
  console.log('==========================================')
  console.log('    DATABASE BACKUP PROCESS STARTED')
  console.log('==========================================')
  console.log('')
  
  try {
    const backupFile = createLocalBackup()
    await uploadToSpaces(backupFile)
    cleanupOldBackups()
    await cleanupSpacesBackups()
    
    console.log('')
    console.log('==========================================')
    console.log('    BACKUP PROCESS COMPLETED SUCCESSFULLY')
    console.log('==========================================')
  } catch (error) {
    console.error('')
    console.error('==========================================')
    console.error('    BACKUP PROCESS FAILED')
    console.error('==========================================')
    console.error(error)
    process.exit(1)
  }
}

main()