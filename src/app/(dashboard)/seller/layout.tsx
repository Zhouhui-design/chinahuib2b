import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import SellerDashboardClientLayout from './SellerDashboardClientLayout'

export default async function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    // Get language from cookie or use default 'en'
    const cookieStore = await cookies()
    const language = cookieStore.get('language')?.value || 'en'
    redirect(`/${language}/auth/login`)
  }
  
  // Get current language from cookie for LanguageSwitcher
  const cookieStore = await cookies()
  const currentLanguage = cookieStore.get('language')?.value || 'en'
  
  return (
    <SellerDashboardClientLayout currentLanguage={currentLanguage}>
      {children}
    </SellerDashboardClientLayout>
  )
}
