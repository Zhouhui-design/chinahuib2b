import Navbar from '@/components/Navbar'
import { getDictionary } from '@/locales/dictionary'
import type { LanguageCode } from '@/lib/languages'

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: LanguageCode }
}) {
  const dict = await getDictionary(params.locale)
  
  return (
    <>
      <Navbar locale={params.locale} />
      <main className="flex-1">
        {children}
      </main>
    </>
  )
}
