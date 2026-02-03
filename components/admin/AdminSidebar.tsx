'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Heart, 
  FileText, 
  Settings,
  LogOut 
} from 'lucide-react'
import type { Database } from '@/lib/types/database.types'

type AdminUser = Database['public']['Tables']['admin_users']['Row']

interface AdminSidebarProps {
  adminUser: AdminUser
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/admin/dashboard', 
    icon: LayoutDashboard 
  },
  { 
    name: 'Prayer Types', 
    href: '/admin/prayers', 
    icon: Heart 
  },
  { 
    name: 'Action Logs', 
    href: '/admin/actions', 
    icon: FileText 
  },
  { 
    name: 'Settings', 
    href: '/admin/settings', 
    icon: Settings 
  },
]

export function AdminSidebar({ adminUser }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-surface border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-serif font-bold text-gradient">
          Vitanova Admin
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Prayer Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-md
                transition-all duration-200
                ${isActive 
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' 
                  : 'text-gray-400 hover:bg-surface-elevated hover:text-gray-300'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
            <span className="text-primary-400 font-semibold">
              {adminUser.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-300 truncate">
              {adminUser.full_name || 'Admin'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {adminUser.email}
            </p>
          </div>
        </div>

        <SignOutButton />
      </div>
    </aside>
  )
}

function SignOutButton() {
  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-400 
               hover:text-gray-300 hover:bg-surface-elevated rounded-md transition-all"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  )
}
