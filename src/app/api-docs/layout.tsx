import { Metadata } from 'next'
import AnnouncementBar from '@/components/AnnouncementBar'
import DisclaimerModal from '@/components/DisclaimerModal'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'API Documentation | China Hui B2B',
}

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AnnouncementBar />
      <DisclaimerModal />
      <Navbar locale="en" />
      {children}
    </>
  )
}
