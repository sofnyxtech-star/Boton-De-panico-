'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useAgents } from '@/hooks/useAgents'
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts'
import { AGENT_STATUS_CONFIG } from '@/types'
import { formatRelativeTime, formatBattery } from '@/lib/utils'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons (idempotente — seguro con StrictMode)
type LeafletIconDefault = L.Icon.Default & { _getIconUrl?: unknown }
delete (L.Icon.Default.prototype as LeafletIconDefault)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom icons for different statuses
const createIcon = (color: string, isEmergency: boolean = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="w-8 h-8 rounded-full ${color} border-2 border-white shadow-lg flex items-center justify-center ${isEmergency ? 'animate-pulse' : ''}">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
        </div>
        ${isEmergency ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>' : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

const statusIcons: Record<string, L.DivIcon> = {
  available: createIcon('bg-green-500'),
  patrolling: createIcon('bg-blue-500'),
  fixed_post: createIcon('bg-yellow-500'),
  emergency: createIcon('bg-red-500', true),
  offline: createIcon('bg-gray-500'),
}

// Component to fly to location
function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()

  useEffect(() => {
    map.flyTo([lat, lng], 16, { duration: 1 })
  }, [map, lat, lng])

  return null
}

interface LiveMapProps {
  selectedAlertId?: string
  onAgentClick?: (agentId: string) => void
}

export function LiveMap({ selectedAlertId, onAgentClick }: LiveMapProps) {
  const { agents } = useAgents()
  const { alerts } = useRealtimeAlerts()
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null)

  // Find the selected alert's location
  useEffect(() => {
    if (selectedAlertId) {
      const alert = alerts.find(a => a.alert_id === selectedAlertId)
      if (alert) {
        setFlyTo({ lat: alert.latitude, lng: alert.longitude })
      }
    }
  }, [selectedAlertId, alerts])

  // Filter agents with valid locations
  const agentsWithLocation = agents.filter(
    (agent) => agent.latitude !== null && agent.longitude !== null
  )

  // Default center (Lima, Peru)
  const defaultCenter: [number, number] = [-12.0464, -77.0428]

  // Calculate center based on agents or alerts
  const center = agentsWithLocation.length > 0
    ? [
        agentsWithLocation.reduce((sum, a) => sum + (a.latitude || 0), 0) / agentsWithLocation.length,
        agentsWithLocation.reduce((sum, a) => sum + (a.longitude || 0), 0) / agentsWithLocation.length,
      ] as [number, number]
    : defaultCenter

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={12}
        className="h-full w-full"
        style={{ background: '#1a1a2e' }}
      >
        {/* Dark Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Fly to selected alert */}
        {flyTo && <FlyToLocation lat={flyTo.lat} lng={flyTo.lng} />}

        {/* Agent Markers */}
        {agentsWithLocation.map((agent) => {
          const statusConfig = AGENT_STATUS_CONFIG[agent.status]
          const hasActiveAlert = alerts.some(a => a.agent_id === agent.id)

          return (
            <Marker
              key={agent.id}
              position={[agent.latitude!, agent.longitude!]}
              icon={statusIcons[hasActiveAlert ? 'emergency' : agent.status]}
              eventHandlers={{
                click: () => onAgentClick?.(agent.id),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{statusConfig.icon}</span>
                    <div>
                      <p className="font-bold">{agent.code}</p>
                      <p className="text-sm text-gray-600">{agent.full_name}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><strong>Estado:</strong> {statusConfig.label}</p>
                    {agent.agent_position && <p><strong>Cargo:</strong> {agent.agent_position}</p>}
                    {agent.assigned_zone && <p><strong>Zona:</strong> {agent.assigned_zone}</p>}
                    {agent.battery_level !== null && (
                      <p><strong>Batería:</strong> {formatBattery(agent.battery_level)}</p>
                    )}
                    {agent.last_update && (
                      <p><strong>Última actualización:</strong> {formatRelativeTime(agent.last_update)}</p>
                    )}
                  </div>
                  {hasActiveAlert && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-red-700 text-sm font-medium">
                      ⚠️ ALERTA ACTIVA
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

      </MapContainer>

      {/* Map Legend - solo desktop */}
      <div className="hidden md:block absolute bottom-4 left-4 z-[1000] bg-background-card/90 backdrop-blur rounded-lg p-3 border border-border">
        <p className="text-xs font-semibold text-gray-400 mb-2">LEYENDA</p>
        <div className="space-y-1">
          {Object.entries(AGENT_STATUS_CONFIG).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2 text-xs">
              <span>{config.icon}</span>
              <span className="text-gray-300">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Count */}
      <div className="absolute top-4 right-4 z-[1000] bg-background-card/90 backdrop-blur rounded-lg px-3 py-2 border border-border">
        <p className="text-sm text-white">
          <span className="font-bold text-primary">{agentsWithLocation.length}</span>
          <span className="text-gray-400"> agentes en mapa</span>
        </p>
      </div>
    </div>
  )
}
