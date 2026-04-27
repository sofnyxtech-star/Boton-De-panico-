'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { withRetry } from '@/lib/utils'
import type { AgentWithLocation, Agent } from '@/types'

export function useAgents() {
  const [agents, setAgents] = useState<AgentWithLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar agentes con ubicación
  const fetchAgents = useCallback(async () => {
    try {
      const { data, error } = await withRetry(
        async () => supabase.rpc('get_agents_with_location'),
      )

      if (error) throw error

      setAgents(data || [])
      setError(null)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching agents:', err)
      setError('Error al cargar agentes')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()

    // Suscribirse a cambios en agentes
    const channel = supabase
      .channel('agents-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agents',
        },
        async (payload) => {
          console.log('Agente actualizado:', payload.new)

          // Refrescar lista de agentes
          const { data } = await supabase.rpc('get_agents_with_location')
          if (data) {
            setAgents(data)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAgents])

  // Obtener agente por ID
  const getAgentById = async (agentId: string): Promise<Agent | null> => {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (error) {
      console.error('Error fetching agent:', error)
      return null
    }

    return data
  }

  // Contar agentes por estado
  const agentCounts = {
    total: agents.length,
    available: agents.filter(a => a.status === 'available').length,
    patrolling: agents.filter(a => a.status === 'patrolling').length,
    fixed_post: agents.filter(a => a.status === 'fixed_post').length,
    emergency: agents.filter(a => a.status === 'emergency').length,
    offline: agents.filter(a => a.status === 'offline').length,
    online: agents.filter(a => a.status !== 'offline').length,
  }

  return {
    agents,
    loading,
    error,
    agentCounts,
    getAgentById,
    refetch: fetchAgents,
  }
}
