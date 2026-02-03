import { formatRelativeTime } from '@/lib/utils/formatting'

interface RecentActivityProps {
  actions: any[]
}

export function RecentActivity({ actions }: RecentActivityProps) {
  if (actions.length === 0) {
    return (
      <div className="prayer-card">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Recent Activity
        </h3>
        <p className="text-gray-500 text-center py-8">
          No recent activity
        </p>
      </div>
    )
  }

  return (
    <div className="prayer-card">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">
        Recent Activity
      </h3>

      <div className="space-y-3">
        {actions.map((action) => (
          <div 
            key={action.id} 
            className="flex items-start gap-3 pb-3 border-b border-gray-800 last:border-0"
          >
            <div className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300">
                <span className="font-medium">
                  {action.prayer_type?.name}
                </span>
                {' '}
                <span className="text-gray-500">
                  +{action.increment_amount} {action.prayer_type?.type === 'time' ? 'min' : ''}
                </span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {formatRelativeTime(action.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
