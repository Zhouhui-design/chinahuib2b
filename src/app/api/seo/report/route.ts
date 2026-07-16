import { NextRequest, NextResponse } from "next/server"
import { generateDailySEOReport, pingSearchEngines } from "@/lib/seo-automation"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'daily'

    if (type === 'ping') {
      const pingResults = await pingSearchEngines()
      return NextResponse.json({
        success: true,
        message: 'Search engine ping completed',
        results: pingResults,
      })
    }

    const report = await generateDailySEOReport()

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    console.error('Generate SEO report error:', error)
    return NextResponse.json({
      error: 'Failed to generate SEO report',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}