'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/ui/FileUpload'
import { Save, Building2, MapPin, Phone, Mail, MessageCircle, CheckCircle, Loader2 } from 'lucide-react'

export default function StoreProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [certifications, setCertifications] = useState<string>('')
  
  // Booth customization
  const [boothName, setBoothName] = useState('')
  const [boothCategories, setBoothCategories] = useState<string>('')
  const [isCustomizable, setIsCustomizable] = useState(false)

  // Country list
  const countries = [
    'China', 'United States', 'Germany', 'Japan', 'United Kingdom', 'France', 
    'Italy', 'Canada', 'Australia', 'India', 'Brazil', 'Mexico', 'Spain', 
    'Netherlands', 'South Korea', 'Singapore', 'Vietnam', 'Thailand', 
    'Malaysia', 'Indonesia', 'Turkey', 'Russia', 'Other'
  ]

  // Load existing profile
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/seller/profile')
      
      if (!response.ok) {
        throw new Error('Failed to load profile')
      }
      
      const data = await response.json()
      const profile = data.profile
      
      // Pre-fill form
      setCompanyName(profile.companyName || '')
      setDescription(profile.description || '')
      setCountry(profile.country || '')
      setCity(profile.city || '')
      setAddress(profile.address || '')
      setPhone(profile.phone || '')
      setEmail(profile.email || '')
      setWebsite(profile.website || '')
      setLogoUrl(profile.logoUrl || '')
      setBannerUrl(profile.bannerUrl || '')
      setCertifications(profile.certifications?.join(', ') || '')
      setBoothName(profile.boothName || '')
      setBoothCategories(profile.boothCategories?.join(', ') || '')
      setIsCustomizable(profile.isCustomizable || false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = (data: any) => {
    const url = Array.isArray(data) ? data[0]?.url : data.url
    if (url) setLogoUrl(url)
  }

  const handleBannerUpload = (data: any) => {
    const url = Array.isArray(data) ? data[0]?.url : data.url
    if (url) setBannerUrl(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!companyName.trim()) {
      setError('Company name is required')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Convert certifications string to array
      const certsArray = certifications
        .split(',')
        .map(cert => cert.trim())
        .filter(cert => cert.length > 0)

      const payload = {
        companyName: companyName.trim(),
        description: description.trim(),
        country: country.trim(),
        city: city.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        website: website.trim(),
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
        certifications: certsArray.length > 0 ? certsArray : null,
        boothName: boothName.trim() || null,
        boothCategories: boothCategories.split(',').map(c => c.trim()).filter(c => c),
        isCustomizable: isCustomizable,
      }

      const response = await fetch('/api/seller/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Profile</h1>
        <p className="text-sm text-gray-600 mt-1">
          Update your company information to attract more buyers
        </p>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800">Profile saved successfully!</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-500" />
            Company Information
          </h2>
          
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., XYZ Technology Co., Ltd."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your company history, core products, production capacity, certifications..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certifications (comma-separated)
            </label>
            <input
              type="text"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              placeholder="e.g., ISO9001, CE, FDA, RoHS"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple certifications with commas</p>
          </div>
        </div>

        {/* Logo & Banner */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Brand Images</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo
              </label>
              <FileUpload
                type="logo"
                onUploadSuccess={handleLogoUpload}
              />
              {logoUrl && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Current Logo:</p>
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="w-24 h-24 object-contain border rounded-lg p-2 bg-white"
                  />
                </div>
              )}
            </div>

            {/* Banner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Banner (Header Image)
              </label>
              <FileUpload
                type="banner"
                onUploadSuccess={handleBannerUpload}
              />
              {bannerUrl && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Current Banner:</p>
                  <img
                    src={bannerUrl}
                    alt="Banner preview"
                    className="w-full h-24 object-cover border rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            Location
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Shenzhen"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address, district, postal code"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-gray-500" />
            Contact Information (Visible to logged-in users only)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+86 123 4567 8900"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Booth Customization */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-500" />
            Exhibition Booth Customization
          </h2>
          
          {/* Booth Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booth Name (展位名称)
            </label>
            <input
              type="text"
              value={boothName}
              onChange={(e) => setBoothName(e.target.value)}
              placeholder="e.g., Premium Electronics Booth, Luxury Furniture Showcase"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Custom name displayed on your exhibition booth</p>
          </div>

          {/* Product Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Categories (产品类别 - 可多选)
            </label>
            <input
              type="text"
              value={boothCategories}
              onChange={(e) => setBoothCategories(e.target.value)}
              placeholder="e.g., Electronics, Home Appliances, Kitchen Supplies (comma separated)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Enter multiple categories separated by commas</p>
          </div>

          {/* Customization Option */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCustomizable}
                onChange={(e) => setIsCustomizable(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Customization Available (定制：是/否)
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">Check if you offer product customization services</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
