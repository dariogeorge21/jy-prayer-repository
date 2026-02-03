import { TrendingUp, Users, Heart } from 'lucide-react'

interface DashboardStatsProps {
  totalActions: number
  uniqueContributors: number
  prayerTypesCount: number
}

export function DashboardStats({
  totalActions,
  uniqueContributors,
  prayerTypesCount,
}: DashboardStatsProps) {
  const stats = [
    {
      name: 'Total Prayers',
      value: totalActions.toLocaleString(),
      icon: Heart,
      color: 'text-accent-400',
      bg: 'bg-accent-500/10',
    },
    {
      name: 'Unique Contributors',
      value: uniqueContributors.toLocaleString(),
      icon: Users,
      color: 'text-primary-400',
      bg: 'bg-primary-500/10',
    },
    {
      name: 'Prayer Types',
      value: prayerTypesCount.toString(),
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        
        return (
          <div key={stat.name} className="prayer-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {stat.name}
                </p>
                <p className="text-3xl font-bold text-gray-100">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
