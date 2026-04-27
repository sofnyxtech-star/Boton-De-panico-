'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { withRetry } from '@/lib/utils'
import type { DashboardStats } from '@/types'

const DEFAULT_STATS: DashboardStats = {
  agents: {
    total: 0,
    available: 0,
    patrolling: 0,
    fixed_post: 0,
    emergency: 0,
    offline: 0,
  },
  alerts: {
    active: 0,
    acknowledged: 0,
    responding: 0,
    resolved_today: 0,
    total_today: 0,
  },
  response: {
    avg_time_today: 0,
    avg_time_week: 0,
  },
}

export function useStats() {
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await withRetry(
        async () => supabase.rpc('get_dashboard_stats'),
      )

      if (error) throw error

      setStats(data || DEFAULT_STATS)
      setError(null)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError('Error al cargar estadísticas')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()

    // Actualizar estadísticas cada minuto
    const interval = setInterval(fetchStats, 60000)

    return () => clearInterval(interval)
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}
