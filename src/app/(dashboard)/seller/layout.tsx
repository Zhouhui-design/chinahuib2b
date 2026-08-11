import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import SellerDashboardClientLayout from './SellerDashboardClientLayout'
import { signOutAction } from './actions'
import { SessionProvider } from '@/components/providers/SessionProvider'

export default async function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    const cookieStore = await cookies()
    const language = cookieStore.get('language')?.value || 'en'
    redirect(`/${language}/auth/login`)
  }

  const cookieStore = await cookies()
  const currentLanguage = cookieStore.get('language')?.value || 'en'

  return (
    <SessionProvider session={session}>
      <SellerDashboardClientLayout currentLanguage={currentLanguage} onSignOut={signOutAction}>
        {children}
      </SellerDashboardClientLayout>
    </SessionProvider>
  )
}
