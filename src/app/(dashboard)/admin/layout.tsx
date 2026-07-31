import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminDashboardClientLayout from './AdminDashboardClientLayout'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session || !session.user) {
    redirect('/admin/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/admin/login?error=access_denied')
  }

  return (
    <AdminDashboardClientLayout>
      {children}
    </AdminDashboardClientLayout>
  )
}
