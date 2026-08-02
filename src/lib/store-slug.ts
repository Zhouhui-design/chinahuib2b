/**
 * Store slug utility functions
 *
 * Enables GitHub-style store URLs: x2xhub.com/<storeSlug>
 *
 * Rules:
 * - 1-39 characters
 * - Only lowercase letters, digits, and hyphens
 * - Must start and end with a letter or digit
 * - No consecutive hyphens
 * - Must not be a reserved word (locales + top-level routes)
 */

import { languages } from './languages'

// Locale codes are reserved (cannot be used as slugs)
const LOCALE_CODES = new Set(languages.map(l => l.code))

// Top-level application routes & system paths that must never be treated as slugs
const RESERVED_ROUTES = new Set([
  // App routes
  'admin', 'ai-audit', 'ai-register', 'api', 'api-docs', 'api-keys',
  'auction', 'auth', 'blog', 'booths', 'buyer', 'categories', 'chat',
  'exhibitions', 'marketplace', 'profile', 'seller', 'store', 'stores',
  'team-chat', 'products', 'reviews', 'notices', 'register',
  'service-worker', 'sw', 'pwasw', 'pwa', 'uploads', 'health',
  'maintenance', 'debug', 'diagnostic', 'docs', 'geo', 'mcp',
  'recommendations', 'payment-proof', 'brochures', 'public',
  'cache-clear', 'openapi', 'llms', 'llms-full',
  // Common reserved subdomains / system names
  'www', 'mail', 'ftp', 'localhost', 'admin', 'root', 'api',
  'support', 'help', 'about', 'contact', 'privacy', 'terms',
  'login', 'logout', 'signup', 'settings', 'dashboard',
  'search', 'sitemap', 'robots', 'manifest', 'favicon',
  // Reserved file names
  'robots.txt', 'sitemap.xml', 'manifest.json', 'llms.txt',
])

/**
 * Complete set of reserved slugs (locales + routes)
 */
export const RESERVED_SLUGS = new Set<string>([...LOCALE_CODES, ...RESERVED_ROUTES])

/**
 * Regex for a valid slug format (without reserved-word check)
 * - 1-39 chars total
 * - starts/ends with alphanumeric
 * - middle allows hyphens
 * - no consecutive hyphens
 */
const SLUG_REGEX = /^(?=.{1,39}$)[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9]))*[a-z0-9]$|^[a-z0-9]$/

/**
 * Validate whether a slug string is acceptable.
 * Checks format + reserved words.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false
  const normalized = slug.trim().toLowerCase()
  if (normalized.length < 1 || normalized.length > 39) return false
  if (!SLUG_REGEX.test(normalized)) return false
  if (RESERVED_SLUGS.has(normalized)) return false
  // Reject pure numeric slugs (avoid confusion with cuid IDs)
  if (/^\d+$/.test(normalized)) return false
  return true
}

/**
 * Normalize a raw string into a slug candidate.
 * - Lowercase
 * - Replace whitespace & underscores with hyphens
 * - Collapse consecutive hyphens
 * - Strip leading/trailing hyphens
 * - Remove disallowed characters
 * - Truncate to 39 chars at a hyphen boundary
 */
export function normalizeSlug(raw: string): string {
  if (!raw || typeof raw !== 'string') return ''
  let s = raw.trim().toLowerCase()
  // Replace spaces / underscores with hyphens
  s = s.replace(/[\s_]+/g, '-')
  // Remove characters that are not a-z, 0-9, or hyphen
  s = s.replace(/[^a-z0-9-]/g, '')
  // Collapse consecutive hyphens
  s = s.replace(/-{2,}/g, '-')
  // Strip leading/trailing hyphens
  s = s.replace(/^-+|-+$/g, '')
  // Truncate to 39 chars without breaking at a hyphen
  if (s.length > 39) {
    s = s.slice(0, 39)
    // Remove trailing hyphen if truncation created one
    s = s.replace(/-+$/, '')
  }
  return s
}

/**
 * Derive a slug from a username.
 * - If username is pure ASCII → normalize it
 * - If username contains non-ASCII (e.g. Chinese) → generate `store-<random8>`
 *   (avoids pulling in a heavy pinyin library; user can customize once)
 */
export function deriveSlugFromUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    return generateRandomSlug()
  }
  // Check if username contains any non-ASCII characters
  const hasNonAscii = /[^\x00-\x7F]/.test(username)
  if (hasNonAscii) {
    return generateRandomSlug()
  }
  const normalized = normalizeSlug(username)
  if (!normalized || !SLUG_REGEX.test(normalized)) {
    return generateRandomSlug()
  }
  return normalized
}

/**
 * Generate a random slug: `store-<8 alphanumeric chars>`
 */
export function generateRandomSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let suffix = ''
  for (let i = 0; i < 8; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }
  return `store-${suffix}`
}

/**
 * Ensure uniqueness of a slug by appending `-2`, `-3`, ... when needed.
 *
 * @param base  the desired slug
 * @param existsFn  async function returning true if slug is already taken
 * @returns a unique slug (may equal base if available)
 */
export async function generateUniqueSlug(
  base: string,
  existsFn: (slug: string) => Promise<boolean>,
): Promise<string> {
  // Make sure base itself is valid format
  let candidate = isValidSlug(base) ? base : generateRandomSlug()
  if (!(await existsFn(candidate))) {
    return candidate
  }
  // Try -2, -3, ... up to -99, then fall back to random suffix
  for (let i = 2; i <= 99; i++) {
    const suffix = `-${i}`
    // Truncate base so total length stays <= 39
    const maxBaseLen = 39 - suffix.length
    candidate = (base.slice(0, maxBaseLen).replace(/-+$/, '')) + suffix
    if (!(await existsFn(candidate))) {
      return candidate
    }
  }
  // Fallback: append random suffix
  candidate = `${base.slice(0, 30).replace(/-+$/, '')}-${Math.random().toString(36).slice(2, 8)}`
  return candidate
}

/**
 * Synchronous uniqueness variant used in backfill scripts where we hold
 * an in-memory Set of already-used slugs.
 */
export function generateUniqueSlugSync(
  base: string,
  existsFn: (slug: string) => boolean,
): string {
  let candidate = isValidSlug(base) ? base : generateRandomSlug()
  if (!existsFn(candidate)) {
    return candidate
  }
  for (let i = 2; i <= 99; i++) {
    const suffix = `-${i}`
    const maxBaseLen = 39 - suffix.length
    candidate = (base.slice(0, maxBaseLen).replace(/-+$/, '')) + suffix
    if (!existsFn(candidate)) {
      return candidate
    }
  }
  candidate = `${base.slice(0, 30).replace(/-+$/, '')}-${Math.random().toString(36).slice(2, 8)}`
  return candidate
}

/**
 * Build a store URL path from a seller object.
 * Prefers the clean slug URL (/<slug>); falls back to the legacy /stores/<id>
 * URL (which 308-redirects to the slug) when storeSlug is missing.
 *
 * Usage:  href={storeUrl(seller)}
 */
export function storeUrl(seller: { storeSlug?: string | null; id: string }): string {
  if (seller.storeSlug) {
    return `/${seller.storeSlug}`
  }
  return `/stores/${seller.id}`
}

