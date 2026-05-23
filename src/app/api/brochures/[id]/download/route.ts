import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await auth()
    const brochure = await prisma.productBrochure.findUnique({
      where: { id },
      include: { product: true }
    })

    if (!brochure) {
      return NextResponse.json({ error: 'Brochure not found' }, { status: 404 })
    }

    // Track download (guest or logged-in user can download)
    await prisma.brochureDownload.create({
      data: {
        userId: session?.user?.id || null,
        brochureType: 'PRODUCT',
        brochureId: brochure.productId,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })

    // Increment download count
    await prisma.productBrochure.update({
      where: { id },
      data: { downloadCount: { increment: 1 } }
    })

    // Redirect to file URL (for now, will be DigitalOcean Spaces URL)
    // For demo purposes, if it's a placeholder, return a message
    if (brochure.fileUrl.startsWith('/')) {
      return NextResponse.json({ 
        message: 'This is a demo brochure. In production, this would redirect to the actual PDF file on DigitalOcean Spaces.',
        fileName: brochure.fileName,
        downloadCount: brochure.downloadCount + 1
      })
    }

    // Redirect to actual file
    return NextResponse.redirect(brochure.fileUrl)
  } catch (error) {
    console.error('Brochure download error:', error)
    return NextResponse.json({ error: 'Failed to process download' }, { status: 500 })
  }
}
