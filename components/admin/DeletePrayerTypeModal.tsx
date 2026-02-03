'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface PrayerType {
  id: string
  name: string
  description: string | null
  type: 'count' | 'time'
  increment_value: number | null
  time_increment_minutes: number | null
  is_visible: boolean
  is_enabled: boolean
  display_order: number
  icon: string | null
}

interface DeletePrayerTypeModalProps {
  prayerType: PrayerType
  onClose: () => void
  onSuccess: (id: string) => void
}

export function DeletePrayerTypeModal({
  prayerType,
  onClose,
  onSuccess,
}: DeletePrayerTypeModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
    if (confirmText !== prayerType.name) {
      setError('Please type the prayer name exactly to confirm deletion')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/prayers/${prayerType.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete prayer type')
      }

      onSuccess(prayerType.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-100">
              Delete Prayer Type
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-white">{prayerType.name}</span>?
          </p>
          <p className="text-sm text-gray-400">
            This action cannot be undone. All associated counter data and action
            logs will be permanently deleted.
          </p>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Type <span className="text-red-400">{prayerType.name}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-3 bg-surface-elevated border border-gray-700 rounded-md
                       text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Type prayer name to confirm"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || confirmText !== prayerType.name}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Deleting...' : 'Delete Prayer Type'}
          </button>
        </div>
      </div>
    </div>
  )
}
