'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ChatWidget from './ChatWidget'
import { MessageCircle } from 'lucide-react'

interface ChatButtonProps {
  sellerId: string
  productId?: string
}

export default function ChatButton({ sellerId, productId }: ChatButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleClick = () => {
    if (!session) {
      // Redirect to login with callback
      const callbackUrl = window.location.pathname
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
      return
    }

    // Open chat widget
    setIsChatOpen(true)
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <MessageCircle className="w-5 h-5 mr-2" />
        {session ? 'Contact Exhibitor via Chat' : 'Login to Chat'}
      </button>

      {isChatOpen && session && (
        <ChatWidget
          sellerId={sellerId}
          productId={productId}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  )
}
