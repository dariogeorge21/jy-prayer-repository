'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database.types'

type PrayerType = Database['public']['Tables']['prayer_types']['Row']
type PrayerCounter = Database['public']['Tables']['prayer_counters']['Row']

export interface PrayerWithCounter extends PrayerType {
  counter: PrayerCounter | null
}

export function usePrayerCounters() {
  const [prayers, setPrayers] = useState<PrayerWithCounter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Initial fetch
    async function fetchPrayers() {
      try {
        const { data, error: fetchError } = await supabase
          .from('prayer_types')
          .select(`
            *,
            counter:prayer_counters(*)
          `)
          .eq('is_visible', true)
          .eq('is_enabled', true)
          .order('display_order', { ascending: true })

        if (fetchError) throw fetchError

        setPrayers(data as PrayerWithCounter[])
      } catch (err) {
        console.error('Error fetching prayers:', err)
        setError('Failed to load prayers')
      } finally {
        setLoading(false)
      }
    }

    fetchPrayers()

    // Subscribe to realtime updates on prayer_counters
    const channel = supabase
      .channel('prayer-counters-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prayer_counters',
        },
        (payload) => {
          setPrayers((current) =>
            current.map((prayer) => {
              if (prayer.counter?.id === payload.new.id) {
                return {
                  ...prayer,
                  counter: payload.new as PrayerCounter,
                }
              }
              return prayer
            })
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { prayers, loading, error }
}
