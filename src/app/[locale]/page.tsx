import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/locales/dictionary";
import type { LanguageCode } from "@/lib/languages";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";

type PageProps = {
  params: Promise<{ locale: LanguageCode }>;
};

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="bg-gray-50 min-h-screen">
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
            </div>

            {/* Right side - Language Switcher & Auth */}
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {dict.home.hero.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            {dict.home.hero.subtitle}
          </p>
          
          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-2 flex gap-2">
              <input
                type="text"
                placeholder={dict.home.hero.searchPlaceholder}
                className="flex-1 px-4 py-3 text-gray-800 focus:outline-none"
              />
              <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-md font-semibold transition-colors">
                {dict.home.hero.searchButton}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{dict.home.featured.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Product Image</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Booth Name {item}</h3>
                <div className="space-y-2 mb-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Product Category:</span> Electronics, Home Appliances
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Customization:</span> Yes
                  </p>
                </div>
                <Link 
                  href={`/${locale}/stores/1`} 
                  className="w-full block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Enter Booth to View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">{dict.home.why.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{dict.home.why.verified.title}</h3>
              <p className="text-gray-600">{dict.home.why.verified.description}</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{dict.home.why.competitive.title}</h3>
              <p className="text-gray-600">{dict.home.why.competitive.description}</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{dict.home.why.global.title}</h3>
              <p className="text-gray-600">{dict.home.why.global.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Exhibitors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{dict.home.exhibitors.title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((item) => (
            <Link key={item} href="/store/1" className="group">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Logo</span>
                </div>
                <h3 className="font-semibold group-hover:text-blue-600 transition-colors">Exhibitor {item}</h3>
                <p className="text-gray-600 text-sm mt-1">Verified Supplier</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link 
            href="/stores" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-semibold transition-colors"
          >
            {dict.home.exhibitors.viewAll}
          </Link>
        </div>
      </section>
    </div>
  );
}
