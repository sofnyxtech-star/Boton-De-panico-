'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  Search,
  Filter,
  MapPin,
} from 'lucide-react'
import { DashboardLayout } from '@/components/UI/DashboardLayout'
import { AudioPlayer } from '@/components/Dashboard/AudioPlayer'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { ALERT_PRIORITY_CONFIG, ALERT_TYPE_CONFIG } from '@/types'
import { formatDateTime, formatSeconds, cn } from '@/lib/utils'
import type { Alert, AlertStatus } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-red-500/20 text-red-400',
  acknowledged: 'bg-yellow-500/20 text-yellow-400',
  responding: 'bg-blue-500/20 text-blue-400',
  resolved: 'bg-green-500/20 text-green-400',
  false_alarm: 'bg-gray-500/20 text-gray-400',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  acknowledged: 'Reconocida',
  responding: 'En respuesta',
  resolved: 'Resuelta',
  false_alarm: 'Falsa alarma',
}

export default function AlertsPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlerts()
    }
  }, [isAuthenticated])

  const fetchAlerts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('alerts')
      .select('*, agent:agents(*)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (!error && data) {
      setAlerts(data)
    }
    setLoading(false)
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="spinner h-16 w-16"></div>
      </div>
    )
  }

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.agent?.code?.toLowerCase().includes(search.toLowerCase()) ||
      alert.agent?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      alert.address?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusOptions: { value: AlertStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activas' },
    { value: 'acknowledged', label: 'Reconocidas' },
    { value: 'responding', label: 'En respuesta' },
    { value: 'resolved', label: 'Resueltas' },
    { value: 'false_alarm', label: 'Falsas alarmas' },
  ]

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2 md:text-2xl">
            <AlertTriangle className="h-6 w-6 text-primary md:h-7 md:w-7" />
            Historial de Alertas
          </h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">
            {alerts.length} alertas en el historial
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:gap-4 md:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por agente, ubicacion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background-card border border-border rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none text-sm md:py-3 md:text-base"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AlertStatus | 'all')}
            className="w-full px-3 py-2.5 bg-background-card border border-border rounded-lg text-white focus:border-primary focus:outline-none text-sm sm:w-auto md:px-4 md:py-3 md:text-base"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerts Content */}
      <div className="bg-background-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="spinner h-12 w-12 mx-auto"></div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron alertas</p>
          </div>
        ) : (
          <>
            {/* Mobile: Card layout */}
            <div className="divide-y divide-border md:hidden">
              {filteredAlerts.map((alert) => {
                const typeConfig = ALERT_TYPE_CONFIG[alert.alert_type]
                const priorityConfig = ALERT_PRIORITY_CONFIG[alert.priority]

                return (
                  <button
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className="w-full p-4 text-left hover:bg-background-hover transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{typeConfig.icon}</span>
                        <span className="text-white text-sm font-medium">{typeConfig.label}</span>
                      </div>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[alert.status])}>
                        {STATUS_LABELS[alert.status]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{alert.agent?.code}</p>
                        <p className="text-xs text-gray-400">
                          {alert.agent?.first_name} {alert.agent?.last_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', priorityConfig.bgColor, 'text-white')}>
                          {priorityConfig.label}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDateTime(alert.created_at)}
                        </p>
                      </div>
                    </div>
                    {alert.response_time_seconds && (
                      <p className="text-xs text-gray-500 mt-1">
                        Respuesta: {formatSeconds(alert.response_time_seconds)}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background">
                  <tr className="text-left text-sm text-gray-400">
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Agente</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Prioridad</th>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Respuesta</th>
                    <th className="px-4 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAlerts.map((alert) => {
                    const typeConfig = ALERT_TYPE_CONFIG[alert.alert_type]
                    const priorityConfig = ALERT_PRIORITY_CONFIG[alert.priority]

                    return (
                      <tr
                        key={alert.id}
                        className="hover:bg-background-hover cursor-pointer"
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{typeConfig.icon}</span>
                            <span className="text-white">{typeConfig.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-white font-medium">{alert.agent?.code}</p>
                            <p className="text-sm text-gray-400">
                              {alert.agent?.first_name} {alert.agent?.last_name}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', STATUS_COLORS[alert.status])}>
                            {STATUS_LABELS[alert.status]}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', priorityConfig.bgColor, 'text-white')}>
                            {priorityConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-300 text-sm">
                          {formatDateTime(alert.created_at)}
                        </td>
                        <td className="px-4 py-4 text-gray-300 text-sm">
                          {alert.response_time_seconds
                            ? formatSeconds(alert.response_time_seconds)
                            : '-'}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedAlert(alert)
                            }}
                            className="text-primary hover:text-primary-400 text-sm"
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-4">
          <div className="bg-background-card rounded-t-xl p-4 w-full border border-border max-h-[85vh] overflow-y-auto md:rounded-xl md:p-6 md:max-w-2xl md:max-h-[90vh]">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg font-semibold text-white md:text-xl">Detalle de Alerta</h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1 text-gray-400 hover:text-white"
              >
                X
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              {/* Agent Info */}
              <div className="space-y-3 md:space-y-4">
                <h4 className="text-sm font-medium text-gray-400 uppercase">Agente</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm md:w-12 md:h-12 md:text-base">
                    {selectedAlert.agent?.first_name?.[0]}{selectedAlert.agent?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm md:text-base">{selectedAlert.agent?.code}</p>
                    <p className="text-gray-400 text-sm">
                      {selectedAlert.agent?.first_name} {selectedAlert.agent?.last_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Alert Info */}
              <div className="space-y-3 md:space-y-4">
                <h4 className="text-sm font-medium text-gray-400 uppercase">Alerta</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ALERT_TYPE_CONFIG[selectedAlert.alert_type].icon}</span>
                    <span className="text-white">{ALERT_TYPE_CONFIG[selectedAlert.alert_type].label}</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Activado por: {selectedAlert.activation_method}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2 md:col-span-2">
                <h4 className="text-sm font-medium text-gray-400 uppercase">Ubicacion</h4>
                <div className="flex items-center gap-2 text-white text-sm md:text-base">
                  <MapPin className="h-5 w-5 text-gray-500 shrink-0" />
                  <span className="break-all">
                    {selectedAlert.address || `${selectedAlert.latitude}, ${selectedAlert.longitude}`}
                  </span>
                </div>
              </div>

              {/* Times */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400 uppercase">Tiempos</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">
                    <strong>Creada:</strong> {formatDateTime(selectedAlert.created_at)}
                  </p>
                  {selectedAlert.acknowledged_at && (
                    <p className="text-gray-300">
                      <strong>Reconocida:</strong> {formatDateTime(selectedAlert.acknowledged_at)}
                    </p>
                  )}
                  {selectedAlert.resolved_at && (
                    <p className="text-gray-300">
                      <strong>Resuelta:</strong> {formatDateTime(selectedAlert.resolved_at)}
                    </p>
                  )}
                  {selectedAlert.response_time_seconds && (
                    <p className="text-primary">
                      <strong>Tiempo de respuesta:</strong> {formatSeconds(selectedAlert.response_time_seconds)}
                    </p>
                  )}
                </div>
              </div>

              {/* Resolution */}
              {selectedAlert.resolution_notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400 uppercase">Resolucion</h4>
                  <p className="text-gray-300 text-sm">{selectedAlert.resolution_notes}</p>
                </div>
              )}

              {/* Audio */}
              {selectedAlert.audio_url && (
                <div className="space-y-2 md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-400 uppercase">Audio Grabado</h4>
                  <AudioPlayer
                    src={selectedAlert.audio_url}
                    duration={selectedAlert.audio_duration || undefined}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
