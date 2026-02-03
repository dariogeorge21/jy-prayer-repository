'use client'

import { usePrayerCounters } from '@/lib/hooks/usePrayerCounters'
import { PrayerCard } from './PrayerCard'

export function PrayerGrid() {
  const { prayers, loading, error } = usePrayerCounters()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="prayer-card animate-pulse">
            <div className="h-48"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 btn-secondary"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (prayers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No prayers available at this time.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {prayers.map((prayer) => (
        <PrayerCard key={prayer.id} prayer={prayer} />
      ))}
    </div>
  )
}
