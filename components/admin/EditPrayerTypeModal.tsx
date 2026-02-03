'use client'

import { PrayerTypeFormModal } from './PrayerTypeFormModal'

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

interface EditPrayerTypeModalProps {
  prayerType: PrayerType
  onClose: () => void
  onSuccess: (data: Partial<PrayerType> & { id: string }) => void
}

export function EditPrayerTypeModal({
  prayerType,
  onClose,
  onSuccess,
}: EditPrayerTypeModalProps) {
  return (
    <PrayerTypeFormModal
      mode="edit"
      prayerTypeId={prayerType.id}
      initialData={{
        name: prayerType.name,
        description: prayerType.description || '',
        type: prayerType.type,
        increment_value: prayerType.increment_value || 1,
        time_increment_minutes: prayerType.time_increment_minutes || 5,
        is_visible: prayerType.is_visible,
        is_enabled: prayerType.is_enabled,
        icon: prayerType.icon || '',
      }}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}
