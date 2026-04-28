import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Package, Store, FileText, Settings, BarChart3, LogOut, HelpCircle } from 'lucide-react'
import { signOut } from '@/lib/auth'
import LanguageSwitcher from '@/components/language/LanguageSwitcher'

export default async function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    // Get language from cookie or use default 'en'
    const cookieStore = await cookies()
    const language = cookieStore.get('language')?.value || 'en'
    redirect(`/${language}/auth/login`)
  }
  
  // Get current language from cookie for LanguageSwitcher
  const cookieStore = await cookies()
  const currentLanguage = cookieStore.get('language')?.value || 'en'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Global Expo Network
              </Link>
              <span className="ml-4 text-sm text-gray-500">Seller Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <LanguageSwitcher currentLocale={currentLanguage as any} />
              
              {/* Help Guide Link */}
              <Link
                href="/seller/guide"
                className="flex items-center text-sm text-gray-600 hover:text-blue-600"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Help Guide
              </Link>
              
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                View Public Site
              </Link>
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/' })
                }}
              >
                <button
                  type="submit"
                  className="flex items-center text-sm text-gray-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              <Link
                href="/seller"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-blue-50 text-blue-700"
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
              
              <Link
                href="/seller/products"
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <Package className="w-5 h-5 mr-3" />
                Products
              </Link>
              
              <Link
                href="/seller/store"
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <Store className="w-5 h-5 mr-3" />
                Store Profile
              </Link>
              
              <Link
                href="/seller/brochures"
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <FileText className="w-5 h-5 mr-3" />
                Brochures
              </Link>
              
              <Link
                href="/seller/settings"
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Stats
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Products:</span>
                  <span className="font-semibold">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Views:</span>
                  <span className="font-semibold">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Downloads:</span>
                  <span className="font-semibold">--</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
