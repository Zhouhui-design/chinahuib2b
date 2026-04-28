import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get seller profile
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!sellerProfile) {
      return NextResponse.json(
        { error: 'Seller profile not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('fileType') as string
    const description = formData.get('description') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!fileType) {
      return NextResponse.json(
        { error: 'File type is required' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = [
      'BUSINESS_LICENSE',
      'ID_CARD',
      'DRIVER_LICENSE',
      'CREDIT_CARD',
      'PHOTO',
      'VIDEO',
      'OTHER'
    ]

    if (!validTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB for videos, 10MB for others)
    const maxSize = fileType === 'VIDEO' ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'verification', sellerProfile.id)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${originalName}`
    const filePath = join(uploadDir, fileName)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Generate public URL
    const fileUrl = `/uploads/verification/${sellerProfile.id}/${fileName}`

    // Save to database
    const verificationFile = await prisma.sellerVerificationFile.create({
      data: {
        sellerId: sellerProfile.id,
        fileType: fileType as any,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        description: description || undefined,
      }
    })

    return NextResponse.json({
      success: true,
      file: {
        id: verificationFile.id,
        fileName: verificationFile.fileName,
        fileUrl: verificationFile.fileUrl,
        fileSize: verificationFile.fileSize,
        fileType: verificationFile.fileType,
        createdAt: verificationFile.createdAt,
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
