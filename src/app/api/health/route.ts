import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { redis } from "@/lib/redis"

export async function GET() {
  try {
    const [dbResult, redisResult] = await Promise.all([
      prisma.$queryRaw`SELECT 1`,
      redis.ping(),
    ])

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: "ok",
        redis: "ok",
      },
      version: process.env.npm_package_version || "0.0.0",
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "error",
        redis: "error",
      },
    }, { status: 503 })
  }
}
