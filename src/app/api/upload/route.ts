import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { writeFile, mkdir, copyFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import { uploadToSpaces, isSpacesConfigured } from '@/lib/spaces'
import {
  ATTACHMENT_LIMITS,
  UPLOAD_RATE_LIMIT,
  GLOBAL_MAX_FILE_SIZE,
  getExtension,
  type AttachmentTypeLimit,
} from '@/lib/upload-limits'

// Upload directory configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public/uploads')
const PUBLIC_URL_PREFIX = '/uploads'
// Secondary local backup directory — independent from public/uploads,
// to recover files even if public/uploads is accidentally wiped.
const BACKUP_DIR = process.env.UPLOAD_BACKUP_DIR || path.join(process.cwd(), 'storage', 'uploads-backup')

// ===== 内存频率限制（单实例有效，防止恶意刷量）=====
// 结构: { [userId]: { count: number, resetAt: timestamp } }
interface RateLimitEntry {
  count: number
  resetAt: number
}
const uploadRateLimitMap = new Map<string, RateLimitEntry>()

/**
 * 检查用户上传频率是否超限
 * @returns 未超限返回 null，超限返回错误消息
 */
function checkUploadRateLimit(userId: string): string | null {
  const now = Date.now()
  const entry = uploadRateLimitMap.get(userId)

  if (!entry || now > entry.resetAt) {
    // 新窗口
    uploadRateLimitMap.set(userId, {
      count: 1,
      resetAt: now + UPLOAD_RATE_LIMIT.windowMs,
    })
    return null
  }

  entry.count++
  if (entry.count > UPLOAD_RATE_LIMIT.maxUploads) {
    const remainingMs = entry.resetAt - now
    const remainingMin = Math.ceil(remainingMs / (60 * 1000))
    return `Upload rate limit exceeded. Please try again in ${remainingMin} minute(s). Limit: ${UPLOAD_RATE_LIMIT.maxUploads} uploads per hour.`
  }

  return null
}

/**
 * 根据文件名和 MIME 类型推断附件分类
 * 用于 task_attachment 类型应用更严格的验证
 */
function inferAttachmentCategory(
  filename: string,
  mimeType: string
): keyof typeof ATTACHMENT_LIMITS | null {
  const ext = getExtension(filename)

  // 图片
  if (ATTACHMENT_LIMITS.image.allowedExtensions.includes(ext) ||
      ATTACHMENT_LIMITS.image.allowedMimeTypes.includes(mimeType)) {
    return 'image'
  }

  // 视频
  if (ATTACHMENT_LIMITS.video.allowedExtensions.includes(ext) ||
      ATTACHMENT_LIMITS.video.allowedMimeTypes.includes(mimeType)) {
    return 'video'
  }

  // 压缩包
  if (ATTACHMENT_LIMITS.compressed.allowedExtensions.includes(ext) ||
      ATTACHMENT_LIMITS.compressed.allowedMimeTypes.includes(mimeType)) {
    return 'compressed'
  }

  // 图纸
  if (ATTACHMENT_LIMITS.drawing.allowedExtensions.includes(ext)) {
    return 'drawing'
  }

  // 文档
  if (ATTACHMENT_LIMITS.file.allowedExtensions.includes(ext) ||
      ATTACHMENT_LIMITS.file.allowedMimeTypes.includes(mimeType)) {
    return 'file'
  }

  return null
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    // Verify user is logged in and is a seller
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { sellerProfile: true }
    })

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'product_image'
    const productId = formData.get('productId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Allow all logged-in users to upload chat files and task attachments
    const isChatUpload = type === 'chat_image' || type === 'chat_file';
    const isTaskUpload = type === 'task_attachment';

    if (!user || (!isChatUpload && !isTaskUpload && user.role !== 'SELLER' && user.role !== 'ADMIN')) {
      console.log('Upload rejected - user:', user?.id, 'role:', user?.role, 'type:', type)
      return NextResponse.json({ error: 'Only sellers or admins can upload files' }, { status: 403 })
    }

    // ===== 频率限制：防止恶意刷量上传 =====
    const rateLimitError = checkUploadRateLimit(session.user.id)
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError }, { status: 429 })
    }

    // ===== 全局单文件大小硬上限 =====
    if (file.size > GLOBAL_MAX_FILE_SIZE) {
      const maxMB = GLOBAL_MAX_FILE_SIZE / (1024 * 1024)
      return NextResponse.json(
        { error: `File too large: global maximum is ${maxMB}MB` },
        { status: 400 }
      )
    }

    // ===== 任务附件类型白名单验证 =====
    // 对 task_attachment 类型应用更严格的文件类型限制
    if (isTaskUpload) {
      const category = inferAttachmentCategory(file.name, file.type)
      if (!category) {
        return NextResponse.json(
          {
            error: `Unsupported file type: "${file.name}". Allowed: images (jpg/png/webp), videos (mp4/mov/webm), documents (pdf/doc/docx/xls/xlsx/ppt/pptx), archives (zip/rar/7z), drawings (dwg/dxf)`
          },
          { status: 400 }
        )
      }

      // 应用该类型的文件大小限制
      const limit: AttachmentTypeLimit = ATTACHMENT_LIMITS[category]
      if (file.size > limit.maxFileSize) {
        const maxMB = limit.maxFileSize / (1024 * 1024)
        return NextResponse.json(
          { error: `File "${file.name}" exceeds ${maxMB}MB limit for ${category} files` },
          { status: 400 }
        )
      }
    }

    // Validate file size based on type (原有逻辑保留，适用于其他上传类型)
    const fileSize = file.size
    let maxFileSize = 20 * 1024 * 1024 // 20MB default

    if (type === 'product_video') {
      maxFileSize = 100 * 1024 * 1024 // 100MB for videos
    } else if (type === 'product_document') {
      maxFileSize = 50 * 1024 * 1024 // 50MB for product documents
    } else if (type === 'boothDocument') {
      maxFileSize = 100 * 1024 * 1024 // 100MB for booth documents
    }

    if (fileSize > maxFileSize) {
      const maxSizeMB = maxFileSize / (1024 * 1024)
      return NextResponse.json({ error: `File too large (max ${maxSizeMB}MB)` }, { status: 400 })
    }

    // Determine subdirectory based on type
    let subDir = 'others'
    if (type === 'product_image') subDir = 'products'
    else if (type === 'product_video') subDir = 'videos'
    else if (type === 'product_document') subDir = 'documents'
    else if (type === 'boothDocument') subDir = 'booth-documents'
    else if (type === 'logo') subDir = 'logos'
    else if (type === 'banner') subDir = 'banners'
    else if (type === 'brochure' || type === 'store_brochure') subDir = 'brochures'
    else if (type === 'chat_image') subDir = 'chat-images'
    else if (type === 'chat_file') subDir = 'chat-files'
    else if (type === 'task_attachment') subDir = 'task-attachments'

    const targetDir = path.join(UPLOAD_DIR, subDir)
    const backupTargetDir = path.join(BACKUP_DIR, subDir)
    await mkdir(targetDir, { recursive: true })
    await mkdir(backupTargetDir, { recursive: true })

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    let buffer = Buffer.from(bytes)
    let ext = ''
    let finalMimeType = file.type
    let publicUrl = ''

    // Process images with Sharp for optimization
    const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    if (isImage) {
      try {
        // Convert to WebP for better compression
        const optimizedBuffer = await sharp(buffer)
          .webp({ quality: 80, effort: 6 })
          .toBuffer()

        buffer = Buffer.from(optimizedBuffer)
        finalMimeType = 'image/webp'
        ext = '.webp'
      } catch (error) {
        console.error('Image processing error:', error)
        ext = getExtensionFromFilename(file.name) || getFileExtension(file.type)
      }
    } else if (file.type === 'application/pdf') {
      ext = '.pdf'
    } else {
      ext = getExtensionFromFilename(file.name) || getFileExtension(file.type)
    }

    // Unique final name with the processed extension (critical for Spaces uploads)
    const uniqueName = `${uuidv4()}${ext}`
    const localFilePath = path.join(targetDir, uniqueName)
    const backupFilePath = path.join(backupTargetDir, uniqueName)

    // --- Strategy: 3-level durable storage ---
    // Level 1 (primary): DigitalOcean Spaces if configured (S3-compatible object storage)
    // Level 2 (redundancy): Local public/uploads/{subDir}/ (served publicly)
    // Level 3 (safety net): Local storage/uploads-backup/{subDir}/ (not served, for recovery)

    const primaryFromSpaces = isSpacesConfigured()
    let spacesSuccess = false

    if (primaryFromSpaces) {
      try {
        const uploadResult = await uploadToSpaces(buffer, uniqueName, finalMimeType, subDir)
        publicUrl = uploadResult.url
        spacesSuccess = true
        console.log('[Upload] Saved to Spaces:', publicUrl)
      } catch (error) {
        console.error('[Upload] Spaces upload failed, falling back to local URL:', error)
        publicUrl = `${PUBLIC_URL_PREFIX}/${subDir}/${uniqueName}`
      }
    } else {
      publicUrl = `${PUBLIC_URL_PREFIX}/${subDir}/${uniqueName}`
    }

    // --- ALWAYS write both local copies (dual-write) for safety ---
    // This runs regardless of Spaces success — we keep the file locally as well.
    // If Spaces was used as primary, the local copies are recoverable fallbacks.
    // If Spaces failed or was disabled, these are the authoritative copies.
    try {
      await writeFile(localFilePath, buffer)
    } catch (writeError) {
      console.error('[Upload] Local primary write FAILED:', writeError)
      if (!spacesSuccess) {
        // If neither Spaces nor local works, hard failure
        throw writeError
      }
    }

    // Secondary backup copy (independent directory) — don't fail the upload if this errors
    try {
      await copyFile(localFilePath, backupFilePath)
    } catch (backupError) {
      // Fallback: write directly from buffer
      try {
        await writeFile(backupFilePath, buffer)
      } catch (writeBackupError) {
        console.warn('[Upload] Backup write failed (non-fatal):', writeBackupError)
      }
    }

    console.log(`[Upload] Final URL: ${publicUrl} | Spaces: ${spacesSuccess} | Local: ${localFilePath} | Backup: ${backupFilePath}`)

    // Create database record based on type
    const result: any = { url: publicUrl, fileName: file.name, size: fileSize }

    if (type === 'brochure' && productId) {
      // Create product brochure record
      const brochure = await prisma.productBrochure.create({
        data: {
          productId,
          fileName: file.name,
          fileUrl: publicUrl,
          fileSize,
          downloadCount: 0,
        }
      })
      result.brochureId = brochure.id
      
      // Update product to mark hasBrochure
      await prisma.product.update({
        where: { id: productId },
        data: { hasBrochure: true }
      })
    } else if (type === 'store_brochure') {
      // Create store brochure record (only for SELLER role)
      if (user.role === 'SELLER' && user.sellerProfile) {
        const brochure = await prisma.storeBrochure.create({
          data: {
            sellerId: user.sellerProfile.id,
            title: file.name.replace(/\.pdf$/i, ''),
            fileName: file.name,
            fileUrl: publicUrl,
            fileSize,
            downloadCount: 0,
            sortOrder: 0,
          }
        })
        result.brochureId = brochure.id
        result.sellerId = user.sellerProfile.id
      } else {
        return NextResponse.json({ error: 'Store brochure requires seller profile' }, { status: 400 })
      }
    } else if (type === 'product_image' && productId) {
      // Update product with new image
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })
      
      if (product) {
        const currentImages = product.images || []
        const updatedImages = [...currentImages, publicUrl]
        
        await prisma.product.update({
          where: { id: productId },
          data: {
            images: updatedImages,
            // Set main image if it's the first one
            ...(currentImages.length === 0 && { mainImageUrl: publicUrl })
          }
        })
        
        result.productId = productId
      }
    } else if (type === 'logo') {
      console.log('Processing logo upload - type:', type, 'user role:', user.role, 'has sellerProfile:', !!user.sellerProfile)
      // Update seller logo (create sellerProfile if not exists)
      let sellerProfile = user.sellerProfile
      if (!sellerProfile) {
        const userEmail = session.user.email || ''
        sellerProfile = await prisma.sellerProfile.create({
          data: {
            userId: session.user.id,
            storeName: userEmail.split('@')[0] || 'My Store',
            slug: `store-${session.user.id.slice(0, 8)}`,
            description: '',
            logoUrl: publicUrl
          }
        })
      } else {
        await prisma.sellerProfile.update({
          where: { id: sellerProfile.id },
          data: { logoUrl: publicUrl }
        })
      }
      result.sellerId = sellerProfile.id
    } else if (type === 'banner') {
      // Update seller banner (create sellerProfile if not exists)
      let sellerProfile = user.sellerProfile
      if (!sellerProfile) {
        const userEmail = session.user.email || ''
        sellerProfile = await prisma.sellerProfile.create({
          data: {
            userId: session.user.id,
            storeName: userEmail.split('@')[0] || 'My Store',
            slug: `store-${session.user.id.slice(0, 8)}`,
            description: '',
            bannerUrl: publicUrl
          }
        })
      } else {
        await prisma.sellerProfile.update({
          where: { id: sellerProfile.id },
          data: { bannerUrl: publicUrl }
        })
      }
      result.sellerId = sellerProfile.id
    } else if (type === 'boothLogo') {
      // Just return the URL for booth logo (booth will be created/updated separately)
      result.url = publicUrl
    } else if (type === 'boothBanner') {
      // Just return the URL for booth banner (booth will be created/updated separately)
      result.url = publicUrl
    } else if (type === 'boothDocument') {
      // Just return the URL for booth document (booth will be created/updated separately)
      result.url = publicUrl
    }

    return NextResponse.json({
      success: true,
      ...result,
      message: 'File uploaded successfully'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to get file extension from MIME type
function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
    'video/x-msvideo': '.avi',
    'video/x-ms-wmv': '.wmv',
    'video/webm': '.webm',
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar',
    'application/x-7z-compressed': '.7z',
  }
  return extensions[mimeType] || '.bin'
}

// Helper function to get file extension from filename
function getExtensionFromFilename(filename: string): string {
  const parts = filename.split('.')
  if (parts.length > 1) {
    return '.' + parts[parts.length - 1].toLowerCase()
  }
  return ''
}
