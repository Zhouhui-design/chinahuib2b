import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    })
    
    const keepEmail = '1994169577@qq.com'
    const keepAdmin = admins.find(a => a.email === keepEmail)
    const deleteAdmins = admins.filter(a => a.email !== keepEmail)
    
    if (!keepAdmin) {
      return NextResponse.json(
        { error: `未找到要保留的账号: ${keepEmail}` },
        { status: 404 }
      )
    }
    
    const results = []
    
    for (const admin of deleteAdmins) {
      try {
        await prisma.user.delete({
          where: { id: admin.id }
        })
        results.push({ email: admin.email, status: 'success' })
      } catch (error) {
        results.push({ email: admin.email, status: 'error', message: (error as Error).message })
      }
    }
    
    const remainingAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    })
    
    return NextResponse.json({
      success: true,
      message: `已删除 ${results.filter(r => r.status === 'success').length} 个管理员账号`,
      deleted: results,
      remaining: remainingAdmins.map(a => ({ id: a.id, email: a.email }))
    })
    
  } catch (error) {
    console.error('Error cleaning up admins:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}