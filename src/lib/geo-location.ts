export interface GeoLocation {
  ip: string
  country: string
  countryCode: string
  region: string
  city: string
  latitude: number
  longitude: number
  timezone: string
}

export interface CountryInfo {
  code: string
  name: string
  nameZh: string
  nameEn: string
  flag: string
}

export const COUNTRIES: CountryInfo[] = [
  { code: 'CN', name: 'China', nameZh: '中国', nameEn: 'China', flag: '🇨🇳' },
  { code: 'US', name: 'United States', nameZh: '美国', nameEn: 'United States', flag: '🇺🇸' },
  { code: 'JP', name: 'Japan', nameZh: '日本', nameEn: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', nameZh: '韩国', nameEn: 'South Korea', flag: '🇰🇷' },
  { code: 'DE', name: 'Germany', nameZh: '德国', nameEn: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', nameZh: '法国', nameEn: 'France', flag: '🇫🇷' },
  { code: 'UK', name: 'United Kingdom', nameZh: '英国', nameEn: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', nameZh: '加拿大', nameEn: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', nameZh: '澳大利亚', nameEn: 'Australia', flag: '🇦🇺' },
  { code: 'SG', name: 'Singapore', nameZh: '新加坡', nameEn: 'Singapore', flag: '🇸🇬' },
  { code: 'HK', name: 'Hong Kong', nameZh: '香港', nameEn: 'Hong Kong', flag: '🇭🇰' },
  { code: 'TW', name: 'Taiwan', nameZh: '台湾', nameEn: 'Taiwan', flag: '🇹🇼' },
  { code: 'MY', name: 'Malaysia', nameZh: '马来西亚', nameEn: 'Malaysia', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', nameZh: '泰国', nameEn: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', nameZh: '越南', nameEn: 'Vietnam', flag: '🇻🇳' },
  { code: 'IN', name: 'India', nameZh: '印度', nameEn: 'India', flag: '🇮🇳' },
  { code: 'RU', name: 'Russia', nameZh: '俄罗斯', nameEn: 'Russia', flag: '🇷🇺' },
  { code: 'BR', name: 'Brazil', nameZh: '巴西', nameEn: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', nameZh: '墨西哥', nameEn: 'Mexico', flag: '🇲🇽' },
  { code: 'ES', name: 'Spain', nameZh: '西班牙', nameEn: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', nameZh: '意大利', nameEn: 'Italy', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', nameZh: '荷兰', nameEn: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', nameZh: '比利时', nameEn: 'Belgium', flag: '🇧🇪' },
  { code: 'AU', name: 'Austria', nameZh: '奥地利', nameEn: 'Austria', flag: '🇦🇹' },
  { code: 'CH', name: 'Switzerland', nameZh: '瑞士', nameEn: 'Switzerland', flag: '🇨🇭' },
  { code: 'SE', name: 'Sweden', nameZh: '瑞典', nameEn: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', nameZh: '挪威', nameEn: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', nameZh: '丹麦', nameEn: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', nameZh: '芬兰', nameEn: 'Finland', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', nameZh: '波兰', nameEn: 'Poland', flag: '🇵🇱' },
]

export function getCountryByCode(code: string): CountryInfo | undefined {
  return COUNTRIES.find(c => c.code.toLowerCase() === code.toLowerCase())
}

export function getCountryName(code: string, lang: string = 'en'): string {
  const country = getCountryByCode(code)
  if (!country) return code
  switch (lang) {
    case 'zh':
      return country.nameZh
    case 'ja':
      return country.name
    case 'ko':
      return country.name
    case 'de':
      return country.nameEn
    case 'fr':
      return country.nameEn
    case 'es':
      return country.nameEn
    default:
      return country.nameEn
  }
}

export function getCountryFlag(code: string): string {
  const country = getCountryByCode(code)
  return country?.flag || '🌍'
}

export async function getClientLocation(ip?: string): Promise<GeoLocation | null> {
  try {
    const url = ip 
      ? `https://ipapi.co/${ip}/json/`
      : 'https://ipapi.co/json/'
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.error || !data.country_code) {
      return null
    }
    
    return {
      ip: data.ip || '',
      country: data.country_name || '',
      countryCode: data.country_code || '',
      region: data.region || '',
      city: data.city || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.timezone || '',
    }
  } catch (error) {
    console.error('Error getting client location:', error)
    return null
  }
}

export async function getServerLocation(request: Request): Promise<GeoLocation | null> {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  const ip = forwardedFor?.split(',')[0].trim() || realIp
  
  if (!ip || ip === '::1' || ip === '127.0.0.1') {
    return null
  }
  
  return getClientLocation(ip)
}