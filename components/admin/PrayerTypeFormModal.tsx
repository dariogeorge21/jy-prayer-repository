'use client'

import { useState, FormEvent } from 'react'
import { X } from 'lucide-react'

interface PrayerTypeFormData {
  name: string
  description: string
  type: 'count' | 'time'
  increment_value: number
  time_increment_minutes: number
  is_visible: boolean
  is_enabled: boolean
  icon: string
}

interface PrayerTypeFormModalProps {
  mode: 'create' | 'edit'
  initialData?: Partial<PrayerTypeFormData>
  prayerTypeId?: string
  onClose: () => void
  onSuccess: (data: any) => void
}

export function PrayerTypeFormModal({
  mode,
  initialData,
  prayerTypeId,
  onClose,
  onSuccess,
}: PrayerTypeFormModalProps) {
  const [formData, setFormData] = useState<PrayerTypeFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'count',
    increment_value: initialData?.increment_value || 1,
    time_increment_minutes: initialData?.time_increment_minutes || 5,
    is_visible: initialData?.is_visible ?? true,
    is_enabled: initialData?.is_enabled ?? true,
    icon: initialData?.icon || '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = mode === 'create' 
        ? '/api/admin/prayers'
        : `/api/admin/prayers/${prayerTypeId}`

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save prayer type')
      }

      const data = await response.json()
      onSuccess(data)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-gray-100">
            {mode === 'create' ? 'Create Prayer Type' : 'Edit Prayer Type'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prayer Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-surface-elevated border border-gray-700 rounded-md
                       text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Holy Rosary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-surface-elevated border border-gray-700 rounded-md
                       text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Optional description"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prayer Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'count' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'count'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="text-lg font-semibold text-gray-100">Count-Based</div>
                <div className="text-sm text-gray-400 mt-1">
                  Number of times (e.g., Rosaries, Hail Marys)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'time' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'time'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="text-lg font-semibold text-gray-100">Time-Based</div>
                <div className="text-sm text-gray-400 mt-1">
                  Duration in minutes (e.g., Adoration)
                </div>
              </button>
            </div>
          </div>

          {/* Increment Value */}
          {formData.type === 'count' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Increment Value *
              </label>
              <input
                type="number"
                min="1"
                value={formData.increment_value}
                onChange={(e) => setFormData({ ...formData, increment_value: parseInt(e.target.value) })}
                required
                className="w-full px-4 py-3 bg-surface-elevated border border-gray-700 rounded-md
                         text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                How much to increment each time (usually 1)
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time Increment (minutes) *
              </label>
              <select
                value={formData.time_increment_minutes}
                onChange={(e) => setFormData({ ...formData, time_increment_minutes: parseInt(e.target.value) })}
                required
                className="w-full px-4 py-3 bg-surface-elevated border border-gray-700 rounded-md
                         text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={1}>1 minute</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
          )}

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Icon (Emoji)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              maxLength={2}
              className="w-full px-4 py-3 bg-surface-elevated border border-gray-700 rounded-md
                       text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="📿"
            />
            <p className="text-sm text-gray-500 mt-1">
              Single emoji to represent this prayer
            </p>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                className="w-5 h-5 rounded border-gray-700 bg-surface-elevated
                         text-primary-500 focus:ring-primary-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-300">Visible to public</div>
                <div className="text-xs text-gray-500">Show this prayer on the public page</div>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_enabled}
                onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                className="w-5 h-5 rounded border-gray-700 bg-surface-elevated
                         text-primary-500 focus:ring-primary-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-300">Enabled</div>
                <div className="text-xs text-gray-500">Allow users to submit this prayer</div>
              </div>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
