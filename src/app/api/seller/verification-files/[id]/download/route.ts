import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * GET /api/seller/verification-files/[id]/download
 * 证书/认证文件下载：游客与登录用户均可下载（方案 D）。
 * 登录用户记账号，游客 userId 为 null 并按 IP + 时间统计。
 * 记录写入 BrochureDownload（type=STORE，文件为公司资质证书）。
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    const file = await prisma.sellerVerificationFile.findUnique({
      where: { id },
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // 记录下载：游客 userId 为 null
    await prisma.brochureDownload.create({
      data: {
        userId: session?.user?.id || null,
        sellerId: file.sellerId,
        brochureType: 'STORE',
        brochureId: file.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    if (!file.fileUrl || file.fileUrl.startsWith('/')) {
      return NextResponse.json({
        message: 'File URL not available for direct download.',
        fileName: file.fileName,
      })
    }

    return NextResponse.redirect(file.fileUrl)
  } catch (error) {
    console.error('Verification file download error:', error)
    return NextResponse.json({ error: 'Failed to process download' }, { status: 500 })
  }
}
