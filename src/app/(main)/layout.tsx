'use client';

import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import { useParams } from 'next/navigation';
import type { LanguageCode } from '@/lib/languages';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ locale: LanguageCode }>();
  const locale = params.locale || 'en';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />
      <Breadcrumb locale={locale} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
