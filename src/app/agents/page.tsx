'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Filter,
  Users,
  MapPin,
  Battery,
  Clock,
} from 'lucide-react'
import { DashboardLayout } from '@/components/UI/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { useAgents } from '@/hooks/useAgents'
import { AGENT_STATUS_CONFIG } from '@/types'
import { formatRelativeTime, getBatteryColor, cn } from '@/lib/utils'
import type { AgentStatus } from '@/types'

export default function AgentsPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const { agents, agentCounts } = useAgents()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="spinner h-16 w-16"></div>
      </div>
    )
  }

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.full_name.toLowerCase().includes(search.toLowerCase()) ||
      agent.code.toLowerCase().includes(search.toLowerCase()) ||
      (agent.assigned_zone?.toLowerCase().includes(search.toLowerCase()) ?? false)

    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2 md:text-2xl">
            <Users className="h-6 w-6 text-primary md:h-7 md:w-7" />
            Gestion de Agentes
          </h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">
            {agentCounts.total} agentes registrados, {agentCounts.online} en linea
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:gap-4 md:mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, codigo o zona..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background-card border border-border rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none text-sm md:py-3 md:text-base"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AgentStatus | 'all')}
            className="w-full px-3 py-2.5 bg-background-card border border-border rounded-lg text-white focus:border-primary focus:outline-none text-sm sm:w-auto md:px-4 md:py-3 md:text-base"
          >
            <option value="all">Todos los estados</option>
            {Object.entries(AGENT_STATUS_CONFIG).map(([status, config]) => (
              <option key={status} value={status}>
                {config.icon} {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4 md:mb-6">
        {Object.entries(AGENT_STATUS_CONFIG).map(([status, config]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as AgentStatus)}
            className={cn(
              'p-3 rounded-lg border transition-all md:p-4',
              statusFilter === status
                ? 'bg-primary/20 border-primary'
                : 'bg-background-card border-border hover:border-primary/50'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl">{config.icon}</span>
              <div className="text-left">
                <p className={`text-lg font-bold md:text-xl ${config.color}`}>
                  {agentCounts[status as keyof typeof agentCounts]}
                </p>
                <p className="text-xs text-gray-400">{config.label}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Agents Grid - single column on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
        {filteredAgents.map((agent) => {
          const statusConfig = AGENT_STATUS_CONFIG[agent.status]

          return (
            <div
              key={agent.id}
              className={cn(
                'bg-background-card rounded-xl border p-3 transition-all card-hover cursor-pointer md:p-4',
                agent.has_active_alert
                  ? 'border-danger animate-border-pulse'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm md:w-12 md:h-12 md:text-base', statusConfig.bgColor)}>
                    {agent.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm md:text-base">{agent.code}</p>
                    <p className="text-xs text-gray-400 md:text-sm">{agent.full_name}</p>
                  </div>
                </div>
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusConfig.bgColor, 'text-white')}>
                  {statusConfig.label}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm">
                {agent.agent_position && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users className="h-4 w-4 text-gray-500 shrink-0" />
                    <span className="truncate">{agent.agent_position}</span>
                  </div>
                )}
                {agent.assigned_zone && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
                    <span className="truncate">{agent.assigned_zone}</span>
                  </div>
                )}
                {agent.battery_level !== null && (
                  <div className={cn('flex items-center gap-2', getBatteryColor(agent.battery_level))}>
                    <Battery className="h-4 w-4 shrink-0" />
                    {agent.battery_level}%
                  </div>
                )}
                {agent.last_update && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="h-4 w-4 shrink-0" />
                    {formatRelativeTime(agent.last_update)}
                  </div>
                )}
              </div>

              {/* Alert Badge */}
              {agent.has_active_alert && (
                <div className="mt-3 p-2 bg-danger/20 rounded-lg text-danger-light text-sm font-medium text-center animate-pulse">
                  ALERTA ACTIVA
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No se encontraron agentes</p>
        </div>
      )}
    </DashboardLayout>
  )
}
