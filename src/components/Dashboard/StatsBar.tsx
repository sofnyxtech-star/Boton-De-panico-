'use client'

import { Users, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { useStats } from '@/hooks/useStats'
import { useAgents } from '@/hooks/useAgents'
import { formatSeconds } from '@/lib/utils'

export function StatsBar() {
  const { stats } = useStats()
  const { agentCounts } = useAgents()

  const statCards = [
    {
      label: 'Agentes Online',
      value: agentCounts.online,
      total: agentCounts.total,
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      label: 'Alertas Activas',
      value: stats.alerts.active + stats.alerts.acknowledged + stats.alerts.responding,
      icon: AlertTriangle,
      color: stats.alerts.active > 0 ? 'text-red-400' : 'text-gray-400',
      bgColor: stats.alerts.active > 0 ? 'bg-red-500/20' : 'bg-gray-500/20',
      pulse: stats.alerts.active > 0,
    },
    {
      label: 'Resueltas Hoy',
      value: stats.alerts.resolved_today,
      icon: CheckCircle,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
    {
      label: 'Tiempo Promedio',
      value: formatSeconds(stats.response.avg_time_today),
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      isTime: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`rounded-xl bg-background-card border border-border p-3 md:p-4 ${
            stat.pulse ? 'animate-pulse-emergency' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-400 md:text-sm">{stat.label}</p>
              <p className={`text-lg font-bold md:text-2xl ${stat.color}`}>
                {stat.isTime ? stat.value : stat.value}
                {stat.total && (
                  <span className="text-xs text-gray-500 md:text-sm">/{stat.total}</span>
                )}
              </p>
            </div>
            <div className={`rounded-lg p-2 md:p-3 shrink-0 ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
