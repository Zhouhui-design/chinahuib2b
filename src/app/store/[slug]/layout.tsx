/**
 * Store layout - GitHub-style store URL (x2xhub.com/<slug>)
 *
 * This route has NO locale segment in the URL, so locale is detected from:
 *   1. NEXT_LOCALE cookie (set by LanguageSwitcher)
 *   2. Accept-Language header
 *   3. fallback to 'en'
 *
 * Renders the platform Navbar + Footer so visitors can navigate back to the
 * main marketplace while browsing a seller's "official website".
 */

import { detectLocale } from '@/lib/server-locale'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await detectLocale()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />
      <main>{children}</main>
      <Footer locale={locale} />
    </div>
  )
}
