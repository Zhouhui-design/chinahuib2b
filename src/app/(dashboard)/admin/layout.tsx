import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/login')
  }

  // Check if user is admin
  if (session.user?.role !== 'ADMIN') {
    redirect('/')
  }

  return <>{children}</>
}
