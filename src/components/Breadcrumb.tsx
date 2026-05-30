'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, ChevronRight, Menu } from 'lucide-react';
import { useState } from 'react';
import type { LanguageCode } from '@/lib/languages';

type BreadcrumbProps = {
  locale: LanguageCode;
};

export default function Breadcrumb({ locale }: BreadcrumbProps) {
  const pathname = usePathname();
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const dict = {
    home: locale === 'zh' ? '首页' : locale === 'es' ? 'Inicio' : 'Home',
    products: locale === 'zh' ? '产品' : locale === 'es' ? 'Productos' : 'Products',
    stores: locale === 'zh' ? '参展商' : locale === 'es' ? 'Expositores' : 'Exhibitors',
    chat: locale === 'zh' ? '聊天广场' : locale === 'es' ? 'Plaza de Chat' : 'Chat Hall',
    seller: locale === 'zh' ? '卖家中心' : locale === 'es' ? 'Centro de Vendedor' : 'Seller Center',
    buyer: locale === 'zh' ? '买家中心' : locale === 'es' ? 'Centro de Comprador' : 'Buyer Center',
    admin: locale === 'zh' ? '管理后台' : locale === 'es' ? 'Panel de Administración' : 'Admin Panel',
    profile: locale === 'zh' ? '个人资料' : locale === 'es' ? 'Perfil' : 'Profile',
    settings: locale === 'zh' ? '设置' : locale === 'es' ? 'Configuración' : 'Settings',
    worldChat: locale === 'zh' ? '世界聊天' : locale === 'es' ? 'Chat Mundial' : 'World Chat',
    notices: locale === 'zh' ? '告示' : locale === 'es' ? 'Noticias' : 'Notices',
    booths: locale === 'zh' ? '展位管理' : locale === 'es' ? 'Gestión de Stand' : 'Booth Management',
    add: locale === 'zh' ? '添加' : locale === 'es' ? 'Agregar' : 'Add',
    edit: locale === 'zh' ? '编辑' : locale === 'es' ? 'Editar' : 'Edit',
    view: locale === 'zh' ? '查看' : locale === 'es' ? 'Ver' : 'View',
    all: locale === 'zh' ? '全部' : locale === 'es' ? 'Todos' : 'All',
    search: locale === 'zh' ? '搜索' : locale === 'es' ? 'Buscar' : 'Search',
    quickMenu: locale === 'zh' ? '快捷菜单' : locale === 'es' ? 'Menú Rápido' : 'Quick Menu',
  };

  const getPathWithoutLocale = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    const firstSegment = segments[0];
    const isLocale = ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko', 'ar', 'ru', 'pt', 'hi', 'th', 'vi'].includes(firstSegment);
    return isLocale ? '/' + segments.slice(1).join('/') : path;
  };

  const currentPath = getPathWithoutLocale(pathname);
  const pathSegments = currentPath.split('/').filter(Boolean);

  const getDisplayName = (segment: string, index: number): string => {
    const specialPaths: Record<string, string> = {
      'chat-hall': dict.chat,
      'seller': dict.seller,
      'buyer': dict.buyer,
      'admin': dict.admin,
      'profile': dict.profile,
      'settings': dict.settings,
      'booths': dict.booths,
      'world': dict.worldChat,
      'notices': dict.notices,
      'add': dict.add,
      'edit': dict.edit,
      'view': dict.view,
      'all': dict.all,
      'search': dict.search,
    };

    if (specialPaths[segment]) return specialPaths[segment];

    if (!isNaN(parseInt(segment))) {
      return index === pathSegments.length - 1 ? dict.view : '';
    }

    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  };

  const breadcrumbs = pathSegments.map((segment, index) => {
    const displayName = getDisplayName(segment, index);
    if (!displayName) return null;
    
    const href = `/${locale}/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;

    return {
      name: displayName,
      href,
      isLast,
    };
  }).filter(Boolean);

  const quickMenuItems = [
    { name: dict.home, href: `/${locale}`, icon: 'home' },
    { name: dict.products, href: `/${locale}/products`, icon: 'package' },
    { name: dict.stores, href: `/${locale}/stores`, icon: 'store' },
    { name: dict.chat, href: `/${locale}/chat-hall`, icon: 'message-circle' },
    { name: dict.seller, href: `/${locale}/seller`, icon: 'user' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10">
          <div className="flex items-center space-x-1 overflow-x-auto">
            <Link
              href={`/${locale}`}
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors shrink-0"
            >
              <Home className="w-4 h-4" />
            </Link>
            
            {breadcrumbs.length > 0 && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center shrink-0">
                    {!crumb.isLast ? (
                      <Link
                        href={crumb.href}
                        className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                      >
                        {crumb.name}
                      </Link>
                    ) : (
                      <span className="text-gray-800 font-medium text-sm">
                        {crumb.name}
                      </span>
                    )}
                    {index < breadcrumbs.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-1" />
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title={dict.quickMenu}
            >
              <Menu className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600 hidden sm:inline">{dict.quickMenu}</span>
            </button>

            {showQuickMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowQuickMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                  {quickMenuItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setShowQuickMenu(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span className="mr-2">
                        {item.icon === 'home' && <Home className="w-4 h-4" />}
                        {item.icon === 'package' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                        {item.icon === 'store' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                        {item.icon === 'message-circle' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                        {item.icon === 'user' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                      </span>
                      {item.name}
                    </Link>
                  ))}
                  <div className="border-t border-gray-200 my-1" />
                  <Link
                    href={`/${locale}/auth/login`}
                    onClick={() => setShowQuickMenu(false)}
                    className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0L7 10m4 6l4-4m-4 6l4-4" /></svg>
                    {locale === 'zh' ? '登录' : locale === 'es' ? 'Iniciar Sesión' : 'Login'}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
