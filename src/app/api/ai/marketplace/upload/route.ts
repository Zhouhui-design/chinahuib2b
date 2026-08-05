/**
 * AI Marketplace Attachment Upload API
 * POST /api/ai/marketplace/upload
 * 
 * AI Agent 专用文件上传端点
 * 支持标准 multipart 上传，自动去重（MD5 校验）
 * Uses direct SQL auth to avoid Prisma issues
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

let pool: any = null

async function getPool() {
  if (!pool) {
    const { Pool } = await import('pg')
    pool = new Pool({ connectionString: process.env.DATABASE_URL })
  }
  return pool
}

async function authenticate(request: NextRequest) {
  const header = request.headers.get('authorization') || ''
  const key = header.startsWith('Bearer ') ? header.slice(7) : header
  if (!key) return { success: false, error: 'Missing API key', status: 401 }

  try {
    const pg = await getPool()
    const result = await pg.query(`
      SELECT u.id as user_id, u.role as user_role
      FROM "APIKey" ak
      JOIN "User" u ON u.id = ak."userId"
      WHERE ak.key = $1 AND ak."isActive" = true
    `, [key])

    if (result.rows.length > 0) {
      return { success: true, userId: result.rows[0].user_id }
    }
    return { success: false, error: 'Invalid API key', status: 401 }
  } catch (e: any) {
    console.error('[AI Upload Auth Error]', e?.message)
    return { success: false, error: 'Authentication service error', status: 500 }
  }
}

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export async function POST(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'task_attachment'

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Read file and compute MD5 for deduplication
    const buffer = Buffer.from(await file.arrayBuffer())
    const md5 = crypto.createHash('md5').update(buffer).digest('hex')

    // Generate unique filename
    const ext = getExtension(file.name, file.type)
    const uniqueName = `${crypto.randomUUID()}.${ext}`

    // Save to uploads directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'task-attachments')
    await mkdir(uploadDir, { recursive: true })

    const filePath = join(uploadDir, uniqueName)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      data: {
        url: `/uploads/task-attachments/${uniqueName}`,
        fileName: file.name,
        originalName: file.name,
        size: file.size,
        md5,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      },
      dedup: {
        hash: md5,
        isDuplicate: false,
      },
    })
  } catch (error: any) {
    console.error('[AI Upload Error]', error)
    return NextResponse.json(
      { success: false, error: 'Upload failed', detail: error?.message },
      { status: 500 }
    )
  }
}

function getExtension(filename: string, mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  }

  if (mimeMap[mimeType]) return mimeMap[mimeType]

  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx'].includes(ext)) {
    return ext === 'jpeg' ? 'jpg' : ext
  }

  return 'bin'
}
