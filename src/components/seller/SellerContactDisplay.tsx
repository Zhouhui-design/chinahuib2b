'use client'

import { useState } from 'react'
import { Phone, Mail, Globe, MessageCircle, MapPin, ExternalLink, Eye } from 'lucide-react'

interface SellerContactInfo {
  companyName: string
  phone?: string
  email?: string
  website?: string
  whatsapp?: string
  wechat?: string
  telegram?: string
  linkedin?: string
  facebook?: string
  instagram?: string
  address?: string
  city?: string
  country?: string
}

export default function SellerContactDisplay({ 
  contactInfo,
  onContactViewed 
}: { 
  contactInfo: SellerContactInfo
  onContactViewed?: () => void
}) {
  const [showFullContact, setShowFullContact] = useState(false)

  const handleViewContact = () => {
    setShowFullContact(true)
    if (onContactViewed) {
      onContactViewed()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        Contact Information
      </h3>

      {/* Company Name */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <p className="text-xl font-bold text-gray-900">{contactInfo.companyName}</p>
        {(contactInfo.city || contactInfo.country) && (
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {[contactInfo.city, contactInfo.country].filter(Boolean).join(', ')}
          </p>
        )}
      </div>

      {/* Primary Contact Methods */}
      <div className="space-y-3">
        {contactInfo.phone && (
          <a
            href={`tel:${contactInfo.phone}`}
            className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <Phone className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            <span className="text-gray-900 font-medium">{contactInfo.phone}</span>
          </a>
        )}

        {contactInfo.email && (
          <a
            href={`mailto:${contactInfo.email}`}
            className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <Mail className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            <span className="text-gray-900 font-medium">{contactInfo.email}</span>
          </a>
        )}

        {contactInfo.website && (
          <a
            href={contactInfo.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <Globe className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            <span className="text-gray-900 font-medium truncate">
              {new URL(contactInfo.website).hostname}
            </span>
            <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
          </a>
        )}
      </div>

      {/* Social Media & Messaging - Collapsible */}
      {!showFullContact ? (
        <button
          onClick={handleViewContact}
          className="mt-4 w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Eye className="w-4 h-4" />
          View Full Contact Info
        </button>
      ) : (
        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Social Media & Messaging</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {contactInfo.whatsapp && (
                <a
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-medium">WhatsApp</span>
                </a>
              )}

              {contactInfo.wechat && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-sm">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-medium">WeChat: {contactInfo.wechat}</span>
                </div>
              )}

              {contactInfo.telegram && (
                <a
                  href={`https://t.me/${contactInfo.telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700 font-medium">Telegram</span>
                </a>
              )}

              {contactInfo.linkedin && (
                <a
                  href={contactInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm"
                >
                  <Globe className="w-4 h-4 text-blue-700" />
                  <span className="text-blue-700 font-medium">LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-blue-400 ml-auto" />
                </a>
              )}

              {contactInfo.facebook && (
                <a
                  href={contactInfo.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm"
                >
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600 font-medium">Facebook</span>
                  <ExternalLink className="w-3 h-3 text-blue-400 ml-auto" />
                </a>
              )}

              {contactInfo.instagram && (
                <a
                  href={contactInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors text-sm"
                >
                  <Globe className="w-4 h-4 text-pink-600" />
                  <span className="text-pink-600 font-medium">Instagram</span>
                  <ExternalLink className="w-3 h-3 text-pink-400 ml-auto" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Address */}
      {contactInfo.address && showFullContact && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Address</h4>
          <p className="text-sm text-gray-600">{contactInfo.address}</p>
        </div>
      )}
    </div>
  )
}
