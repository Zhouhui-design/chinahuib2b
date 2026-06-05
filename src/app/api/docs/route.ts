import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.redirect(new URL('/api-docs', 'https://x2xhub.com'))
}
