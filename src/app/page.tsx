'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/UI/DashboardLayout'
import { StatsBar } from '@/components/Dashboard/StatsBar'
import { AlertPanel } from '@/components/Dashboard/AlertPanel'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts'

// Dynamic import for map (client-side only)
const LiveMap = dynamic(
  () => import('@/components/Dashboard/LiveMap').then(mod => mod.LiveMap),
  { ssr: false, loading: () => <MapSkeleton /> }
)

function MapSkeleton() {
  return (
    <div className="h-full w-full rounded-xl bg-background-card border border-border flex items-center justify-center">
      <div className="text-center">
        <div className="spinner h-12 w-12 mx-auto mb-4"></div>
        <p className="text-gray-400">Cargando mapa...</p>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="spinner h-16 w-16 mx-auto mb-4"></div>
        <p className="text-gray-400">Cargando sistema...</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, loading, operator } = useAuth()
  const { newAlert, clearNewAlert } = useRealtimeAlerts()
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // Auto-select new alert
  useEffect(() => {
    if (newAlert) {
      setSelectedAlertId(newAlert.alert_id)
      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nueva Alerta de Panico', {
          body: `${newAlert.agent_code} - ${newAlert.agent_name}`,
          icon: '/logo.svg',
          tag: newAlert.alert_id,
        })
      }
      clearNewAlert()
    }
  }, [newAlert, clearNewAlert])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <LoadingScreen />
  }

  return (
    <DashboardLayout>
      {/* Stats */}
      <div className="mb-4 md:mb-6">
        <StatsBar />
      </div>

      {/* Main Content: Map + Alert Panel */}
      <div
        className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6"
        style={{ minHeight: 'calc(100vh - 220px)' }}
      >
        {/* Map - 2/3 on desktop */}
        <div className="lg:col-span-2 min-h-[300px] md:min-h-[400px]">
          <LiveMap
            selectedAlertId={selectedAlertId || undefined}
            onAgentClick={(agentId) => console.log('Agent clicked:', agentId)}
          />
        </div>

        {/* Alerts Panel - 1/3 on desktop */}
        <div className="min-h-[300px] md:min-h-[400px]">
          <AlertPanel
            selectedAlertId={selectedAlertId || undefined}
            onSelectAlert={setSelectedAlertId}
          />
        </div>
      </div>

      {/* New Alert Notification Banner */}
      {newAlert && (
        <div className="fixed bottom-4 right-4 left-4 z-50 md:left-auto md:max-w-md animate-slide-in">
          <div className="bg-danger rounded-lg p-4 shadow-2xl border border-danger-light">
            <div className="flex items-start gap-3">
              <span className="text-3xl animate-pulse">!</span>
              <div className="flex-1">
                <h4 className="font-bold text-white">NUEVA ALERTA DE PANICO</h4>
                <p className="text-red-100">
                  {newAlert.agent_code} - {newAlert.agent_name}
                </p>
                <p className="text-sm text-red-200 mt-1">
                  {newAlert.agent_zone || 'Ubicacion no especificada'}
                </p>
              </div>
              <button
                onClick={clearNewAlert}
                className="text-red-200 hover:text-white"
              >
                X
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
