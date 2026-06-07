import { notFound } from 'next/navigation';
import Link from 'next/link';
import { languages, type LanguageCode } from '@/lib/languages';
import { getDictionary } from '@/locales/dictionary';
import LanguageSwitcher from '@/components/language/LanguageSwitcher';

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: LanguageCode }>;
};

export async function generateStaticParams() {
  return languages.map((lang) => ({
    locale: lang.code,
  }));
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  
  // Validate locale
  const isValidLocale = languages.some(lang => lang.code === locale);
  if (!isValidLocale) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-xl font-bold text-gray-800 hidden sm:block">Global Expo</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href={`/${locale}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                {dict.nav.home}
              </Link>
              <Link href={`/${locale}/products`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                {dict.nav.products}
              </Link>
              <Link href={`/${locale}/stores`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                {dict.nav.exhibitors}
              </Link>
              <Link href={`/${locale}/chat-hall`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {dict.nav.chatHall}
              </Link>
              <Link href={`/${locale}/marketplace`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {dict.nav.marketplace}
              </Link>
              <Link href={`/${locale}/auction-screen`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                {dict.nav.auction}
              </Link>
              <Link href={`/${locale}/api-docs`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                {dict.nav.api}
              </Link>
              <Link href={`/${locale}/wallet`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {dict.nav.wallet}
              </Link>
              <Link href={`/${locale}/notifications`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {dict.nav.notifications}
              </Link>
              <Link href={`/${locale}/seller`} className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {dict.nav.sellerPortal}
              </Link>
            </div>

            {/* Right side - Language Switcher & Auth */}
            <div className="flex items-center space-x-4">
              <LanguageSwitcher currentLocale={locale} />
              
              <div className="flex items-center space-x-3">
                <Link
                  href={`/${locale}/auth/login`}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {dict.nav.login}
                </Link>
                <Link
                  href={`/${locale}/auth/register`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {dict.nav.register}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="md:hidden bg-white border-t">
        <div className="px-4 py-3 space-y-2">
          <Link href={`/${locale}`} className="block text-sm font-medium text-gray-700 hover:text-blue-600 py-2">
            {dict.nav.home}
          </Link>
          <Link href={`/${locale}/products`} className="block text-sm font-medium text-gray-700 hover:text-blue-600 py-2">
            {dict.nav.products}
          </Link>
          <Link href={`/${locale}/stores`} className="block text-sm font-medium text-gray-700 hover:text-blue-600 py-2">
            {dict.nav.exhibitors}
          </Link>
          <Link href={`/${locale}/chat-hall`} className="block text-sm font-medium text-gray-700 hover:text-blue-600 py-2">
            {dict.nav.chatHall}
          </Link>
          <Link href={`/${locale}/marketplace`} className="block text-sm font-medium text-gray-700 hover:text-blue-600 py-2">
            {dict.nav.marketplace}
          </Link>
          <Link href={`/${locale}/auction-screen`} className="block text-sm font-medium text-gray-700 hover:text-blue-600 py-2">
            {dict.nav.auction}
          </Link>
          <Link href={`/${locale}/api-docs`} className="block text-sm font-medium text-gray-700 hover:text-blue-600 py-2">
            {dict.nav.api}
          </Link>
          <Link href={`/${locale}/seller`} className="block text-sm font-medium text-orange-600 hover:text-orange-700 py-2">
            {dict.nav.sellerPortal}
          </Link>
        </div>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}
