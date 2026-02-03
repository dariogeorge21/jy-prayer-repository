'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PrayerStat {
  name: string
  total_count?: number
  total_time_minutes?: number
  type?: 'count' | 'time'
}

interface PrayerChartProps {
  stats: PrayerStat[]
}

export function PrayerChart({ stats }: PrayerChartProps) {
  if (!stats || stats.length === 0) {
    return (
      <div className="prayer-card">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Prayer Statistics
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
    )
  }

  const chartData = stats.map((stat) => ({
    name: stat.name,
    count: stat.type === 'time' ? (stat.total_time_minutes || 0) : (stat.total_count || 0),
  }))

  return (
    <div className="prayer-card">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">
        Prayer Statistics
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6',
              }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Bar 
              dataKey="count" 
              fill="#EAB308"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
