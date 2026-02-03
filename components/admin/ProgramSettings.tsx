'use client'

import { useState, FormEvent } from 'react'
import { Save } from 'lucide-react'

interface ProgramSettingsProps {
  program: any
}

export function ProgramSettings({ program: initialProgram }: ProgramSettingsProps) {
  const [program, setProgram] = useState(initialProgram)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/programs/${program.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: program.name,
          description: program.description,
        }),
      })

      if (!response.ok) throw new Error('Failed to update program')

      setMessage({ type: 'success', text: 'Program updated successfully' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update program' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="prayer-card">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">
        Program Configuration
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Program Name
          </label>
          <input
            type="text"
            value={program?.name || ''}
            onChange={(e) => setProgram({ ...program, name: e.target.value })}
            required
            className="w-full px-4 py-3 bg-surface-elevated border border-gray-700 rounded-md
                     text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={program?.description || ''}
            onChange={(e) => setProgram({ ...program, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-surface-elevated border border-gray-700 rounded-md
                     text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-md ${
              message.type === 'success'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
