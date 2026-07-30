import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  return NextResponse.json({ success: true, notices: [] }, { status: 200 })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: false, error: 'Maintenance not configured' }, { status: 501 })
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ success: false, error: 'Maintenance not configured' }, { status: 501 })
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ success: false, error: 'Maintenance not configured' }, { status: 501 })
}