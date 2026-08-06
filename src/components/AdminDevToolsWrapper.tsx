'use client'

import { useEffect, useState } from 'react'
import AdminDevTools from './AdminDevTools'
import { isAdminEmail } from './AdminDevTools'

export default function AdminDevToolsWrapper({ buildId }: { buildId?: string }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        const email = data?.user?.email || null
        setUserEmail(email)
        setIsAdmin(isAdminEmail(email))
      })
      .catch(() => {
        setUserEmail(null)
        setIsAdmin(false)
      })
  }, [])

  return <AdminDevTools isAdmin={isAdmin} userEmail={userEmail} buildId={buildId} />
}
