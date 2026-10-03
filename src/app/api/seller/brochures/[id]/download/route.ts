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

    // 游客与登录用户均可下载，无任何限制
    const brochure = await prisma.storeBrochure.findUnique({
      where: { id },
      include: { seller: true }
    })

    if (!brochure) {
      return NextResponse.json({ error: 'Brochure not found' }, { status: 404 })
    }

    // 记录下载：登录用户记账号；游客 userId 为 null（按 IP + 时间统计）
    await prisma.brochureDownload.create({
      data: {
        userId: session?.user?.id || null,
        sellerId: brochure.sellerId,
        brochureType: 'STORE',
        brochureId: brochure.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })

    // Increment download count
    await prisma.storeBrochure.update({
      where: { id },
      data: { downloadCount: { increment: 1 } }
    })

    // Redirect to actual file URL
    if (!brochure.fileUrl || brochure.fileUrl.startsWith('/')) {
      return NextResponse.json({
        message: 'Demo brochure — in production this redirects to the actual file.',
        fileName: brochure.fileName,
        downloadCount: brochure.downloadCount + 1
      })
    }

    return NextResponse.redirect(brochure.fileUrl)
  } catch (error) {
    console.error('Store brochure download error:', error)
    return NextResponse.json({ error: 'Failed to process download' }, { status: 500 })
  }
}
