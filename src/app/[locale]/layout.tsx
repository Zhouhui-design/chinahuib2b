import { notFound } from 'next/navigation';
import { languages, type LanguageCode } from '@/lib/languages';

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
  
  // Validate locale
  const isValidLocale = languages.some(lang => lang.code === locale);
  if (!isValidLocale) {
    notFound();
  }

  return <>{children}</>;
}
