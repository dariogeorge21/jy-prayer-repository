'use client'

import { useState, useEffect } from 'react'
import type { PrayerWithCounter } from '../../../lib/hooks/usePrayerCounters'
import { usePrayerSubmit } from '../../../lib/hooks/usePrayerSubmit'
import { formatNumber, formatDuration } from '../../../lib/utils/formatting'

interface PrayerCardProps {
  prayer: PrayerWithCounter
}

export function PrayerCard({ prayer }: PrayerCardProps) {
  const { submitPrayer, isSubmitting, cooldowns } = usePrayerSubmit()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const cooldownSeconds = cooldowns[prayer.id] || 0
  const isOnCooldown = cooldownSeconds > 0

  const currentValue = prayer.type === 'count' 
    ? prayer.counter?.total_count || 0
    : prayer.counter?.total_time_minutes || 0

  const handleIncrement = async () => {
    setMessage(null)
    
    const result = await submitPrayer({
      prayerTypeId: prayer.id,
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
      {prayer.icon && (
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {prayer.icon}
        </div>
      )}

      {/* Prayer Name */}
      <h3 className="text-xl font-semibold text-gray-100 mb-2">
        {prayer.name}
      </h3>

      {/* Description */}
      {prayer.description && (
        <p className="text-sm text-gray-400 mb-4">
          {prayer.description}
        </p>
      )}

      {/* Counter Display */}
      <div className="my-6">
        <div className="counter-value">
          {prayer.type === 'count' 
            ? formatNumber(currentValue)
            : formatDuration(currentValue)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {prayer.type === 'count' ? 'times' : 'minutes'}
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
            + {prayer.type === 'count' 
              ? prayer.increment_value 
              : `${prayer.time_increment_minutes} min`}
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
