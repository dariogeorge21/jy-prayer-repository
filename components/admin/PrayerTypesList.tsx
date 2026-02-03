'use client'

import { useState } from 'react'
import { Eye, EyeOff, Edit, Trash2, GripVertical } from 'lucide-react'
import { EditPrayerTypeModal } from './EditPrayerTypeModal'
import { DeletePrayerTypeModal } from './DeletePrayerTypeModal'
import { formatNumber } from '@/lib/utils/formatting'

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
  counter: Array<{
    total_count: number
    total_time_minutes: number
    unique_contributors: number
  }> | null
}

interface PrayerTypesListProps {
  prayerTypes: PrayerType[]
}

export function PrayerTypesList({ prayerTypes: initialPrayerTypes }: PrayerTypesListProps) {
  const [prayerTypes, setPrayerTypes] = useState(initialPrayerTypes)
  const [editingPrayer, setEditingPrayer] = useState<PrayerType | null>(null)
  const [deletingPrayer, setDeletingPrayer] = useState<PrayerType | null>(null)

  const toggleVisibility = async (id: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/admin/prayers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !currentValue }),
      })

      if (response.ok) {
        setPrayerTypes(prev =>
          prev.map(p => p.id === id ? { ...p, is_visible: !currentValue } : p)
        )
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
    }
  }

  const toggleEnabled = async (id: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/admin/prayers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: !currentValue }),
      })

      if (response.ok) {
        setPrayerTypes(prev =>
          prev.map(p => p.id === id ? { ...p, is_enabled: !currentValue } : p)
        )
      }
    } catch (error) {
      console.error('Error toggling enabled:', error)
    }
  }

  if (prayerTypes.length === 0) {
    return (
      <div className="prayer-card text-center py-12">
        <p className="text-gray-500 mb-4">No prayer types created yet</p>
        <p className="text-sm text-gray-600">
          Create your first prayer type to get started
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {prayerTypes.map((prayer) => {
          const counter = prayer.counter?.[0]
          const currentValue = prayer.type === 'count' 
            ? counter?.total_count || 0
            : counter?.total_time_minutes || 0

          return (
            <div key={prayer.id} className="prayer-card">
              <div className="flex items-start gap-4">
                {/* Drag Handle */}
                <button className="text-gray-600 hover:text-gray-400 cursor-move mt-2">
                  <GripVertical className="w-5 h-5" />
                </button>

                {/* Icon */}
                {prayer.icon && (
                  <div className="text-3xl mt-1">
                    {prayer.icon}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100">
                        {prayer.name}
                      </h3>
                      {prayer.description && (
                        <p className="text-sm text-gray-400 mt-1">
                          {prayer.description}
                        </p>
                      )}
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="text-gray-500">
                          Type: <span className="text-gray-300">{prayer.type}</span>
                        </span>
                        <span className="text-gray-500">
                          Increment: <span className="text-gray-300">
                            {prayer.type === 'count' 
                              ? prayer.increment_value 
                              : `${prayer.time_increment_minutes} min`}
                          </span>
                        </span>
                        <span className="text-gray-500">
                          Total: <span className="text-accent-400 font-semibold">
                            {formatNumber(currentValue)}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Visibility Toggle */}
                      <button
                        onClick={() => toggleVisibility(prayer.id, prayer.is_visible)}
                        className="p-2 hover:bg-surface-elevated rounded-md transition-colors"
                        title={prayer.is_visible ? 'Hide from public' : 'Show to public'}
                      >
                        {prayer.is_visible ? (
                          <Eye className="w-5 h-5 text-green-400" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-600" />
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => setEditingPrayer(prayer)}
                        className="p-2 hover:bg-surface-elevated rounded-md transition-colors"
                        title="Edit prayer type"
                      >
                        <Edit className="w-5 h-5 text-gray-400 hover:text-gray-300" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeletingPrayer(prayer)}
                        className="p-2 hover:bg-surface-elevated rounded-md transition-colors"
                        title="Delete prayer type"
                      >
                        <Trash2 className="w-5 h-5 text-red-400 hover:text-red-300" />
                      </button>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 mt-3">
                    {!prayer.is_enabled && (
                      <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-md border border-red-500/20">
                        Disabled
                      </span>
                    )}
                    {!prayer.is_visible && (
                      <span className="px-2 py-1 bg-gray-500/10 text-gray-400 text-xs rounded-md border border-gray-500/20">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modals */}
      {editingPrayer && (
        <EditPrayerTypeModal
          prayerType={editingPrayer}
          onClose={() => setEditingPrayer(null)}
          onSuccess={(updated) => {
            setPrayerTypes(prev =>
              prev.map(p => p.id === updated.id ? { ...p, ...updated } : p)
            )
            setEditingPrayer(null)
          }}
        />
      )}

      {deletingPrayer && (
        <DeletePrayerTypeModal
          prayerType={deletingPrayer}
          onClose={() => setDeletingPrayer(null)}
          onSuccess={(id) => {
            setPrayerTypes(prev => prev.filter(p => p.id !== id))
            setDeletingPrayer(null)
          }}
        />
      )}
    </>
  )
}
