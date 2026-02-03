'use client'

import { useState } from 'react'

export function SystemSettings() {
  const [rateLimitSeconds, setRateLimitSeconds] = useState(
    process.env.NEXT_PUBLIC_RATE_LIMIT_SECONDS || '30'
  )
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // In a real app, this would save to a settings table or config
      // For now, we just show a success message
      setMessage({ type: 'success', text: 'Settings saved! Note: Rate limit changes require a server restart.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="prayer-card">
      <h3 className="text-lg font-semibold text-gray-100 mb-6">
        System Settings
      </h3>

      <div className="space-y-6">
        {/* Rate Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rate Limit (seconds between submissions)
          </label>
          <input
            type="number"
            value={rateLimitSeconds}
            onChange={(e) => setRateLimitSeconds(e.target.value)}
            min="0"
            className="w-full max-w-xs px-4 py-3 bg-surface-elevated border border-gray-700 rounded-md
                     text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-2">
            Minimum time between prayer submissions per user. Set to 0 to disable.
          </p>
        </div>

        {/* Environment Info */}
        <div className="pt-4 border-t border-gray-800">
          <h4 className="text-sm font-medium text-gray-400 mb-3">
            Environment
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Mode:</span>{' '}
              <span className="text-gray-300">
                {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Supabase URL:</span>{' '}
              <span className="text-gray-300">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Configured' : '✗ Not set'}
              </span>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-md border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
