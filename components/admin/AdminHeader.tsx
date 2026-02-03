'use client'

import { usePathname } from 'next/navigation'
import type { Database } from '@/lib/types/database.types'

type AdminUser = Database['public']['Tables']['admin_users']['Row']

interface AdminHeaderProps {
  adminUser: AdminUser
}

const pageNames: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/prayers': 'Prayer Types Management',
  '/admin/actions': 'Action Logs',
  '/admin/settings': 'Settings',
}

export function AdminHeader({ adminUser }: AdminHeaderProps) {
  const pathname = usePathname()
  const pageName = pageNames[pathname] || 'Admin'

  return (
    <header className="bg-surface border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">
            {pageName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your prayer repository
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Role Badge */}
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${adminUser.role === 'super_admin' 
              ? 'bg-accent-500/20 text-accent-400' 
              : 'bg-primary-500/20 text-primary-400'
            }
          `}>
            {adminUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </span>
        </div>
      </div>
    </header>
  )
}
