'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useParams } from 'next/navigation';
import type { Language } from '@/i18n/translations';

export default function SignOutPage() {
  const params = useParams();
  const locale = (params?.locale as Language) || 'en';

  useEffect(() => {
    const handleSignOut = async () => {
      // 根因修复：next-auth v4 的 signOut 默认用客户端 fetch 导航到 callbackUrl，
      // 请求带 `RSC: 1` header，服务器返回的是 RSC flight payload（裸 JSON）而非
      // 完整 HTML，页面就渲染出 `0:{"b":"build-...","f":[...]}` 这种飞行数据。
      // 加 cache-bust query 只改了 URL，改不掉「用 fetch 跳转」这个根子。
      // 正确做法：redirect:false 先登出，再用 window.location.replace() 做整页硬跳，
      // 强制浏览器以 Accept:text/html 完整加载落地页，彻底绕开 RSC fetch。
      try {
        await signOut({ redirect: false });
      } catch {
        // 即使登出接口异常也继续跳转，避免卡在退出页
      }
      const target = `/${locale}?logout=1&t=${Date.now()}`;
      window.location.replace(target);
    };
    handleSignOut();
  }, [locale]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Signing out...</p>
      </div>
    </div>
  );
}