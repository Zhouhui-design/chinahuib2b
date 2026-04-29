import Navbar from '@/components/Navbar'
import { getDictionary } from '@/locales/dictionary'
import type { LanguageCode } from '@/lib/languages'

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: LanguageCode }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  
  return (
    <>
      <Navbar locale={locale} />
      <main className="flex-1">
        {children}
      </main>
    </>
  )
}
