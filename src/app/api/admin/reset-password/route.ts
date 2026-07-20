import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const adminEmail = 'admin@chinahuib2b.top'
    const newPassword = 'Admin@2024Secure!'

    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin user not found!' },
        { status: 404 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Admin password reset successfully!',
      email: adminEmail,
      password: newPassword
    })

  } catch (error) {
    console.error('Error resetting admin password:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}