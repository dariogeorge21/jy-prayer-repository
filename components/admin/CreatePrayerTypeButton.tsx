'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PrayerTypeFormModal } from './PrayerTypeFormModal'

export function CreatePrayerTypeButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Create Prayer Type
      </button>

      {isOpen && (
        <PrayerTypeFormModal
          mode="create"
          onClose={() => setIsOpen(false)}
          onSuccess={() => {
            setIsOpen(false)
            window.location.reload()
          }}
        />
      )}
    </>
  )
}
