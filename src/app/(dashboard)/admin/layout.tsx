import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminDashboardClientLayout from './AdminDashboardClientLayout'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/login')
  }

  if (session.user?.role !== 'ADMIN') {
    redirect('/')
  }

  const signOutAction = async () => {
    window.location.href = '/api/auth/signout?callbackUrl=/'
  }

  return (
    <AdminDashboardClientLayout onSignOut={signOutAction}>
      {children}
    </AdminDashboardClientLayout>
  )
}
