'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { playAlertSound, withRetry } from '@/lib/utils'
import type { Alert, ActiveAlert } from '@/types'

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<ActiveAlert[]>([])
  const [newAlert, setNewAlert] = useState<ActiveAlert | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar alertas activas iniciales
  const fetchAlerts = useCallback(async () => {
    try {
      const { data, error } = await withRetry(
        async () => supabase.rpc('get_active_alerts'),
      )

      if (error) throw error

      setAlerts(data || [])
      setError(null)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching alerts:', err)
      setError('Error al cargar alertas')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()

    // Suscribirse a nuevas alertas
    const channel = supabase
      .channel('alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
        },
        async (payload) => {
          console.log('Nueva alerta recibida:', payload.new)

          // Obtener datos completos de la alerta
          const { data } = await supabase.rpc('get_active_alerts')
          if (data) {
            const newAlertData = data.find(
              (a: ActiveAlert) => a.alert_id === payload.new.id
            )
            if (newAlertData) {
              setNewAlert(newAlertData)
              setAlerts(prev => [newAlertData, ...prev.filter(a => a.alert_id !== newAlertData.alert_id)])
              playAlertSound()

              // Enviar push notification a todos los operadores suscritos
              fetch('/api/push/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: 'ALERTA DE PANICO',
                  body: `${newAlertData.agent_code} - ${newAlertData.agent_name}`,
                  url: '/',
                  alertId: newAlertData.alert_id,
                  tag: 'alert-' + newAlertData.alert_id,
                }),
              }).catch((err) => console.error('Push send error:', err))
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alerts',
        },
        async (payload) => {
          console.log('Alerta actualizada:', payload.new)

          const updated = payload.new as Alert

          // Si la alerta fue resuelta o es falsa alarma, quitarla de la lista
          if (updated.status === 'resolved' || updated.status === 'false_alarm') {
            setAlerts(prev => prev.filter(a => a.alert_id !== (payload.new as { id: string }).id))
          } else {
            // Actualizar la alerta en la lista
            const { data } = await supabase.rpc('get_active_alerts')
            if (data) {
              setAlerts(data)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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
