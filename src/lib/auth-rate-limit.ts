import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 300
const WHITELISTED_IPS = process.env.ADMIN_IP_WHITELIST?.split(',')?.map(ip => ip.trim()) || []

export async function checkLoginAttempts(email: string, ip: string): Promise<{ allowed: boolean; remainingAttempts: number }> {
  if (WHITELISTED_IPS.length > 0 && !WHITELISTED_IPS.includes(ip)) {
    console.warn(`🔒 Login attempt from non-whitelisted IP: ${ip}`)
    return { allowed: false, remainingAttempts: 0 }
  }

  const key = `login:attempts:${email}`
  const lockoutKey = `login:lockout:${email}`

  const isLocked = await redis.get(lockoutKey)
  if (isLocked) {
    return { allowed: false, remainingAttempts: 0 }
  }

  const attempts = await redis.get(key)
  const currentAttempts = attempts ? parseInt(attempts, 10) : 0

  if (currentAttempts >= MAX_LOGIN_ATTEMPTS) {
    await redis.set(lockoutKey, '1', 'EX', LOCKOUT_DURATION)
    await redis.del(key)
    return { allowed: false, remainingAttempts: 0 }
  }

  return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - currentAttempts }
}

export async function incrementLoginAttempt(email: string): Promise<void> {
  const key = `login:attempts:${email}`
  await redis.incr(key)
  await redis.expire(key, LOCKOUT_DURATION)
}

export async function resetLoginAttempts(email: string): Promise<void> {
  const key = `login:attempts:${email}`
  const lockoutKey = `login:lockout:${email}`
  await redis.del(key)
  await redis.del(lockoutKey)
}

export async function isAdminIPWhitelisted(ip: string): Promise<boolean> {
  if (WHITELISTED_IPS.length === 0) {
    return true
  }
  return WHITELISTED_IPS.includes(ip)
}