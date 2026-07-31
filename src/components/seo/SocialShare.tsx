import { Share2, MessageCircle, Send, Mail, Link } from 'lucide-react'
import { generateSocialShareLinks } from '@/lib/seo-utils'

interface SocialShareProps {
  url: string
  title: string
  description?: string
  imageUrl?: string
}

const SOCIAL_PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', icon: Link, color: 'bg-blue-700 hover:bg-blue-800' },
  { id: 'twitter', label: 'Twitter', icon: Send, color: 'bg-sky-500 hover:bg-sky-600' },
  { id: 'facebook', label: 'Facebook', icon: MessageCircle, color: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'pinterest', label: 'Pinterest', icon: Share2, color: 'bg-red-600 hover:bg-red-700' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'bg-green-600 hover:bg-green-700' },
  { id: 'telegram', label: 'Telegram', icon: Send, color: 'bg-blue-400 hover:bg-blue-500' },
  { id: 'email', label: 'Email', icon: Mail, color: 'bg-gray-600 hover:bg-gray-700' },
]

export function SocialShare({ url, title, description, imageUrl }: SocialShareProps) {
  const links = generateSocialShareLinks(url, title, description, imageUrl)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-600 mr-2">
        <Share2 className="w-4 h-4 inline mr-1" />
        Share:
      </span>
      {SOCIAL_PLATFORMS.map((platform) => (
        <a
          key={platform.id}
          href={links[platform.id]}
          target="_blank"
          rel="noopener noreferrer"
          className={`${platform.color} text-white p-2 rounded-lg transition-all duration-200 flex items-center justify-center w-9 h-9`}
          title={platform.label}
          aria-label={`Share on ${platform.label}`}
        >
          <platform.icon className="w-4 h-4" />
        </a>
      ))}
    </div>
  )
}
