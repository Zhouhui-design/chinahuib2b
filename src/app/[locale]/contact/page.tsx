'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { loadTranslations } from '@/i18n/lazyTranslations'
import type { Language } from '@/i18n/translations'
import { Phone, Mail, MapPin, Clock, Globe, Building2, MessageCircle, Send } from 'lucide-react'

interface RegionalOffice {
  region: string
  country: string
  flag: string
  city: string
  address: string
  phone: string
  email: string
  timezone: string
  hours: string
}

const regionalOffices: RegionalOffice[] = [
  {
    region: 'US',
    country: 'United States',
    flag: '🇺🇸',
    city: 'San Francisco',
    address: '1600 Amphitheatre Parkway, Mountain View, CA 94043',
    phone: '+1 (415) 555-1234',
    email: 'us@x2xhub.com',
    timezone: 'UTC-8 / UTC-7',
    hours: 'Mon-Fri: 9:00 AM - 6:00 PM PST',
  },
  {
    region: 'FR',
    country: 'France',
    flag: '🇫🇷',
    city: 'Paris',
    address: '16 Rue de la Paix, 75002 Paris',
    phone: '+33 1 42 56 78 90',
    email: 'fr@x2xhub.com',
    timezone: 'UTC+1 / UTC+2',
    hours: 'Lun-Ven: 9h00 - 18h00 CET',
  },
  {
    region: 'DE',
    country: 'Germany',
    flag: '🇩🇪',
    city: 'Berlin',
    address: 'Friedrichstraße 100, 10117 Berlin',
    phone: '+49 30 1234 5678',
    email: 'de@x2xhub.com',
    timezone: 'UTC+1 / UTC+2',
    hours: 'Mo-Fr: 9:00 - 18:00 CET',
  },
  {
    region: 'UK',
    country: 'United Kingdom',
    flag: '🇬🇧',
    city: 'London',
    address: '20 Fenchurch Street, London EC3M 3BY',
    phone: '+44 20 7123 4567',
    email: 'uk@x2xhub.com',
    timezone: 'UTC / UTC+1',
    hours: 'Mon-Fri: 9:00 AM - 6:00 PM GMT',
  },
  {
    region: 'JP',
    country: 'Japan',
    flag: '🇯🇵',
    city: 'Tokyo',
    address: '〒100-0005 東京都千代田区丸の内1-6-1',
    phone: '+81 3 1234 5678',
    email: 'jp@x2xhub.com',
    timezone: 'UTC+9',
    hours: '月-金: 9:00 - 18:00 JST',
  },
  {
    region: 'KR',
    country: 'South Korea',
    flag: '🇰🇷',
    city: 'Seoul',
    address: '서울특별시 강남구 테헤란로 100',
    phone: '+82 2 1234 5678',
    email: 'kr@x2xhub.com',
    timezone: 'UTC+9',
    hours: '월-금: 9:00 - 18:00 KST',
  },
  {
    region: 'AU',
    country: 'Australia',
    flag: '🇦🇺',
    city: 'Sydney',
    address: '100 George Street, Sydney NSW 2000',
    phone: '+61 2 1234 5678',
    email: 'au@x2xhub.com',
    timezone: 'UTC+10 / UTC+11',
    hours: 'Mon-Fri: 9:00 AM - 6:00 PM AEST',
  },
]

export default function ContactPage() {
  const params = useParams()
  const locale = (params.locale as Language) || 'en'
  
  const [translations, setTranslations] = useState<typeof import('@/i18n/translations').translations['en'] | null>(null)
  const [loadingTranslations, setLoadingTranslations] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<string>('US')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    region: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    const fetchTranslations = async () => {
      const dict = await loadTranslations(locale)
      setTranslations(dict)
      setLoadingTranslations(false)
    }
    fetchTranslations()
  }, [locale])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setSubmitSuccess(true)
    setFormData({ name: '', email: '', company: '', phone: '', region: '', message: '' })
    
    setTimeout(() => setSubmitSuccess(false), 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (loadingTranslations || !translations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  const t = translations.contact || {
    title: 'Contact Us',
    subtitle: 'Get in touch with our team',
    contactUs: 'Contact Us',
    regionalOffices: 'Regional Offices',
    selectRegion: 'Select Region',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    timezone: 'Timezone',
    hours: 'Business Hours',
    sendMessage: 'Send Message',
    name: 'Name',
    company: 'Company',
    region: 'Region',
    message: 'Message',
    submit: 'Submit',
    success: 'Thank you! Your message has been sent successfully.',
    placeholderName: 'Enter your name',
    placeholderEmail: 'Enter your email',
    placeholderCompany: 'Enter your company name',
    placeholderPhone: 'Enter your phone number',
    placeholderMessage: 'Enter your message...',
  }

  const selectedOffice = regionalOffices.find(o => o.region === selectedRegion)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Building2 className="w-6 h-6 mr-3 text-blue-600" />
                {t.regionalOffices}
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.selectRegion}</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {regionalOffices.map(office => (
                    <option key={office.region} value={office.region}>
                      {office.flag} {office.country} - {office.city}
                    </option>
                  ))}
                </select>
              </div>

              {selectedOffice && (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{t.address}</div>
                      <div className="text-gray-600">{selectedOffice.city}, {selectedOffice.country}</div>
                      <div className="text-gray-500 text-sm">{selectedOffice.address}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{t.phone}</div>
                      <div className="text-gray-600">{selectedOffice.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{t.email}</div>
                      <div className="text-gray-600">{selectedOffice.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{t.timezone}</div>
                      <div className="text-gray-600">{selectedOffice.timezone}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Globe className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{t.hours}</div>
                      <div className="text-gray-600">{selectedOffice.hours}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <MessageCircle className="w-6 h-6 mr-3 text-blue-600" />
              {t.sendMessage}
            </h2>

            {submitSuccess ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg flex items-center">
                <Send className="w-6 h-6 mr-3" />
                {t.success}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.name}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t.placeholderName}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t.placeholderEmail}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.company}</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder={t.placeholderCompany}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.phone}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t.placeholderPhone}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.region}</label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select your region</option>
                    {regionalOffices.map(office => (
                      <option key={office.region} value={office.region}>
                        {office.flag} {office.country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.message}</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t.placeholderMessage}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Sending...' : t.submit}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Global Network</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {regionalOffices.map(office => (
              <div key={office.region} className="text-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => setSelectedRegion(office.region)}>
                <div className="text-3xl mb-2">{office.flag}</div>
                <div className="font-medium text-gray-900 text-sm">{office.country}</div>
                <div className="text-gray-500 text-xs">{office.city}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}