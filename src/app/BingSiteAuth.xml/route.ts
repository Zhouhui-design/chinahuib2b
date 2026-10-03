import { NextResponse } from 'next/server'

/**
 * Bing site ownership verification file.
 *
 * Why this is a route handler and not a static file in public/:
 * `/BingSiteAuth.xml` contains a dot, so the locale middleware skips it, and
 * the Cloudflare geo-redirector Worker in front of the origin was rewriting
 * bare `.xml` requests into locale-prefixed paths (`/de/BingSiteAuth.xml`),
 * which then 404'd. Bing therefore could never confirm ownership.
 *
 * Serving it from the app router puts it behind an explicit middleware skip
 * (see src/middleware.ts) and guarantees a 200 with XML content-type.
 *
 * The code itself lives in BING_SITE_VERIFICATION so it is not committed.
 * The same value is emitted as <meta name="msvalidate.01"> by the root layout,
 * so either verification method Bing chooses will succeed.
 */
export async function GET() {
  const code = process.env['BING_SITE_VERIFICATION']?.trim()

  if (!code) {
    return new NextResponse('Bing verification code is not configured.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const body = `<?xml version="1.0"?>\n<users>\n  <user>${code}</user>\n</users>\n`

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
