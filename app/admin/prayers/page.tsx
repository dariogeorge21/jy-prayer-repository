import { createClient } from '@/lib/supabase/server'
import { PrayerTypesList } from '@/components/admin/PrayerTypesList'
import { CreatePrayerTypeButton } from '@/components/admin/CreatePrayerTypeButton'

export default async function AdminPrayersPage() {
  const supabase = await createClient()

  // Get all prayer types (including hidden/disabled)
  const { data: prayerTypes } = await supabase
    .from('prayer_types')
    .select(`
      *,
      counter:prayer_counters(*)
    `)
    .order('display_order', { ascending: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-100">
            Prayer Types
          </h2>
          <p className="text-gray-500 mt-1">
            Manage prayer types for your program
          </p>
        </div>

        <CreatePrayerTypeButton />
      </div>

      {/* Prayer Types List */}
      <PrayerTypesList prayerTypes={prayerTypes || []} />
    </div>
  )
}

export const revalidate = 0
