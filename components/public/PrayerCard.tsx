'use client'

import { useState } from 'react'
import type { PrayerWithCounter } from '@/lib/hooks/usePrayerCounters'
import { usePrayerSubmit } from '@/lib/hooks/usePrayerSubmit'
import { formatNumber, formatDuration } from '@/lib/utils/formatting'

interface PrayerCardProps {
  prayer: PrayerWithCounter
}

export function PrayerCard({ prayer }: PrayerCardProps) {
  const { submitPrayer, isSubmitting, cooldowns } = usePrayerSubmit()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const prayerType = prayer as PrayerWithCounter
  const cooldownSeconds = cooldowns[prayerType.id] || 0
  const isOnCooldown = cooldownSeconds > 0

  const currentValue = prayerType.type === 'count' 
    ? prayerType.counter?.total_count || 0
    : prayerType.counter?.total_time_minutes || 0

  const handleIncrement = async () => {
    setMessage(null)
    
    const result = await submitPrayer({
      prayerTypeId: prayerType.id,
      rateLimitSeconds: parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_SECONDS || '30'),
    })

    if (result.success) {
      setMessage({ type: 'success', text: 'Prayer recorded! Thank you.' })
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage({ type: 'error', text: result.message })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  return (
    <div className="prayer-card group">
      {/* Icon */}
      {prayerType.icon && (
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {prayerType.icon}
        </div>
      )}

      {/* Prayer Name */}
      <h3 className="text-xl font-semibold text-gray-100 mb-2">
        {prayerType.name}
      </h3>

      {/* Description */}
      {prayerType.description && (
        <p className="text-sm text-gray-400 mb-4">
          {prayerType.description}
        </p>
      )}

      {/* Counter Display */}
      <div className="my-6">
        <div className="counter-value">
          {prayerType.type === 'count' 
            ? formatNumber(currentValue)
            : formatDuration(currentValue)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {prayerType.type === 'count' ? 'times' : 'minutes'}
        </div>
      </div>

      {/* Increment Button */}
      <button
        onClick={handleIncrement}
        disabled={isSubmitting || isOnCooldown}
        className="btn-primary w-full relative"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner"></span>
            Recording...
          </span>
        ) : isOnCooldown ? (
          <span>Wait {cooldownSeconds}s</span>
        ) : (
          <span>
            + {prayerType.type === 'count' 
              ? prayerType.increment_value 
              : `${prayerType.time_increment_minutes} min`}
          </span>
        )}
      </button>

      {/* Cooldown Progress Bar */}
      {isOnCooldown && (
        <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-500 transition-all duration-1000 ease-linear"
            style={{ 
              width: `${(cooldownSeconds / 30) * 100}%` 
            }}
          />
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`mt-3 text-sm p-2 rounded ${
          message.type === 'success' 
            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {message.text}
        </div>
      )}

      {/* Unique Contributors */}
      {prayer.counter && prayer.counter.unique_contributors > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 text-center">
          {formatNumber(prayer.counter.unique_contributors)} people praying
        </div>
      )}
    </div>
  )
}
