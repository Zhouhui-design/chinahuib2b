/**
 * SEO title and geography helpers for public product/exhibition pages.
 *
 * Two problems these solve, both found on live x2xhub.com pages in Search Console:
 *
 * 1. Duplicated brand + oversized titles.
 *    Root layout sets `title.template = '%s | SeaHeart Global | 心海环球'`.
 *    Pages that also appended "| SeaHeart Global" themselves produced e.g.
 *    "... Locks Supplier | SeaHeart Global | SeaHeart Global | 心海环球"
 *    at 177 characters. Google renders roughly 60, so the product name was
 *    the only useful part and the repeated brand looked like stuffing.
 *    buildProductTitle() budgets the characters the template leaves and
 *    never emits the brand itself.
 *
 * 2. Chinese place names inside non-Chinese titles.
 *    seller.city / seller.country store whatever the seller typed, usually
 *    Chinese ("中国", "厦门"). Rendering that in an English or German title
 *    mixes scripts, reads as broken to the buyer, and muddies the per-locale
 *    language signal. localizeCountry()/localizeCity() translate the values
 *    we actually have in the database and pass anything else through
 *    unchanged, so an unmapped value degrades to today's behaviour instead
 *    of disappearing.
 */

/**
 * Characters the root layout template appends: " | SeaHeart Global | 心海环球".
 * Google measures rendered pixel width rather than characters and commonly
 * shows 60-70 for Latin text, so the brand suffix is treated as soft overflow:
 * losing it in the SERP is acceptable, losing the product name or its
 * city/category qualifiers is not.
 */
const TEMPLATE_SUFFIX_LENGTH = 0

/**
 * Budget for the page-specific part of the title. Set just under the usual
 * truncation point so the product name plus "- City, Country Category
 * Supplier" survives; the brand tail may be clipped by Google, which is the
 * intended trade-off.
 */
const TARGET_TITLE_LENGTH = 65

/**
 * Country names as sellers enter them, mapped per locale.
 * Keys are lowercased for lookup; only values seen in production are listed.
 */
const COUNTRY_NAMES: Record<string, Record<string, string>> = {
  '中国': {
    en: 'China', de: 'China', fr: 'Chine', es: 'China', pt: 'China',
    ja: '中国', ko: '중국', ru: 'Китай', ar: 'الصين',
    hi: 'चीन', th: 'จีน', vi: 'Trung Quốc', zh: '中国',
  },
  'china': {
    en: 'China', de: 'China', fr: 'Chine', es: 'China', pt: 'China',
    ja: '中国', ko: '중국', ru: 'Китай', ar: 'الصين',
    hi: 'चीन', th: 'จีน', vi: 'Trung Quốc', zh: '中国',
  },
  '中国大陆': {
    en: 'China', de: 'China', fr: 'Chine', es: 'China', pt: 'China',
    ja: '中国', ko: '중국', ru: 'Китай', ar: 'الصين',
    hi: 'चीन', th: 'จีน', vi: 'Trung Quốc', zh: '中国大陆',
  },
  '香港': {
    en: 'Hong Kong', de: 'Hongkong', fr: 'Hong Kong', es: 'Hong Kong',
    pt: 'Hong Kong', ja: '香港', ko: '홍콩', ru: 'Гонконг',
    ar: 'هونغ كونغ', hi: 'हांगकांग', th: 'ฮ่องกง', vi: 'Hồng Kông', zh: '香港',
  },
  '台湾': {
    en: 'Taiwan', de: 'Taiwan', fr: 'Taïwan', es: 'Taiwán', pt: 'Taiwan',
    ja: '台湾', ko: '대만', ru: 'Тайвань', ar: 'تايوان',
    hi: 'ताइवान', th: 'ไต้หวัน', vi: 'Đài Loan', zh: '台湾',
  },
}

/**
 * Chinese manufacturing hubs that appear as seller cities.
 * Latin-script locales share the pinyin spelling, which is the form buyers
 * search for, so they are grouped rather than repeated per language.
 */
const CITY_PINYIN: Record<string, string> = {
  '厦门': 'Xiamen', '深圳': 'Shenzhen', '广州': 'Guangzhou',
  '上海': 'Shanghai', '北京': 'Beijing', '杭州': 'Hangzhou',
  '宁波': 'Ningbo', '义乌': 'Yiwu', '东莞': 'Dongguan',
  '佛山': 'Foshan', '中山': 'Zhongshan', '泉州': 'Quanzhou',
  '温州': 'Wenzhou', '苏州': 'Suzhou', '青岛': 'Qingdao',
  '天津': 'Tianjin', '重庆': 'Chongqing', '成都': 'Chengdu',
  '西安': "Xi'an", '武汉': 'Wuhan', '南京': 'Nanjing',
  '哈尔滨': 'Harbin', '沈阳': 'Shenyang', '大连': 'Dalian',
  '济南': 'Jinan', '长沙': 'Changsha', '福州': 'Fuzhou',
  '无锡': 'Wuxi', '常州': 'Changzhou', '嘉兴': 'Jiaxing',
  '台州': 'Taizhou', '金华': 'Jinhua', '绍兴': 'Shaoxing',
}

/** Locales that read pinyin rather than Han characters. */
const LATIN_LOCALES = new Set(['en', 'de', 'fr', 'es', 'pt', 'vi', 'th', 'hi', 'ru', 'ar'])

/** Translate a seller-entered country for the given locale. */
export function localizeCountry(country: string, locale: string): string {
  if (!country) return ''
  const hit = COUNTRY_NAMES[country.trim().toLowerCase()] || COUNTRY_NAMES[country.trim()]
  // Unmapped values pass through so a new market never renders as blank.
  return hit?.[locale] ?? country
}

/** Translate a seller-entered city for the given locale. */
export function localizeCity(city: string, locale: string): string {
  if (!city) return ''
  if (locale === 'zh' || locale === 'ja' || locale === 'ko') return city
  if (!LATIN_LOCALES.has(locale)) return city
  return CITY_PINYIN[city.trim()] ?? city
}

/**
 * Build a product <title> that survives the root layout template.
 *
 * Priority order when space runs out: product name, then city/country,
 * then the category qualifier. The brand is never added here.
 */
export function buildProductTitle(input: {
  title: string
  city: string
  country: string
  category: string
}): string {
  const budget = TARGET_TITLE_LENGTH - TEMPLATE_SUFFIX_LENGTH
  const name = input.title.trim()

  // A long product name alone can exceed the budget; trim on a word boundary
  // so the result stays readable instead of cutting mid-word.
  if (name.length >= budget) {
    const clipped = name.slice(0, budget)
    const lastSpace = clipped.lastIndexOf(' ')
    return (lastSpace > budget * 0.6 ? clipped.slice(0, lastSpace) : clipped).trim()
  }

  const place = [input.city, input.country].filter(Boolean).join(', ')
  const withPlace = place ? `${name} - ${place}` : name
  if (withPlace.length >= budget) return name

  const withCategory = input.category
    ? `${withPlace} ${input.category} Supplier`
    : withPlace
  return withCategory.length <= budget ? withCategory : withPlace
}

/**
 * Build an exhibition booth <title> under the same brand-free budget.
 *
 * Booth name is the exhibition itself and carries the search intent, so it
 * wins the available characters; the exhibitor company is dropped rather
 * than truncated when both do not fit.
 */
export function buildExhibitionTitle(input: {
  boothName: string
  companyName: string
}): string {
  const budget = TARGET_TITLE_LENGTH - TEMPLATE_SUFFIX_LENGTH
  const name = input.boothName.trim()

  if (name.length >= budget) {
    const clipped = name.slice(0, budget)
    const lastSpace = clipped.lastIndexOf(' ')
    return (lastSpace > budget * 0.6 ? clipped.slice(0, lastSpace) : clipped).trim()
  }

  const company = input.companyName?.trim()
  if (!company) return name

  const combined = `${name} - ${company}`
  return combined.length <= budget ? combined : name
}
