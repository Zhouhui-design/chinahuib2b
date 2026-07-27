'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react'

interface MobileBottomNavProps {
  locale: string
}

const navItems = [
  { id: 'home', icon: Home, label: { zh: '首页', en: 'Home' } },
  { id: 'products', icon: Search, label: { zh: '产品', en: 'Products' } },
  { id: 'cart', icon: ShoppingCart, label: { zh: '购物车', en: 'Cart' } },
  { id: 'favorites', icon: Heart, label: { zh: '收藏', en: 'Favorites' } },
  { id: 'profile', icon: User, label: { zh: '我的', en: 'Profile' } },
]

export default function MobileBottomNav({ locale }: MobileBottomNavProps) {
  const pathname = usePathname()

  const getPath = (id: string): string => {
    const paths: Record<string, string> = {
      home: `/${locale}`,
      products: `/${locale}/products`,
      cart: `/${locale}/cart`,
      favorites: `/${locale}/favorites`,
      profile: `/${locale}/profile`,
    }
    return paths[id] || `/${locale}`
  }

  const isActive = (id: string): boolean => {
    const activePaths: Record<string, string[]> = {
      home: [`/${locale}`, `/${locale}/`],
      products: [`/${locale}/products`],
      cart: [`/${locale}/cart`],
      favorites: [`/${locale}/favorites`],
      profile: [`/${locale}/profile`, `/${locale}/settings`, `/${locale}/account`],
    }
    return activePaths[id]?.some((path) => pathname.startsWith(path)) || false
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.id)

          return (
            <Link
              key={item.id}
              href={getPath(item.id)}
              className={`flex flex-col items-center py-3 px-2 flex-1 transition-colors ${
                active ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <Icon
                className={`w-6 h-6 mb-1 transition-transform ${active ? 'scale-110' : ''}`}
              />
              <span className="text-xs font-medium">{item.label[locale as 'zh' | 'en']}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}