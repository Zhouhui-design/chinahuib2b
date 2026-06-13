import { Suspense } from 'react'
import AIRegisterClient from './client'

export default function AIRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>}>
      <AIRegisterClient />
    </Suspense>
  )
}
