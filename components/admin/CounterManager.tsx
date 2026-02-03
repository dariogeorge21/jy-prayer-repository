'use client'

import { useState } from 'react'
import { Edit3, RotateCcw, Save, X } from 'lucide-react'
import { formatNumber } from '@/lib/utils/formatting'

interface Counter {
  id: string
  prayer_type_id: string
  prayer_name: string
  prayer_type: 'count' | 'time'
  total_count: number
  total_time_minutes: number
  unique_contributors: number
}

interface CounterManagerProps {
  counters: Counter[]
}

export function CounterManager({ counters: initialCounters }: CounterManagerProps) {
  const [counters, setCounters] = useState(initialCounters)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [loading, setLoading] = useState<string | null>(null)

  const startEdit = (counter: Counter) => {
    setEditing(counter.id)
    setEditValue(
      counter.prayer_type === 'count' 
        ? counter.total_count 
        : counter.total_time_minutes
    )
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditValue(0)
  }

  const saveEdit = async (counterId: string, prayerTypeId: string) => {
    setLoading(counterId)

    try {
      const response = await fetch(`/api/admin/counters/${prayerTypeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_value: editValue }),
      })

      if (!response.ok) throw new Error('Failed to update counter')

      // Update local state
      setCounters(prev =>
        prev.map(c => {
          if (c.id === counterId) {
            return {
              ...c,
              total_count: c.prayer_type === 'count' ? editValue : c.total_count,
              total_time_minutes: c.prayer_type === 'time' ? editValue : c.total_time_minutes,
            }
          }
          return c
        })
      )

      setEditing(null)

    } catch (error) {
      console.error('Error updating counter:', error)
      alert('Failed to update counter')
    } finally {
      setLoading(null)
    }
  }

  const resetCounter = async (counterId: string, prayerTypeId: string, prayerName: string) => {
    if (!confirm(`Are you sure you want to reset "${prayerName}" to 0? This action cannot be undone.`)) {
      return
    }

    setLoading(counterId)

    try {
      const response = await fetch(`/api/admin/counters/${prayerTypeId}/reset`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to reset counter')

      // Update local state
      setCounters(prev =>
        prev.map(c => {
          if (c.id === counterId) {
            return {
              ...c,
              total_count: 0,
              total_time_minutes: 0,
              unique_contributors: 0,
            }
          }
          return c
        })
      )

    } catch (error) {
      console.error('Error resetting counter:', error)
      alert('Failed to reset counter')
    } finally {
      setLoading(null)
    }
  }

  const resetAllCounters = async () => {
    if (!confirm('Are you sure you want to reset ALL counters to 0? This action cannot be undone and will affect all prayer types.')) {
      return
    }

    if (!confirm('This will delete all prayer counts. Type RESET to confirm.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/counters/reset-all', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to reset counters')

      // Update local state
      setCounters(prev =>
        prev.map(c => ({
          ...c,
          total_count: 0,
          total_time_minutes: 0,
          unique_contributors: 0,
        }))
      )

    } catch (error) {
      console.error('Error resetting all counters:', error)
      alert('Failed to reset counters')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">
            Prayer Counters
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            View and manage prayer totals
          </p>
        </div>

        <button
          onClick={resetAllCounters}
          className="btn-secondary text-red-400 hover:bg-red-500/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All
        </button>
      </div>

      {/* Counters List */}
      <div className="space-y-3">
        {counters.map((counter) => {
          const isEditing = editing === counter.id
          const isLoading = loading === counter.id
          const currentValue = counter.prayer_type === 'count' 
            ? counter.total_count 
            : counter.total_time_minutes

          return (
            <div key={counter.id} className="prayer-card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-100">
                    {counter.prayer_name}
                  </h4>
                  <div className="flex items-center gap-6 mt-2 text-sm">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                          className="w-32 px-3 py-2 bg-surface-elevated border border-gray-700 rounded-md
                                   text-gray-100 focus:ring-2 focus:ring-primary-500"
                          autoFocus
                        />
                        <span className="text-gray-500">
                          {counter.prayer_type === 'time' ? 'minutes' : 'times'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-accent-400 font-semibold text-lg">
                        {formatNumber(currentValue)} {counter.prayer_type === 'time' ? 'min' : ''}
                      </span>
                    )}
                    
                    <span className="text-gray-500">
                      {formatNumber(counter.unique_contributors)} contributors
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => saveEdit(counter.id, counter.prayer_type_id)}
                        disabled={isLoading}
                        className="p-2 hover:bg-surface-elevated rounded-md text-green-400 hover:text-green-300"
                        title="Save"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={isLoading}
                        className="p-2 hover:bg-surface-elevated rounded-md text-gray-400 hover:text-gray-300"
                        title="Cancel"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(counter)}
                        disabled={isLoading}
                        className="p-2 hover:bg-surface-elevated rounded-md text-gray-400 hover:text-gray-300"
                        title="Edit counter"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => resetCounter(counter.id, counter.prayer_type_id, counter.prayer_name)}
                        disabled={isLoading}
                        className="p-2 hover:bg-surface-elevated rounded-md text-red-400 hover:text-red-300"
                        title="Reset to 0"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
