import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3Client, spacesBucket, getPublicUrl, validateFileType, FILE_LIMITS } from "@/lib/s3"
import sharp from 'sharp'

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
    const type = formData.get('type') as string // 'product_image', 'brochure', 'store_brochure', 'logo', 'banner'
    const productId = formData.get('productId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!type) {
      return NextResponse.json({ error: 'Upload type not specified' }, { status: 400 })
    }

    // Validate file size
    const fileSize = file.size
    let maxSize: number
    
    switch (type) {
      case 'product_image':
      case 'logo':
      case 'banner':
        maxSize = FILE_LIMITS.IMAGE
        break
      case 'brochure':
      case 'store_brochure':
        maxSize = FILE_LIMITS.PDF
        break
      default:
        maxSize = FILE_LIMITS.DOCUMENT
    }

    if (fileSize > maxSize) {
      return NextResponse.json({ 
        error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    // Validate file type
    const mimeType = file.type
    let allowedTypes: string[]
    
    switch (type) {
      case 'product_image':
      case 'logo':
      case 'banner':
        allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        break
      case 'brochure':
      case 'store_brochure':
        allowedTypes = ['application/pdf']
        break
      default:
        return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 })
    }

    if (!validateFileType(mimeType, allowedTypes)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` 
      }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    let buffer = Buffer.from(bytes)
    let finalMimeType = mimeType
    let fileExtension = ''

    // Process images with Sharp for optimization
    if (['product_image', 'logo', 'banner'].includes(type)) {
      try {
        // Determine output format
        const image = sharp(buffer)
        const metadata = await image.metadata()
        
        // Convert to WebP for better compression
        const optimizedBuffer = await image
          .webp({ quality: 80, effort: 6 })
          .toBuffer()
        
        buffer = Buffer.from(optimizedBuffer)
        finalMimeType = 'image/webp'
        fileExtension = '.webp'
      } catch (error) {
        console.error('Image processing error:', error)
        // If processing fails, use original file
        fileExtension = getFileExtension(mimeType)
      }
    } else {
      fileExtension = getFileExtension(mimeType)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileName = `${user.sellerProfile.id}/${type}/${timestamp}-${randomString}${fileExtension}`

    // Upload to DigitalOcean Spaces
    const uploadParams = {
      Bucket: spacesBucket,
      Key: fileName,
      Body: buffer,
      ContentType: finalMimeType,
      ACL: 'public-read' as const,
    }

    await s3Client.send(new PutObjectCommand(uploadParams))

    // Get public URL
    const fileUrl = getPublicUrl(fileName)

    // Create database record based on type
    let result: any = { url: fileUrl, fileName, size: fileSize }

    if (type === 'brochure' && productId) {
      // Create product brochure record
      const brochure = await prisma.productBrochure.create({
        data: {
          productId,
          title: formData.get('title') as string || file.name,
          fileName: file.name,
          fileUrl,
          fileType: 'PDF',
          fileSize,
          sortOrder: 0,
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
          title: formData.get('title') as string || file.name,
          fileUrl,
          downloadCount: 0,
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
        const updatedImages = [...currentImages, fileUrl]
        
        await prisma.product.update({
          where: { id: productId },
          data: {
            images: updatedImages,
            // Set main image if it's the first one
            ...(currentImages.length === 0 && { mainImageUrl: fileUrl })
          }
        })
        
        result.productId = productId
      }
    } else if (type === 'logo') {
      // Update seller logo
      await prisma.sellerProfile.update({
        where: { id: user.sellerProfile.id },
        data: { logoUrl: fileUrl }
      })
      result.sellerId = user.sellerProfile.id
    } else if (type === 'banner') {
      // Update seller banner
      await prisma.sellerProfile.update({
        where: { id: user.sellerProfile.id },
        data: { bannerUrl: fileUrl }
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
