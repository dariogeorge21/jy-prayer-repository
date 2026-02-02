'use client'

import { useState } from 'react'
import { getUserIdentifier } from '@/lib/utils/userIdentity'
import { canSubmitPrayer, recordPrayerSubmit } from '@/lib/utils/rateLimit'

interface SubmitPrayerParams {
  prayerTypeId: string
  rateLimitSeconds?: number
}

interface SubmitPrayerResult {
  success: boolean
  message: string
  newTotal?: number
  secondsToWait?: number
}

export function usePrayerSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({})

  const submitPrayer = async ({
    prayerTypeId,
    rateLimitSeconds = 30,
  }: SubmitPrayerParams): Promise<SubmitPrayerResult> => {
    // Check client-side rate limit first
    const { allowed, secondsRemaining } = canSubmitPrayer(
      prayerTypeId,
      rateLimitSeconds
    )

    if (!allowed) {
      return {
        success: false,
        message: `Please wait ${secondsRemaining} seconds before submitting again`,
        secondsToWait: secondsRemaining,
      }
    }

    setIsSubmitting(true)

    try {
      const userId = getUserIdentifier()

      const response = await fetch('/api/prayer/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prayerTypeId,
          userId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Record successful submission for client-side rate limiting
        recordPrayerSubmit(prayerTypeId, rateLimitSeconds)
        
        // Start cooldown timer
        startCooldown(prayerTypeId, rateLimitSeconds)
      }

      return data
    } catch (error) {
      console.error('Error submitting prayer:', error)
      return {
        success: false,
        message: 'Network error. Please try again.',
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const startCooldown = (prayerTypeId: string, seconds: number) => {
    setCooldowns((prev) => ({ ...prev, [prayerTypeId]: seconds }))

    const interval = setInterval(() => {
      setCooldowns((prev) => {
        const remaining = prev[prayerTypeId]
        
        if (remaining <= 1) {
          clearInterval(interval)
          const { [prayerTypeId]: _, ...rest } = prev
          return rest
        }
        
        return { ...prev, [prayerTypeId]: remaining - 1 }
      })
    }, 1000)
  }

  return {
    submitPrayer,
    isSubmitting,
    cooldowns,
  }
}
