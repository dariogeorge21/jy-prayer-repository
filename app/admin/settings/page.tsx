import { createClient } from '@/lib/supabase/server'
import { ProgramSettings } from '@/components/admin/ProgramSettings'
import { SystemSettings } from '@/components/admin/SystemSettings'

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('is_active', true)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-100">
          Settings
        </h2>
        <p className="text-gray-500 mt-1">
          Configure your prayer repository
        </p>
      </div>

      <ProgramSettings program={program} />
      <SystemSettings />
    </div>
  )
}
