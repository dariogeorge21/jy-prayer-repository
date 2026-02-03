import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/admin/DashboardStats'
import { RecentActivity } from '@/components/admin/RecentActivity'
import { PrayerChart } from '@/components/admin/PrayerChart'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get active program
  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('is_active', true)
    .single()

  // Get prayer statistics
  const { data: stats } = await supabase.rpc('get_prayer_statistics')

  // Get total actions count
  const { count: totalActions } = await supabase
    .from('prayer_actions')
    .select('*', { count: 'exact', head: true })
    .eq('action_type', 'increment')

  // Get unique contributors across all prayers
  const { data: uniqueContributors } = await supabase
    .rpc('count_unique_contributors')

  // Get recent actions
  const { data: recentActions } = await supabase
    .from('prayer_actions')
    .select(`
      id,
      created_at,
      increment_amount,
      action_type,
      prayer_type:prayer_types(name, type)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-6">
      {/* Program Header */}
      <div className="prayer-card">
        <h2 className="text-xl font-semibold text-gray-100 mb-2">
          {program?.name || 'No Active Program'}
        </h2>
        <p className="text-gray-400">
          {program?.description || 'Set up your program in Settings'}
        </p>
      </div>

      {/* Stats Grid */}
      <DashboardStats
        totalActions={totalActions || 0}
        uniqueContributors={uniqueContributors || 0}
        prayerTypesCount={stats?.length || 0}
      />

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PrayerChart stats={stats || []} />
        <RecentActivity actions={recentActions || []} />
      </div>
    </div>
  )
}

// Revalidate every 30 seconds
export const revalidate = 30
