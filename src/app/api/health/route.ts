import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      error: "Database connection failed",
      timestamp: new Date().toISOString(),
    }, { status: 503 })
  }
}