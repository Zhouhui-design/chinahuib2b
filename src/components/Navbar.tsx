'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from '@/components/language/LanguageSwitcher';
import type { LanguageCode } from '@/lib/languages';
import { useState, useEffect } from 'react';
import { User, LogOut, Settings, Store, MessageCircle, Bot, DollarSign, UserCircle, MessageSquare, ShoppingBag, Gavel, BookOpen, Key, History, Users, Terminal } from 'lucide-react';
import { getDictionary } from '@/locales/dictionary';

type NavbarProps = {
  locale: LanguageCode;
};

export default function Navbar({ locale }: NavbarProps) {
  const pathname = usePathname();
  interface UserSession {
    name?: string
    email?: string
    role?: string
  }
  const [user, setUser] = useState<UserSession | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dict, setDict] = useState<Record<string, any> | null>(null);
  
  useEffect(() => {
    const fetchDict = async () => {
      const dictionary = await getDictionary(locale);
      setDict(dictionary);
    };
    fetchDict();
  }, [locale]);
  
  useEffect(() => {
    const fetchSession = () => {
      fetch('/api/auth/session')
        .then(res => res.json())
        .then(data => {
          if (data?.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        })
        .catch(err => console.error('Failed to fetch session:', err));
    }
    
    fetchSession()
    
    const handleFocus = () => fetchSession()
    window.addEventListener('focus', handleFocus)
    
    const interval = setInterval(fetchSession, 30000)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
  }, [])
  
  if (!dict) return null;

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
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:block">Global Expo</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
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
            <Link
              href={`/${locale}/chat-hall`}
              className={`text-sm font-medium transition-colors flex items-center ${
                currentPath.startsWith('/chat-hall') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {dict.nav.chatHall}
            </Link>
            <Link
              href={`/${locale}/marketplace`}
              className={`text-sm font-medium transition-colors flex items-center ${
                currentPath.startsWith('/marketplace') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-1" />
              {dict.nav.marketplace}
            </Link>
            <Link
              href={`/${locale}/auction-screen`}
              className={`text-sm font-medium transition-colors flex items-center ${
                currentPath.startsWith('/auction-screen') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <Gavel className="w-4 h-4 mr-1" />
              {dict.nav.auction}
            </Link>
            <Link
              href={`/${locale}/api-docs`}
              className={`text-sm font-medium transition-colors flex items-center ${
                currentPath.startsWith('/api-docs') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <Terminal className="w-4 h-4 mr-1" />
              {dict.nav.apiDocs}
            </Link>
            <Link
              href="/ai-register"
              className={`text-sm font-medium transition-colors flex items-center bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-blue-600`}
            >
              <Bot className="w-4 h-4 mr-1" />
              AI 注册
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher currentLocale={locale} />
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">{dict.nav.profile}</span>
                </button>
                
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                      
                      <Link
                        href={`/${locale}/buyer/profile`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserCircle className="w-4 h-4 mr-2" />
                        {dict.nav.profile}
                      </Link>
                      
                      <Link
                        href={`/${locale}/buyer/settings`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        {dict.nav.accountSettings}
                      </Link>
                      
                      <Link
                        href={`/${locale}/buyer/finances`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        {dict.nav.finances}
                      </Link>
                      
                      <div className="border-t border-gray-200 my-1" />
                      
                      <Link
                        href={`/${locale}/chat-hall`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {dict.nav.chatAccount}
                      </Link>
                      
                      <Link
                        href={`/${locale}/marketplace`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        {dict.nav.marketplace}
                      </Link>
                      
                      <Link
                        href={`/${locale}/auction-screen`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Gavel className="w-4 h-4 mr-2" />
                        {dict.nav.auction}
                      </Link>
                      
                      <div className="border-t border-gray-200 my-1" />
                      
                      {user.role === 'SELLER' && (
                        <>
                          <Link
                            href="/seller"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Store className="w-4 h-4 mr-2" />
                            {dict.nav.myStore}
                          </Link>
                          <Link
                            href="/seller/ai-management"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Bot className="w-4 h-4 mr-2" />
                            {dict.nav.aiAgents}
                          </Link>
                          <div className="border-t border-gray-200 my-1" />
                        </>
                      )}
                      
                      <Link
                        href={`/${locale}/api-keys`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Key className="w-4 h-4 mr-2" />
                        {dict.nav.apiKeys}
                      </Link>
                      
                      <Link
                        href={`/${locale}/ai-audit`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <History className="w-4 h-4 mr-2" />
                        {dict.nav.aiAudit}
                      </Link>
                      
                      <Link
                        href={`/${locale}/ai-register`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Bot className="w-4 h-4 mr-2" />
                        {dict.nav.aiRegister}
                      </Link>
                      
                      <Link
                        href={`/${locale}/team-chat`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        {dict.nav.teamChat}
                      </Link>
                      
                      {user.role === 'ADMIN' && (
                        <>
                          <div className="border-t border-gray-200 my-1" />
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Admin Panel
                          </Link>
                        </>
                      )}
                      
                      <div className="border-t border-gray-200 my-1" />
                      <Link
                        href={`/${locale}/auth/signout`}
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {dict.nav.signOut}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            ) : (
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
            )}
            
            {!user && (
              <Link
                href={`/${locale}/auth/login`}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm"
              >
                {dict.nav.sellerPortal}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
