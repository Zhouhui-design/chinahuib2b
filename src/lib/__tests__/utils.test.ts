import { formatPrice, validateEmail, sanitizeInput } from '../utils'

describe('Utility Functions', () => {
  describe('formatPrice', () => {
    it('should format number to USD currency', () => {
      expect(formatPrice(1000)).toBe('$1,000.00')
      expect(formatPrice(99.99)).toBe('$99.99')
      expect(formatPrice(0)).toBe('$0.00')
    })

    it('should handle negative numbers', () => {
      expect(formatPrice(-50)).toBe('-$50.00')
    })

    it('should handle decimals', () => {
      expect(formatPrice(1234.567)).toBe('$1,234.57')
    })
  })

  describe('validateEmail', () => {
    it('should return true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    it('should return false for invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")')
      expect(sanitizeInput('<b>Bold</b> text')).toBe('Bold text')
    })

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello')
    })

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('')
    })
  })
})
