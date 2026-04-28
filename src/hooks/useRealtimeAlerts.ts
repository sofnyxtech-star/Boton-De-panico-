'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { playAlertSound, withRetry } from '@/lib/utils'
import type { ActiveAlert } from '@/types'

const POLLING_INTERVAL_MS = 5000 // backup cada 5 segundos

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<ActiveAlert[]>([])
  const [newAlert, setNewAlert] = useState<ActiveAlert | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Set de IDs ya conocidos para detectar alertas nuevas vía polling
  const knownAlertIdsRef = useRef<Set<string>>(new Set())
  const isFirstLoadRef = useRef(true)

  // Cargar alertas activas y detectar nuevas
  const fetchAlerts = useCallback(async (silent = false) => {
    try {
      const { data, error } = await withRetry(
        async () => supabase.rpc('get_active_alerts'),
      )
      if (error) throw error

      const newAlerts: ActiveAlert[] = data || []
      const knownIds = knownAlertIdsRef.current

      // En la primera carga, solo registrar IDs sin disparar notificación
      if (isFirstLoadRef.current) {
        newAlerts.forEach((a) => knownIds.add(a.alert_id))
        isFirstLoadRef.current = false
      } else {
        // Detectar alertas que NO conocíamos => son nuevas
        const reallyNew = newAlerts.find(
          (a) => !knownIds.has(a.alert_id) && a.status === 'active',
        )
        if (reallyNew) {
          setNewAlert(reallyNew)
          playAlertSound()
        }
        // Actualizar set
        newAlerts.forEach((a) => knownIds.add(a.alert_id))
        // Eliminar IDs que ya no están activos
        const currentIds = new Set(newAlerts.map((a) => a.alert_id))
        knownIds.forEach((id) => {
          if (!currentIds.has(id)) knownIds.delete(id)
        })
      }

      setAlerts(newAlerts)
      setError(null)
      if (!silent) setLoading(false)
    } catch (err) {
      console.error('[Alerts] fetch error:', err)
      if (!silent) {
        setError('Error al cargar alertas')
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchAlerts()

    // 1. Realtime subscription (primaria)
    let channel = subscribeToAlerts()

    function subscribeToAlerts() {
      return supabase
        .channel('alerts-realtime-' + Date.now())
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'alerts' },
          async () => {
            await fetchAlerts(true)
          },
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'alerts' },
          async () => {
            await fetchAlerts(true)
          },
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            // Reconectar despues de 2 segundos
            setTimeout(() => {
              try { supabase.removeChannel(channel) } catch {}
              channel = subscribeToAlerts()
            }, 2000)
          }
        })
    }

    // 2. Polling de respaldo cada 5 seg (esencial en desktop cuando WS falla)
    const pollingInterval = setInterval(() => {
      fetchAlerts(true)
    }, POLLING_INTERVAL_MS)

    // 3. Refrescar inmediatamente cuando la pestaña vuelve a foco
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAlerts(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 4. Refrescar cuando vuelve la red
    const handleOnline = () => fetchAlerts(true)
    window.addEventListener('online', handleOnline)

    return () => {
      try { supabase.removeChannel(channel) } catch {}
      clearInterval(pollingInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
    }
  }, [fetchAlerts])

  // Reconocer alerta
  const acknowledgeAlert = async (alertId: string, operatorId: string) => {
    const { error } = await supabase.rpc('acknowledge_alert', {
      p_alert_id: alertId,
      p_operator_id: operatorId,
    })
    if (error) {
      console.error('Error acknowledging alert:', error)
      return false
    }
    return true
  }

  // Marcar como en respuesta
  const respondToAlert = async (alertId: string, operatorId: string) => {
    const { error } = await supabase.rpc('respond_to_alert', {
      p_alert_id: alertId,
      p_operator_id: operatorId,
    })
    if (error) {
      console.error('Error responding to alert:', error)
      return false
    }
    return true
  }

  // Resolver alerta
  const resolveAlert = async (
    alertId: string,
    operatorId: string,
    notes: string,
    isFalseAlarm: boolean = false
  ) => {
    const { error } = await supabase.rpc('resolve_alert', {
      p_alert_id: alertId,
      p_operator_id: operatorId,
      p_notes: notes,
      p_is_false_alarm: isFalseAlarm,
    })
    if (error) {
      console.error('Error resolving alert:', error)
      return false
    }
    return true
  }

  // Limpiar nueva alerta (después de mostrar notificación)
  const clearNewAlert = () => setNewAlert(null)

  return {
    alerts,
    newAlert,
    loading,
    error,
    acknowledgeAlert,
    respondToAlert,
    resolveAlert,
    clearNewAlert,
    refetch: fetchAlerts,
  }
}
