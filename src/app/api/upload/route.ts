import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { writeFile, mkdir } from 'fs/promises'

import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

// Upload directory configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public/uploads')
const PUBLIC_URL_PREFIX = '/uploads'

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

    if (!user || user.role !== 'SELLER' || !user.sellerProfile) {
      return NextResponse.json({ error: 'Only sellers can upload files' }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'product_image'
    const productId = formData.get('productId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (20MB max)
    const fileSize = file.size
    if (fileSize > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 })
    }

    // Determine subdirectory based on type
    let subDir = 'others'
    if (type === 'product_image') subDir = 'products'
    else if (type === 'logo') subDir = 'logos'
    else if (type === 'banner') subDir = 'banners'
    else if (type === 'brochure' || type === 'store_brochure') subDir = 'brochures'

    const targetDir = path.join(UPLOAD_DIR, subDir)
    await mkdir(targetDir, { recursive: true })

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    let buffer = Buffer.from(bytes)
    let ext = ''
    let finalMimeType = file.type

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
        // If processing fails, use original extension
        ext = getFileExtension(file.name)
      }
    } else if (file.type === 'application/pdf') {
      ext = '.pdf'
    } else {
      ext = getFileExtension(file.name)
    }

    // Generate unique filename
    const uniqueName = `${uuidv4()}${ext}`
    const filePath = path.join(targetDir, uniqueName)
    
    // Write file to disk
    await writeFile(filePath, buffer)

    // Generate public URL
    const publicUrl = `${PUBLIC_URL_PREFIX}/${subDir}/${uniqueName}`

    // Create database record based on type
    let result: any = { url: publicUrl, fileName: file.name, size: fileSize }

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
      // Create store brochure record
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
      // Update seller logo
      await prisma.sellerProfile.update({
        where: { id: user.sellerProfile.id },
        data: { logoUrl: publicUrl }
      })
      result.sellerId = user.sellerProfile.id
    } else if (type === 'banner') {
      // Update seller banner
      await prisma.sellerProfile.update({
        where: { id: user.sellerProfile.id },
        data: { bannerUrl: publicUrl }
      })
      result.sellerId = user.sellerProfile.id
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
  }
  return extensions[mimeType] || '.bin'
}
