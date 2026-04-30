'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet'
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

const alertIcon = L.divIcon({
  className: 'alert-marker',
  html: `
    <div class="relative" style="width:48px;height:48px;">
      <div style="position:absolute;inset:0;background:rgba(239,68,68,0.4);border-radius:9999px;animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="position:absolute;inset:8px;background:#dc2626;border:3px solid white;border-radius:9999px;box-shadow:0 0 20px rgba(239,68,68,0.8);display:flex;align-items:center;justify-content:center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M12 2L1 21h22L12 2zm0 6l7.53 13H4.47L12 8zm-1 5v3h2v-3h-2zm0 4v2h2v-2h-2z"/></svg>
      </div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24],
})

// Component to fly to location
function FlyToLocation({ lat, lng, ts }: { lat: number; lng: number; ts: number }) {
  const map = useMap()

  useEffect(() => {
    map.flyTo([lat, lng], 17, { duration: 1.5 })
  }, [map, lat, lng, ts])

  return null
}

interface LiveMapProps {
  selectedAlertId?: string
  onAgentClick?: (agentId: string) => void
}

export function LiveMap({ selectedAlertId, onAgentClick }: LiveMapProps) {
  const { agents } = useAgents()
  const { alerts } = useRealtimeAlerts()
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; ts: number } | null>(null)

  // Auto-fly al seleccionar alerta o cuando llega una nueva alerta activa
  useEffect(() => {
    if (selectedAlertId) {
      const alert = alerts.find(a => a.alert_id === selectedAlertId)
      if (alert && alert.latitude && alert.longitude) {
        setFlyTo({ lat: Number(alert.latitude), lng: Number(alert.longitude), ts: Date.now() })
      }
    }
  }, [selectedAlertId, alerts])

  // Auto-fly a la alerta mas reciente activa al cargar el dashboard
  useEffect(() => {
    if (!selectedAlertId && alerts.length > 0) {
      const active = alerts.find(a => a.status === 'active')
      if (active && active.latitude && active.longitude) {
        setFlyTo({ lat: Number(active.latitude), lng: Number(active.longitude), ts: Date.now() })
      }
    }
  }, [alerts, selectedAlertId])

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
        <LayersControl position="topright">
          {/* Satelite hibrido (recomendado para mineria - ve cerros + nombres) */}
          <LayersControl.BaseLayer checked name="Satelite + Calles">
            <>
              <TileLayer
                attribution='Tiles &copy; Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={18}
                maxZoom={20}
              />
              <TileLayer
                attribution='Boundaries &copy; Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={18}
                maxZoom={20}
              />
            </>
          </LayersControl.BaseLayer>

          {/* Google Satellite (mejor calidad y cobertura en Peru, sin API key publica) */}
          <LayersControl.BaseLayer name="Satelital HD (Google)">
            <TileLayer
              attribution='Imagery &copy; Google'
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          {/* Google Hybrid - satelital con nombres de calles */}
          <LayersControl.BaseLayer name="Hibrido HD (Google)">
            <TileLayer
              attribution='Imagery &copy; Google'
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          {/* Topografico (muestra relieve y curvas de nivel) */}
          <LayersControl.BaseLayer name="Relieve / Topografico">
            <TileLayer
              attribution='Tiles &copy; OpenTopoMap'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              subdomains={['a', 'b', 'c']}
              maxNativeZoom={17}
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          {/* Mapa oscuro (modo original) */}
          <LayersControl.BaseLayer name="Mapa Oscuro">
            <TileLayer
              attribution='&copy; OpenStreetMap &copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Fly to selected alert */}
        {flyTo && <FlyToLocation lat={flyTo.lat} lng={flyTo.lng} ts={flyTo.ts} />}

        {/* Marcadores de Alertas Activas (encima de los agentes) */}
        {alerts
          .filter(a => a.latitude !== null && a.longitude !== null)
          .map((alert) => (
            <Marker
              key={`alert-${alert.alert_id}`}
              position={[Number(alert.latitude), Number(alert.longitude)]}
              icon={alertIcon}
              zIndexOffset={1000}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[220px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🆘</span>
                    <div>
                      <p className="font-bold text-red-600">ALERTA DE PANICO</p>
                      <p className="text-sm">{alert.agent_code} - {alert.agent_name}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><strong>Estado:</strong> {alert.status}</p>
                    <p><strong>Prioridad:</strong> {alert.priority}</p>
                    {alert.agent_zone && <p><strong>Zona:</strong> {alert.agent_zone}</p>}
                    {alert.agent_phone && <p><strong>Tel:</strong> {alert.agent_phone}</p>}
                    <p><strong>Coords:</strong> {Number(alert.latitude).toFixed(5)}, {Number(alert.longitude).toFixed(5)}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

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
      <div className="hidden md:block absolute bottom-4 left-4 z-[400] bg-background-card/90 backdrop-blur rounded-lg p-3 border border-border">
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
      <div className="absolute top-4 right-4 z-[400] bg-background-card/90 backdrop-blur rounded-lg px-3 py-2 border border-border">
        <p className="text-sm text-white">
          <span className="font-bold text-primary">{agentsWithLocation.length}</span>
          <span className="text-gray-400"> agentes en mapa</span>
        </p>
      </div>
    </div>
  )
}
