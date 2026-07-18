import { NextRequest, NextResponse } from 'next/server'
import { getServerLocation, COUNTRIES } from '@/lib/geo-location'

export async function GET(request: NextRequest) {
  try {
    const location = await getServerLocation(request)
    
    if (!location) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'Unable to determine location',
      })
    }
    
    return NextResponse.json({
      success: true,
      data: location,
    })
  } catch (error) {
    console.error('Error getting location:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get location',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const ip = body.ip
    
    if (!ip) {
      return NextResponse.json({
        success: false,
        error: 'IP address is required',
      }, { status: 400 })
    }
    
    const location = await getServerLocation(new Request('http://localhost', {
      headers: { 'x-forwarded-for': ip },
    }))
    
    if (!location) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'Unable to determine location',
      })
    }
    
    return NextResponse.json({
      success: true,
      data: location,
    })
  } catch (error) {
    console.error('Error getting location:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get location',
    }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({
    success: true,
    countries: COUNTRIES,
  })
}