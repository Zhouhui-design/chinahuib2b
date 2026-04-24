'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from '@/components/language/LanguageSwitcher';
import { getDictionary } from '@/locales/dictionary';
import type { LanguageCode } from '@/lib/languages';

type NavbarProps = {
  locale: LanguageCode;
};

export default function Navbar({ locale }: NavbarProps) {
  const pathname = usePathname();
  
  // Get dict on client side using a simpler approach
  const dict = {
    nav: {
      home: locale === 'zh' ? '首页' : locale === 'es' ? 'Inicio' : 'Home',
      products: locale === 'zh' ? '产品' : locale === 'es' ? 'Productos' : 'Products',
      exhibitors: locale === 'zh' ? '参展商' : locale === 'es' ? 'Expositores' : 'Exhibitors',
      login: locale === 'zh' ? '登录' : locale === 'es' ? 'Iniciar Sesión' : 'Login',
      register: locale === 'zh' ? '注册' : locale === 'es' ? 'Registrarse' : 'Register',
    }
  };

  // Extract path without language prefix
  const getPathWithoutLocale = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    const firstSegment = segments[0];
    const isLocale = ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko', 'ar', 'ru', 'pt', 'hi', 'th', 'vi'].includes(firstSegment);
    return isLocale ? '/' + segments.slice(1).join('/') : path;
  };

  const currentPath = getPathWithoutLocale(pathname);

  return (
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
            <Link
              href={`/${locale}`}
              className={`text-sm font-medium transition-colors ${
                currentPath === '/' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {dict.nav.home}
            </Link>
            <Link
              href={`/${locale}/products`}
              className={`text-sm font-medium transition-colors ${
                currentPath.startsWith('/products') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {dict.nav.products}
            </Link>
            <Link
              href={`/${locale}/stores`}
              className={`text-sm font-medium transition-colors ${
                currentPath.startsWith('/stores') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {dict.nav.exhibitors}
            </Link>
          </div>

          {/* Right side - Language Switcher & Auth */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            <div className="hidden sm:flex items-center space-x-3">
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
  );
}
