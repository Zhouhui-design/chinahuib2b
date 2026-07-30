import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

interface GeoData {
  country: string
  countryCode: string
  city: string
  region: string
  regionName: string
  lat: number
  lon: number
  timezone: string
  isp: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, sellerId } = body

    if (!productId && !sellerId) {
      return NextResponse.json(
        { error: 'productId or sellerId is required' },
        { status: 400 }
      )
    }

    const session = await auth()
    const viewerId = session?.user?.id || null

    let isSelfView = false
    if (viewerId && sellerId) {
      const seller = await prisma.sellerProfile.findUnique({
        where: { id: sellerId },
        select: { userId: true }
      })
      if (seller && seller.userId === viewerId) {
        isSelfView = true
      }
    }

    const ip = request.headers.get('cf-connecting-ip') ||
               request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               request.socket?.remoteAddress ||
               'unknown'

    if (ip === 'unknown' || ip === '::1' || ip === '127.0.0.1') {
      return NextResponse.json({ success: true, message: 'Local development, skipped' })
    }

    const geoData = await fetchGeoData(ip)

    if (!geoData) {
      return NextResponse.json({ success: true, message: 'Geolocation failed, skipped' })
    }

    // Create visitor record
    // Use a transaction to handle potential foreign key issues gracefully
    try {
      await prisma.visitor.create({
        data: {
          ipHash: hashIp(ip),
          productId: productId || null,
          sellerId: sellerId || null,
          viewerId,
          country: geoData.country,
          countryCode: geoData.countryCode,
          city: geoData.city,
          region: geoData.regionName,
          timezone: geoData.timezone,
          isp: geoData.isp,
          userAgent: request.headers.get('user-agent') || null,
          url: request.headers.get('referer') || null,
          isSelfView,
        }
      })
    } catch (createError) {
      // If foreign key constraint fails (e.g., sellerId or productId doesn't exist),
      // try creating without the problematic fields
      console.warn('Visitor create with relationships failed, trying without:', createError instanceof Error ? createError.message : String(createError))
      
      // Create visitor without foreign key references if they don't exist
      await prisma.visitor.create({
        data: {
          ipHash: hashIp(ip),
          productId: null,
          sellerId: null,
          viewerId,
          country: geoData.country,
          countryCode: geoData.countryCode,
          city: geoData.city,
          region: geoData.regionName,
          timezone: geoData.timezone,
          isp: geoData.isp,
          userAgent: request.headers.get('user-agent') || null,
          url: request.headers.get('referer') || null,
          isSelfView: false,
        }
      })
    }

    if (productId) {
      await prisma.product.update({
        where: { id: productId },
        data: { viewCount: { increment: 1 } }
      })
    }

    return NextResponse.json({
      success: true,
      location: {
        country: geoData.country,
        city: geoData.city,
        countryCode: geoData.countryCode,
        isSelfView
      }
    })

  } catch (error) {
    console.error('Visitor tracking error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({
      success: true,
      message: 'Tracking error, skipped',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 })
  }
}

async function fetchGeoData(ip: string): Promise<GeoData | null> {
  try {
    const response = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,city,region,regionName,lat,lon,timezone,isp,message`)

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (data.status !== 'success') {
      return null
    }

    return {
      country: data.country || 'Unknown',
      countryCode: data.countryCode || 'XX',
      city: data.city || 'Unknown',
      region: data.region || '',
      regionName: data.regionName || '',
      lat: data.lat || 0,
      lon: data.lon || 0,
      timezone: data.timezone || '',
      isp: data.isp || ''
    }
  } catch (error) {
    console.error('Geolocation fetch error:', error)
    return null
  }
}

function hashIp(ip: string): string {
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}