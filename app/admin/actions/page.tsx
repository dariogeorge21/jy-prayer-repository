import { createClient } from '@/lib/supabase/server'
import { ActionLogsTable } from '@/components/admin/ActionLogsTable'

export default async function AdminActionsPage() {
  const supabase = await createClient()

  // Get recent actions with pagination
  const { data: actions, count } = await supabase
    .from('prayer_actions')
    .select(`
      id,
      created_at,
      increment_amount,
      action_type,
      user_identifier,
      ip_address,
      admin_note,
      prayer_type:prayer_types(name, type),
      admin:admin_users(email)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-100">
          Prayer Action Logs
        </h2>
        <p className="text-gray-500 mt-1">
          Complete audit trail of all prayer submissions and admin actions
        </p>
      </div>

      <div className="prayer-card">
        <ActionLogsTable actions={actions || []} totalCount={count || 0} />
      </div>
    </div>
  )
}

export const revalidate = 10
