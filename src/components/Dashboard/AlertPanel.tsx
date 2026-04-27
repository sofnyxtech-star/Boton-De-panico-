'use client'

import { useState } from 'react'
import { AlertTriangle, Clock, MapPin, Phone, User, CheckCircle, Truck, X } from 'lucide-react'
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts'
import { useAuth } from '@/hooks/useAuth'
import { formatRelativeTime, cn } from '@/lib/utils'
import { ALERT_PRIORITY_CONFIG, ALERT_TYPE_CONFIG } from '@/types'
import type { ActiveAlert } from '@/types'

interface AlertCardProps {
  alert: ActiveAlert
  onAcknowledge: () => void
  onRespond: () => void
  onResolve: () => void
  onSelect: () => void
  isSelected: boolean
}

function AlertCard({ alert, onAcknowledge, onRespond, onResolve, onSelect, isSelected }: AlertCardProps) {
  const priorityConfig = ALERT_PRIORITY_CONFIG[alert.priority]
  const typeConfig = ALERT_TYPE_CONFIG[alert.alert_type]

  const statusColors = {
    active: 'border-red-500 bg-red-500/10',
    acknowledged: 'border-yellow-500 bg-yellow-500/10',
    responding: 'border-blue-500 bg-blue-500/10',
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        'cursor-pointer rounded-lg border-2 p-4 transition-all',
        statusColors[alert.status as keyof typeof statusColors],
        isSelected && 'ring-2 ring-primary',
        alert.status === 'active' && 'animate-border-pulse'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{typeConfig.icon}</span>
          <div>
            <p className="font-semibold text-white">{alert.agent_code}</p>
            <p className="text-sm text-gray-400">{alert.agent_name}</p>
          </div>
        </div>
        <span className={cn('rounded-full px-2 py-1 text-xs font-medium', priorityConfig.bgColor, 'text-white')}>
          {priorityConfig.label}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Clock className="h-4 w-4 text-gray-500" />
          {formatRelativeTime(alert.created_at)}
        </div>
        {alert.agent_zone && (
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <MapPin className="h-4 w-4 text-gray-500" />
            {alert.agent_zone}
          </div>
        )}
        {alert.agent_phone && (
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Phone className="h-4 w-4 text-gray-500" />
            {alert.agent_phone}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
        {alert.status === 'active' && (
          <button
            onClick={onAcknowledge}
            title="Reconocer alerta"
            className="flex-1 min-w-0 flex items-center justify-center gap-1 rounded-lg bg-yellow-600 px-2 py-2 text-xs font-medium text-white hover:bg-yellow-700 transition-colors"
          >
            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Reconocer</span>
          </button>
        )}
        {(alert.status === 'active' || alert.status === 'acknowledged') && (
          <button
            onClick={onRespond}
            title="Marcar en respuesta"
            className="flex-1 min-w-0 flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-2 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Truck className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Responder</span>
          </button>
        )}
        <button
          onClick={onResolve}
          title="Resolver alerta"
          className="flex-1 min-w-0 flex items-center justify-center gap-1 rounded-lg bg-green-600 px-2 py-2 text-xs font-medium text-white hover:bg-green-700 transition-colors"
        >
          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Resolver</span>
        </button>
      </div>
    </div>
  )
}

interface AlertPanelProps {
  selectedAlertId?: string
  onSelectAlert: (alertId: string | null) => void
}

export function AlertPanel({ selectedAlertId, onSelectAlert }: AlertPanelProps) {
  const { alerts, acknowledgeAlert, respondToAlert, resolveAlert } = useRealtimeAlerts()
  const { operator } = useAuth()
  const [resolving, setResolving] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  const handleAcknowledge = async (alertId: string) => {
    if (!operator) return
    await acknowledgeAlert(alertId, operator.id)
  }

  const handleRespond = async (alertId: string) => {
    if (!operator) return
    await respondToAlert(alertId, operator.id)
  }

  const handleResolve = async (alertId: string, isFalseAlarm: boolean = false) => {
    if (!operator) return
    await resolveAlert(alertId, operator.id, notes, isFalseAlarm)
    setResolving(null)
    setNotes('')
    onSelectAlert(null)
  }

  const activeAlerts = alerts.filter(a => a.status === 'active')
  const inProgressAlerts = alerts.filter(a => a.status === 'acknowledged' || a.status === 'responding')

  return (
    <div className="h-full overflow-hidden flex flex-col bg-background-card rounded-xl border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-danger" />
          Alertas Activas
          {alerts.length > 0 && (
            <span className="ml-auto rounded-full bg-danger px-2 py-0.5 text-xs font-bold">
              {alerts.length}
            </span>
          )}
        </h2>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <CheckCircle className="h-12 w-12 mb-2" />
            <p>Sin alertas activas</p>
          </div>
        ) : (
          <>
            {/* Active Alerts */}
            {activeAlerts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-red-400 uppercase tracking-wider">
                  Requieren Atención ({activeAlerts.length})
                </h3>
                {activeAlerts.map((alert) => (
                  <AlertCard
                    key={alert.alert_id}
                    alert={alert}
                    isSelected={selectedAlertId === alert.alert_id}
                    onSelect={() => onSelectAlert(alert.alert_id)}
                    onAcknowledge={() => handleAcknowledge(alert.alert_id)}
                    onRespond={() => handleRespond(alert.alert_id)}
                    onResolve={() => setResolving(alert.alert_id)}
                  />
                ))}
              </div>
            )}

            {/* In Progress Alerts */}
            {inProgressAlerts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-yellow-400 uppercase tracking-wider">
                  En Proceso ({inProgressAlerts.length})
                </h3>
                {inProgressAlerts.map((alert) => (
                  <AlertCard
                    key={alert.alert_id}
                    alert={alert}
                    isSelected={selectedAlertId === alert.alert_id}
                    onSelect={() => onSelectAlert(alert.alert_id)}
                    onAcknowledge={() => handleAcknowledge(alert.alert_id)}
                    onRespond={() => handleRespond(alert.alert_id)}
                    onResolve={() => setResolving(alert.alert_id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Resolve Modal */}
      {resolving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background-card rounded-xl p-6 w-full max-w-md border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Resolver Alerta</h3>
              <button
                onClick={() => setResolving(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas de resolución..."
              className="w-full h-32 rounded-lg bg-background border border-border p-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleResolve(resolving, true)}
                className="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Falsa Alarma
              </button>
              <button
                onClick={() => handleResolve(resolving, false)}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Resolver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
