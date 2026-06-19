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
      await signOut({ callbackUrl: `/${locale}` });
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