'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Settings,
  Server,
  Users,
  Bell,
  Volume2,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import { DashboardLayout } from '@/components/UI/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { cn, formatDateTime } from '@/lib/utils'
import type { Operator } from '@/types'

const APP_VERSION = '1.0.0'

type ConnectionStatus = 'checking' | 'connected' | 'error'

export default function SettingsPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, loading, operator } = useAuth()
  const [operators, setOperators] = useState<Operator[]>([])
  const [loadingOperators, setLoadingOperators] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking')
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
    if (!loading && isAuthenticated && !isAdmin) {
      router.push('/')
    }
  }, [loading, isAuthenticated, isAdmin, router])

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      checkConnection()
      fetchOperators()
    }
  }, [isAuthenticated, isAdmin])

  const checkConnection = async () => {
    setConnectionStatus('checking')
    try {
      const { error } = await supabase.from('operators').select('id').limit(1)
      setConnectionStatus(error ? 'error' : 'connected')
    } catch {
      setConnectionStatus('error')
    }
    setLastChecked(new Date())
  }

  const fetchOperators = async () => {
    setLoadingOperators(true)
    try {
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .order('role', { ascending: true })
        .order('first_name', { ascending: true })

      if (error) throw error
      setOperators(data || [])
    } catch (err) {
      console.error('Error fetching operators:', err)
    } finally {
      setLoadingOperators(false)
    }
  }

  if (loading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="spinner h-16 w-16"></div>
      </div>
    )
  }

  const roleLabel: Record<string, string> = {
    admin: 'Administrador',
    supervisor: 'Supervisor',
    operator: 'Operador',
  }

  const roleBadgeClass: Record<string, string> = {
    admin: 'bg-primary/20 text-primary',
    supervisor: 'bg-blue-500/20 text-blue-400',
    operator: 'bg-gray-500/20 text-gray-400',
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2 md:text-2xl">
          <Settings className="h-6 w-6 text-primary md:h-7 md:w-7" />
          Configuracion del Sistema
        </h1>
        <p className="text-gray-400 mt-1 text-sm md:text-base">
          Panel de administracion y estado del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        {/* System Info */}
        <div className="bg-background-card rounded-xl border border-border p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-white md:text-lg">Informacion del Sistema</h2>
          </div>

          <div className="space-y-3 md:space-y-4">
            {/* App Version */}
            <div className="flex items-center justify-between py-2 border-b border-border md:py-3">
              <span className="text-gray-400 text-xs md:text-sm">Version de la aplicacion</span>
              <span className="text-white font-mono text-xs md:text-sm">v{APP_VERSION}</span>
            </div>

            {/* Supabase Connection */}
            <div className="flex items-center justify-between py-2 border-b border-border md:py-3">
              <span className="text-gray-400 text-xs md:text-sm">Conexion Supabase</span>
              <div className="flex items-center gap-2">
                {connectionStatus === 'checking' && (
                  <div className="flex items-center gap-1.5 text-yellow-400">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-xs md:text-sm">Verificando...</span>
                  </div>
                )}
                {connectionStatus === 'connected' && (
                  <div className="flex items-center gap-1.5 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs md:text-sm">Conectado</span>
                  </div>
                )}
                {connectionStatus === 'error' && (
                  <div className="flex items-center gap-1.5 text-red-400">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs md:text-sm">Error</span>
                  </div>
                )}
              </div>
            </div>

            {/* Realtime */}
            <div className="flex items-center justify-between py-2 border-b border-border md:py-3">
              <span className="text-gray-400 text-xs md:text-sm">Realtime</span>
              <span className="text-green-400 text-xs flex items-center gap-1.5 md:text-sm md:gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Activo
              </span>
            </div>

            {/* Operator Session */}
            <div className="flex items-center justify-between py-2 border-b border-border md:py-3">
              <span className="text-gray-400 text-xs md:text-sm">Sesion actual</span>
              <span className="text-white text-xs md:text-sm">
                {operator?.first_name} {operator?.last_name}
              </span>
            </div>

            {/* Last Check */}
            {lastChecked && (
              <div className="flex items-center justify-between py-2 md:py-3">
                <span className="text-gray-400 text-xs md:text-sm">Ultima verificacion</span>
                <span className="text-gray-300 text-xs font-mono md:text-sm">
                  {formatDateTime(lastChecked)}
                </span>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={checkConnection}
            disabled={connectionStatus === 'checking'}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={cn('h-4 w-4', connectionStatus === 'checking' && 'animate-spin')} />
            Verificar conexion
          </button>
        </div>

        {/* Alert Configuration Info */}
        <div className="bg-background-card rounded-xl border border-border p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-white md:text-lg">Configuracion de Alertas</h2>
          </div>

          <div className="space-y-3 md:space-y-4">
            {/* Sound Info */}
            <div className="p-3 bg-background rounded-lg border border-border md:p-4">
              <div className="flex items-center gap-2 mb-2 md:gap-3">
                <Volume2 className="h-5 w-5 text-primary shrink-0" />
                <span className="text-white font-medium text-sm">Sonido de alertas</span>
              </div>
              <p className="text-gray-400 text-xs md:text-sm">
                El control de sonido se encuentra en la barra superior (Header).
                Cuando esta activado, se reproduce un tono audible al recibir una nueva alerta de panico.
              </p>
            </div>

            {/* Notification Info */}
            <div className="p-3 bg-background rounded-lg border border-border md:p-4">
              <div className="flex items-center gap-2 mb-2 md:gap-3">
                <Bell className="h-5 w-5 text-blue-400 shrink-0" />
                <span className="text-white font-medium text-sm">Notificaciones del navegador</span>
              </div>
              <p className="text-gray-400 text-xs md:text-sm">
                Las notificaciones push del navegador se solicitan automaticamente al iniciar sesion.
                Asegurese de permitirlas para recibir alertas incluso cuando la ventana no esta en foco.
              </p>
            </div>

            {/* Realtime Info */}
            <div className="p-3 bg-background rounded-lg border border-border md:p-4">
              <div className="flex items-center gap-2 mb-2 md:gap-3">
                <RefreshCw className="h-5 w-5 text-green-400 shrink-0" />
                <span className="text-white font-medium text-sm">Actualizaciones en tiempo real</span>
              </div>
              <p className="text-gray-400 text-xs md:text-sm">
                El sistema utiliza suscripciones de Supabase Realtime para recibir alertas y
                actualizaciones de agentes al instante sin necesidad de recargar la pagina.
              </p>
            </div>
          </div>
        </div>

        {/* Operators List */}
        <div className="lg:col-span-2 bg-background-card rounded-xl border border-border p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-white md:text-lg">Operadores del Sistema</h2>
            </div>
            <span className="text-gray-400 text-xs md:text-sm">
              {operators.length} registrados
            </span>
          </div>

          {loadingOperators ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner h-8 w-8"></div>
            </div>
          ) : operators.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400">No se encontraron operadores</p>
            </div>
          ) : (
            <>
              {/* Mobile: Card layout */}
              <div className="space-y-3 md:hidden">
                {operators.map((op) => (
                  <div key={op.id} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-semibold shrink-0">
                      {op.first_name?.[0]}{op.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {op.first_name} {op.last_name}
                      </p>
                      <p className="text-gray-400 text-xs truncate">{op.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        roleBadgeClass[op.role] || 'bg-gray-500/20 text-gray-400'
                      )}>
                        {roleLabel[op.role] || op.role}
                      </span>
                      {op.is_active ? (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Activo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                          Inactivo
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-gray-400">
                      <th className="text-left py-3 px-4 font-medium">Operador</th>
                      <th className="text-left py-3 px-4 font-medium">Correo</th>
                      <th className="text-left py-3 px-4 font-medium">Rol</th>
                      <th className="text-left py-3 px-4 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operators.map((op) => (
                      <tr key={op.id} className="border-b border-border/50 hover:bg-background-hover transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-semibold">
                              {op.first_name?.[0]}{op.last_name?.[0]}
                            </div>
                            <span className="text-white font-medium">
                              {op.first_name} {op.last_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {op.email}
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            roleBadgeClass[op.role] || 'bg-gray-500/20 text-gray-400'
                          )}>
                            {roleLabel[op.role] || op.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {op.is_active ? (
                            <span className="flex items-center gap-1 text-green-400 text-xs">
                              <span className="h-2 w-2 rounded-full bg-green-500" />
                              Activo
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400 text-xs">
                              <span className="h-2 w-2 rounded-full bg-gray-500" />
                              Inactivo
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
