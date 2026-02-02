/**
 * Client-Side Rate Limiting
 * Manages cooldown periods for prayer submissions
 */

interface RateLimitEntry {
  prayerTypeId: string
  lastSubmitTime: number
  cooldownSeconds: number
}

const RATE_LIMIT_KEY = 'vitanova_rate_limits'

/**
 * Check if user can submit for a specific prayer type
 */
export function canSubmitPrayer(
  prayerTypeId: string,
  cooldownSeconds: number = 30
): { allowed: boolean; secondsRemaining: number } {
  if (typeof window === 'undefined') {
    return { allowed: false, secondsRemaining: 0 }
  }

  try {
    const rateLimits = getRateLimits()
    const entry = rateLimits[prayerTypeId]

    if (!entry) {
      return { allowed: true, secondsRemaining: 0 }
    }

    const now = Date.now()
    const elapsed = Math.floor((now - entry.lastSubmitTime) / 1000)
    const remaining = Math.max(0, cooldownSeconds - elapsed)

    return {
      allowed: remaining === 0,
      secondsRemaining: remaining,
    }
  } catch (error) {
    console.error('Error checking rate limit:', error)
    return { allowed: false, secondsRemaining: 0 }
  }
}

/**
 * Record a prayer submission
 */
export function recordPrayerSubmit(
  prayerTypeId: string,
  cooldownSeconds: number = 30
): void {
  if (typeof window === 'undefined') return

  try {
    const rateLimits = getRateLimits()
    
    rateLimits[prayerTypeId] = {
      prayerTypeId,
      lastSubmitTime: Date.now(),
      cooldownSeconds,
    }

    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(rateLimits))
  } catch (error) {
    console.error('Error recording prayer submit:', error)
  }
}

/**
 * Get all rate limit entries
 */
function getRateLimits(): Record<string, RateLimitEntry> {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error retrieving rate limits:', error)
    return {}
  }
}

/**
 * Clear rate limits (for testing)
 */
export function clearRateLimits(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(RATE_LIMIT_KEY)
  } catch (error) {
    console.error('Error clearing rate limits:', error)
  }
}

/**
 * Clean up old rate limit entries (older than 1 hour)
 */
export function cleanupRateLimits(): void {
  if (typeof window === 'undefined') return

  try {
    const rateLimits = getRateLimits()
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    const cleaned = Object.fromEntries(
      Object.entries(rateLimits).filter(
        ([_, entry]) => now - entry.lastSubmitTime < oneHour
      )
    )

    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(cleaned))
  } catch (error) {
    console.error('Error cleaning up rate limits:', error)
  }
}

// Run cleanup on module load
if (typeof window !== 'undefined') {
  cleanupRateLimits()
}
