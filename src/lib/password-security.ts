/**
 * Password Breach Detection Service
 * Uses Have I Been Pwned API with k-Anonymity
 * https://haveibeenpwned.com/API/v3#SearchingPwnedPasswords
 */

import { createHash } from 'crypto'

const HIBP_API_URL = 'https://api.pwnedpasswords.com/range/'

export interface BreachCheckResult {
  isBreached: boolean
  count: number
  message: string
}

/**
 * Check if a password has been exposed in data breaches
 * Uses k-Anonymity to protect the full password
 *
 * @param password - The password to check
 * @returns BreachCheckResult with breach status and count
 */
export async function checkPasswordBreach(password: string): Promise<BreachCheckResult> {
  try {
    const sha1Hash = createHash('sha1').update(password).digest('hex').toUpperCase()
    const prefix = sha1Hash.slice(0, 5)
    const suffix = sha1Hash.slice(5)

    const response = await fetch(`${HIBP_API_URL}${prefix}`, {
      headers: {
        'User-Agent': 'ChinaHuiB2B-Security',
        'Add-Padding': 'true',
      },
    })

    if (!response.ok) {
      console.error(`HIBP API error: ${response.status}`)
      return {
        isBreached: false,
        count: 0,
        message: 'Unable to verify password security'
      }
    }

    const text = await response.text()
    const lines = text.split('\n')

    for (const line of lines) {
      const [hashSuffix = '', count = '0'] = line.split(':')
      if (hashSuffix.trim() === suffix) {
        const breachCount = parseInt(count.trim(), 10)
        return {
          isBreached: true,
          count: breachCount,
          message: `This password has been exposed in ${breachCount.toLocaleString()} data breaches. Please choose a different password.`
        }
      }
    }

    return {
      isBreached: false,
      count: 0,
      message: 'Password has not been found in known data breaches'
    }

  } catch (error) {
    console.error('Password breach check error:', error)
    return {
      isBreached: false,
      count: 0,
      message: 'Unable to verify password security'
    }
  }
}

/**
 * Get password strength score (0-100)
 */
export function getPasswordStrength(password: string): { score: number; level: string; feedback: string[] } {
  let score = 0
  const feedback: string[] = []

  if (password.length >= 8) score += 20
  else feedback.push('Use at least 8 characters')

  if (password.length >= 12) score += 10

  if (/[a-z]/.test(password)) score += 15
  else feedback.push('Add lowercase letters')

  if (/[A-Z]/.test(password)) score += 15
  else feedback.push('Add uppercase letters')

  if (/[0-9]/.test(password)) score += 15
  else feedback.push('Add numbers')

  if (/[^a-zA-Z0-9]/.test(password)) score += 25
  else feedback.push('Add special characters')

  let level = 'Weak'
  if (score >= 80) level = 'Strong'
  else if (score >= 60) level = 'Good'
  else if (score >= 40) level = 'Fair'

  return { score: Math.min(score, 100), level, feedback }
}
