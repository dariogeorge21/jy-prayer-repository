'use client'

import { useState } from 'react'
import { formatDateTime, formatRelativeTime } from '@/lib/utils/formatting'
import { Download, Filter } from 'lucide-react'

interface ActionLogsTableProps {
  actions: any[]
  totalCount: number
}

export function ActionLogsTable({ actions, totalCount }: ActionLogsTableProps) {
  const [filter, setFilter] = useState<'all' | 'increment' | 'admin'>('all')

  const filteredActions = actions.filter(action => {
    if (filter === 'all') return true
    if (filter === 'increment') return action.action_type === 'increment'
    return action.action_type !== 'increment'
  })

  const exportToCSV = () => {
    const headers = ['Date', 'Prayer Type', 'Action', 'Amount', 'User/Admin', 'IP Address']
    const rows = filteredActions.map(action => [
      new Date(action.created_at).toISOString(),
      action.prayer_type?.name || 'Unknown',
      action.action_type,
      action.increment_amount,
      action.admin?.email || action.user_identifier,
      action.ip_address || 'N/A',
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prayer-actions-${new Date().toISOString()}.csv`
    a.click()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('increment')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'increment'
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            User Submissions
          </button>
          <button
            onClick={() => setFilter('admin')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'admin'
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Admin Actions
          </button>
        </div>

        <button
          onClick={exportToCSV}
          className="btn-secondary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="pb-3 text-sm font-medium text-gray-400">Time</th>
              <th className="pb-3 text-sm font-medium text-gray-400">Prayer</th>
              <th className="pb-3 text-sm font-medium text-gray-400">Action</th>
              <th className="pb-3 text-sm font-medium text-gray-400">Amount</th>
              <th className="pb-3 text-sm font-medium text-gray-400">User/Admin</th>
              <th className="pb-3 text-sm font-medium text-gray-400">IP</th>
            </tr>
          </thead>
          <tbody>
            {filteredActions.map((action) => (
              <tr key={action.id} className="border-b border-gray-800/50">
                <td className="py-3 text-sm text-gray-300">
                  <div>{formatRelativeTime(action.created_at)}</div>
                  <div className="text-xs text-gray-600">
                    {formatDateTime(action.created_at)}
                  </div>
                </td>
                <td className="py-3 text-sm text-gray-300">
                  {action.prayer_type?.name}
                </td>
                <td className="py-3">
                  <span className={`
                    px-2 py-1 rounded-md text-xs font-medium
                    ${action.action_type === 'increment' 
                      ? 'bg-green-500/10 text-green-400'
                      : action.action_type === 'admin_edit'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-red-500/10 text-red-400'
                    }
                  `}>
                    {action.action_type}
                  </span>
                </td>
                <td className="py-3 text-sm text-gray-300">
                  +{action.increment_amount}
                </td>
                <td className="py-3 text-sm text-gray-300 font-mono">
                  {action.admin?.email || action.user_identifier.substring(0, 8)}...
                </td>
                <td className="py-3 text-sm text-gray-500 font-mono">
                  {action.ip_address || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredActions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No actions found
        </div>
      )}
    </div>
  )
}
