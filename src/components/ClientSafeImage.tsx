'use client'

import SafeImage, { type SafeImageProps } from '@/components/SafeImage'

// Re-export a client-bound wrapper so server pages (e.g. stores/[id]/page.tsx)
// can use it via dynamic import pattern. This avoids the "importing client from server"
// Next.js restriction while still being a single import from server pages.
export default function ClientSafeImage(props: SafeImageProps) {
  return <SafeImage {...props} />
}

export { SafeImage }
